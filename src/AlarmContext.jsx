import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { getSelectedSoundPath, getSelectedVolume } from "./audioLibrary.js";

const STORAGE_KEY = "davinci-alarms";
const SNOOZE_MS = 5 * 60 * 1000;

const AlarmContext = createContext(null);

function loadAlarms() {
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function currentMinuteKey(date) {
    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
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

export function AlarmProvider({ children }) {
    const [alarms, setAlarms] = useState(loadAlarms);
    const [ringing, setRinging] = useState(null); // { type: "alarm" | "timer", label, time }
    const [snoozeUntil, setSnoozeUntil] = useState(null);
    const [lastTriggeredMinute, setLastTriggeredMinute] = useState(null);
    const [timerEndAt, setTimerEndAt] = useState(null);
    const [timerRemaining, setTimerRemaining] = useState(0);
    const audioRef = useRef(null);

    useEffect(() => {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(alarms));
    }, [alarms]);

    useEffect(() => {
        const interval = window.setInterval(() => {
            const now = new Date();

            if (timerEndAt != null) {
                const remainingMs = timerEndAt - now.getTime();
                if (remainingMs <= 0) {
                    setTimerEndAt(null);
                    setTimerRemaining(0);
                    setRinging((current) => current ?? { type: "timer", label: "Timer", time: "" });
                } else {
                    setTimerRemaining(Math.ceil(remainingMs / 1000));
                }
            }

            if (snoozeUntil && now.getTime() < snoozeUntil) {
                return;
            }
            if (snoozeUntil && now.getTime() >= snoozeUntil) {
                setSnoozeUntil(null);
            }

            if (ringing) {
                return;
            }

            const minuteKey = currentMinuteKey(now);
            if (lastTriggeredMinute === minuteKey) {
                return;
            }

            const ringingAlarm = alarms.find((alarm) => alarm.active && alarm.time === minuteKey);
            if (ringingAlarm) {
                setLastTriggeredMinute(minuteKey);
                setRinging({ type: "alarm", label: ringingAlarm.label, time: ringingAlarm.time, id: ringingAlarm.id });
                void notifyPi("/alarm/trigger", { label: ringingAlarm.label, time: ringingAlarm.time });
            }
        }, 1000);

        return () => window.clearInterval(interval);
    }, [alarms, ringing, snoozeUntil, lastTriggeredMinute, timerEndAt]);

    useEffect(() => {
        if (!ringing) {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
                audioRef.current = null;
            }
            return;
        }

        const audio = new Audio(getSelectedSoundPath());
        audio.loop = true;
        audio.volume = getSelectedVolume();
        audioRef.current = audio;
        void audio.play().catch((error) => {
            console.warn("Alarmton konnte nicht abgespielt werden:", error);
        });

        return () => {
            audio.pause();
            audio.currentTime = 0;
        };
    }, [ringing]);

    const addAlarm = useCallback((alarm) => {
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
    }, []);

    const toggleAlarm = useCallback((id) => {
        setAlarms((current) => current.map((alarm) => (alarm.id === id ? { ...alarm, active: !alarm.active } : alarm)));
    }, []);

    const deleteAlarm = useCallback((id) => {
        setAlarms((current) => current.filter((alarm) => alarm.id !== id));
        setRinging((current) => (current?.id === id ? null : current));
    }, []);

    const startTimer = useCallback((seconds) => {
        setTimerEndAt(Date.now() + seconds * 1000);
        setTimerRemaining(seconds);
    }, []);

    const cancelTimer = useCallback(() => {
        setTimerEndAt(null);
        setTimerRemaining(0);
    }, []);

    const stop = useCallback(() => {
        const now = new Date();
        setLastTriggeredMinute(currentMinuteKey(now));
        setSnoozeUntil(null);
        void notifyPi("/alarm/stop", { label: ringing?.label || "Wecker" });
        setRinging(null);
    }, [ringing]);

    const snooze = useCallback(() => {
        if (!ringing) return;
        const now = new Date();
        setLastTriggeredMinute(currentMinuteKey(now));
        setSnoozeUntil(Date.now() + SNOOZE_MS);
        void notifyPi("/alarm/snooze", { label: ringing.label, time: ringing.time });
        setRinging(null);
    }, [ringing]);

    const value = {
        alarms,
        addAlarm,
        toggleAlarm,
        deleteAlarm,
        ringing,
        stop,
        snooze,
        timerEndAt,
        timerRemaining,
        startTimer,
        cancelTimer,
    };

    return <AlarmContext.Provider value={value}>{children}</AlarmContext.Provider>;
}

export function useAlarms() {
    const context = useContext(AlarmContext);
    if (!context) {
        throw new Error("useAlarms must be used within an AlarmProvider");
    }
    return context;
}
