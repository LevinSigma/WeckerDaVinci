import { useEffect, useMemo, useState } from "react";
import AlarmErstellen from "./AlarmErstellen.jsx";
import WeatherCard from "./WeatherCard.jsx";
import LightsCard from "./LightsCard.jsx";
import "./alarm.css";

const quotes = [
    { text: "Heute ist ein guter Tag, um ruhig zu beginnen.", author: "Daily Calm" },
    { text: "Kleine Schritte bringen große Veränderungen.", author: "Morgenroutine" },
    { text: "Ein stiller Anfang macht den Tag klarer.", author: "Sinnvoll leben" },
    { text: "Ruhe ist keine Pause, sondern ein guter Beginn.", author: "Tagesenergie" },
    { text: "Die beste Zeit, anzufangen, ist jetzt.", author: "Tagesmotto" },
];

export default function AlarmCard() {
    const [showOverlay, setShowOverlay] = useState(false);
    const [time, setTime] = useState(new Date());
    const [alarms, setAlarms] = useState([]);
    const [activeAlarm, setActiveAlarm] = useState(null);
    const [snoozeUntil, setSnoozeUntil] = useState(null);
    const [currentView, setCurrentView] = useState("time");
    const [lastTriggeredMinute, setLastTriggeredMinute] = useState(null);

    useEffect(() => {
        const interval = window.setInterval(() => {
            const now = new Date();
            setTime(now);

            const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
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

            const ringingAlarm = alarms.find((alarm) => {
                if (!alarm.active) return false;
                const [alarmHours, alarmMinutes] = alarm.time.split(":").map(Number);
                const [nowHours, nowMinutes] = currentTime.split(":").map(Number);
                return alarmHours === nowHours && alarmMinutes === nowMinutes;
            });

            if (ringingAlarm) {
                setLastTriggeredMinute(currentMinuteKey);
                setActiveAlarm(ringingAlarm);
                void notifyPi("/alarm/trigger", {
                    label: ringingAlarm.label,
                    time: ringingAlarm.time,
                });
            }
        }, 1000);

        return () => window.clearInterval(interval);
    }, [activeAlarm, alarms, lastTriggeredMinute, snoozeUntil]);

    const formattedTime = useMemo(() =>
        time.toLocaleTimeString("de-DE", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        }),
        [time]
    );

    const dailyQuote = useMemo(() => {
        const dateKey = time.toISOString().slice(0, 10);
        const index = Array.from(dateKey).reduce((sum, char) => sum + char.charCodeAt(0), 0) % quotes.length;
        return quotes[index];
    }, [time]);

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

        setAlarms((current) => [...current, newAlarm]);
        setCurrentView("time");
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
        void notifyPi("/alarm/stop", { label: alarmToStop?.label || "Wecker" });
    }

    function handleSnooze() {
        if (!activeAlarm) return;

        const now = new Date();
        const currentMinuteKey = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

        setSnoozeUntil(Date.now() + 5 * 60 * 1000);
        setActiveAlarm(null);
        setLastTriggeredMinute(currentMinuteKey);
        void notifyPi("/alarm/snooze", { label: activeAlarm.label, time: activeAlarm.time });
    }

    function handleDeleteAlarm(id) {
        setAlarms((current) => current.filter((alarm) => alarm.id !== id));

        if (activeAlarm?.id === id) {
            setActiveAlarm(null);
            setSnoozeUntil(null);
        }
    }

    function renderView() {
        if (currentView === "alarms") {
            return (
                <div className="page-card">
                    <h2>Wecker stellen</h2>
                    <div className="alarm-actions">
                        <button className="touch-button primary" onClick={() => setShowOverlay(true)}>
                            Neuer Wecker
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
                                        <span className="alarm-status">{alarm.active ? "Aktiv" : "Stumm"}</span>
                                        <button className="delete-button" onClick={() => handleDeleteAlarm(alarm.id)}>
                                            Löschen
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            );
        }

        if (currentView === "weather") {
            return (
                <div className="page-card">
                    <WeatherCard />
                </div>
            );
        }

        if (currentView === "lights") {
            return <LightsCard />;
        }

        return (
            <div className="page-card">
                <h2>Uhrzeit</h2>
                <div className="clock-display">{formattedTime}</div>
                <div className="quote-card">
                    <div className="quote-mark">“</div>
                    <p className="quote-text">{dailyQuote.text}</p>
                    <span className="quote-author">{dailyQuote.author}</span>
                </div>
                <p className="helper-text">Tippe auf „Wecker stellen“, um die Zeit und den Alarm zu pflegen.</p>
            </div>
        );
    }

    return (
        <div className="alarm-screen">
            <div className="nav-tabs">
                <button
                    className={`nav-tab ${currentView === "time" ? "active" : ""}`}
                    onClick={() => setCurrentView("time")}
                >
                    Zeit
                </button>
                <button
                    className={`nav-tab ${currentView === "alarms" ? "active" : ""}`}
                    onClick={() => setCurrentView("alarms")}
                >
                    Wecker
                </button>
                <button
                    className={`nav-tab ${currentView === "weather" ? "active" : ""}`}
                    onClick={() => setCurrentView("weather")}
                >
                    Wetter
                </button>
                <button
                    className={`nav-tab ${currentView === "lights" ? "active" : ""}`}
                    onClick={() => setCurrentView("lights")}
                >
                    Licht
                </button>
            </div>

            {renderView()}

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
