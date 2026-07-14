import { useEffect, useRef, useState } from "react";
import AlarmErstellen from "./AlarmErstellen.jsx";
import alarmSound from "../assets/dragon-studio-alarm-going-off-494307.mp3";

const STORAGE_KEY = "davinci-alarms";

function loadAlarms() {
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

export default function AlarmsWidget() {
    const [showOverlay, setShowOverlay] = useState(false);
    const [alarms, setAlarms] = useState(loadAlarms);
    const [activeAlarm, setActiveAlarm] = useState(null);
    const [snoozeUntil, setSnoozeUntil] = useState(null);
    const [lastTriggeredMinute, setLastTriggeredMinute] = useState(null);
    const alarmAudioRef = useRef(null);

    useEffect(() => {
        alarmAudioRef.current = new Audio(alarmSound);
        alarmAudioRef.current.loop = true;

        return () => {
            if (alarmAudioRef.current) {
                alarmAudioRef.current.pause();
                alarmAudioRef.current.currentTime = 0;
            }
        };
    }, []);

    useEffect(() => {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(alarms));
    }, [alarms]);

    useEffect(() => {
        const interval = window.setInterval(() => {
            const now = new Date();
            const currentMinuteKey = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

            if (snoozeUntil && now.getTime() < snoozeUntil) {
                return;
            }

            if (snoozeUntil && now.getTime() >= snoozeUntil) {
                setSnoozeUntil(null);
            }

            if (activeAlarm) {
                return;
            }

            if (lastTriggeredMinute === currentMinuteKey) {
                return;
            }

            const ringingAlarm = alarms.find((alarm) => alarm.active && alarm.time === currentMinuteKey);

            if (ringingAlarm) {
                setLastTriggeredMinute(currentMinuteKey);
                setActiveAlarm(ringingAlarm);
                void notifyPi("/alarm/trigger", {
                    label: ringingAlarm.label,
                    time: ringingAlarm.time,
                });

                if (alarmAudioRef.current) {
                    void alarmAudioRef.current.play().catch((error) => {
                        console.warn("Alarmton konnte nicht abgespielt werden:", error);
                    });
                }
            }
        }, 1000);

        return () => window.clearInterval(interval);
    }, [activeAlarm, alarms, lastTriggeredMinute, snoozeUntil]);

    function handleSave(alarm) {
        if (!alarm?.time) return;

        const [hours, minutes] = alarm.time.split(":").map(Number);
        const normalizedTime = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

        const newAlarm = {
            id: `${normalizedTime}-${Date.now()}`,
            time: normalizedTime,
            label: alarm.label || "Wecker",
            active: true,
        };

        setAlarms((current) => [...current, newAlarm].sort((a, b) => a.time.localeCompare(b.time)));
        setShowOverlay(false);
    }

    async function notifyPi(path, payload = {}) {
        const baseUrl = import.meta.env.VITE_PI_ALARM_URL || "http://raspberrypi.local:5000";

        try {
            await fetch(`${baseUrl}${path}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
        } catch (error) {
            console.warn("Pi alarm endpoint not reachable:", error);
        }
    }

    function handleStop() {
        const alarmToStop = activeAlarm;
        const now = new Date();
        const currentMinuteKey = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

        setActiveAlarm(null);
        setSnoozeUntil(null);
        setLastTriggeredMinute(currentMinuteKey);
        if (alarmAudioRef.current) {
            alarmAudioRef.current.pause();
            alarmAudioRef.current.currentTime = 0;
        }
        void notifyPi("/alarm/stop", { label: alarmToStop?.label || "Wecker" });
    }

    function handleSnooze() {
        if (!activeAlarm) return;

        const now = new Date();
        const currentMinuteKey = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

        setSnoozeUntil(Date.now() + 5 * 60 * 1000);
        setActiveAlarm(null);
        setLastTriggeredMinute(currentMinuteKey);
        if (alarmAudioRef.current) {
            alarmAudioRef.current.pause();
            alarmAudioRef.current.currentTime = 0;
        }
        void notifyPi("/alarm/snooze", { label: activeAlarm.label, time: activeAlarm.time });
    }

    function handleToggleAlarm(id) {
        setAlarms((current) =>
            current.map((alarm) => (alarm.id === id ? { ...alarm, active: !alarm.active } : alarm))
        );
    }

    function handleDeleteAlarm(id) {
        setAlarms((current) => current.filter((alarm) => alarm.id !== id));

        if (activeAlarm?.id === id) {
            setActiveAlarm(null);
            setSnoozeUntil(null);
        }
    }

    return (
        <div className="alarms-widget">
            <div className="alarm-actions">
                <button className="touch-button primary" onClick={() => setShowOverlay(true)}>
                    + Neuer Wecker
                </button>
            </div>

            <div className="alarm-list">
                {alarms.length === 0 ? (
                    <p className="empty-state">Noch keine Wecker gespeichert.</p>
                ) : (
                    alarms.map((alarm) => (
                        <div
                            key={alarm.id}
                            className={`alarm-item ${activeAlarm?.id === alarm.id ? "ringing" : ""}`}
                        >
                            <div>
                                <div className="alarm-time">{alarm.time}</div>
                                <div className="alarm-label">{alarm.label}</div>
                            </div>
                            <div className="alarm-item-actions">
                                <button
                                    type="button"
                                    className={`toggle-switch ${alarm.active ? "on" : ""}`}
                                    role="switch"
                                    aria-checked={alarm.active}
                                    aria-label={`Wecker ${alarm.label} ${alarm.active ? "deaktivieren" : "aktivieren"}`}
                                    onClick={() => handleToggleAlarm(alarm.id)}
                                >
                                    <span className="toggle-knob" />
                                </button>
                                <button className="delete-button" onClick={() => handleDeleteAlarm(alarm.id)}>
                                    Löschen
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {activeAlarm && (
                <div className="alarm-overlay">
                    <div className="alarm-ring-card">
                        <h3>Wecker läuft</h3>
                        <p className="alarm-ring-label">{activeAlarm.label}</p>
                        <div className="alarm-times">{activeAlarm.time}</div>

                        <div className="alarm-touch-actions">
                            <button className="touch-button primary large" onClick={handleStop}>
                                Stopp
                            </button>
                            <button className="touch-button secondary large" onClick={handleSnooze}>
                                5 Min später
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <AlarmErstellen
                visible={showOverlay}
                onClose={() => setShowOverlay(false)}
                onSave={handleSave}
            />
        </div>
    );
}
