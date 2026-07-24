import { useState } from "react";
import { useAlarms } from "../AlarmContext.jsx";

const MAX_MINUTES = 99;

function formatDuration(totalSeconds) {
    const safeSeconds = Math.max(totalSeconds, 0);
    const minutes = Math.floor(safeSeconds / 60);
    const seconds = safeSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function TimerWidget() {
    const {
        timerEndAt,
        timerRemaining,
        timerPaused,
        startTimer,
        pauseTimer,
        resumeTimer,
        resetTimer,
        stopTimer,
    } = useAlarms();

    const [minutes, setMinutes] = useState(5);
    const [seconds, setSeconds] = useState(0);

    const isRunning = timerEndAt != null;
    const isActive = isRunning || timerPaused;

    function changeMinutes(delta) {
        setMinutes((current) => (current + delta + (MAX_MINUTES + 1)) % (MAX_MINUTES + 1));
    }

    function changeSeconds(delta) {
        setSeconds((current) => (current + delta + 60) % 60);
    }

    function handleStart() {
        const total = minutes * 60 + seconds;
        if (total <= 0) return;
        startTimer(total);
    }

    if (!isActive) {
        return (
            <div className="timer-widget">
                <div className="time-entry-block">
                    <label className="time-label">Dauer</label>
                    <div className="touch-time-picker" aria-label="Timer-Dauer wählen">
                        <div className="time-column">
                            <button type="button" className="step-button" onClick={() => changeMinutes(1)} aria-label="Minuten erhöhen">
                                ▲
                            </button>
                            <div className="time-value">{String(minutes).padStart(2, "0")}</div>
                            <button type="button" className="step-button" onClick={() => changeMinutes(-1)} aria-label="Minuten verringern">
                                ▼
                            </button>
                        </div>
                        <div className="time-separator">:</div>
                        <div className="time-column">
                            <button type="button" className="step-button" onClick={() => changeSeconds(1)} aria-label="Sekunden erhöhen">
                                ▲
                            </button>
                            <div className="time-value">{String(seconds).padStart(2, "0")}</div>
                            <button type="button" className="step-button" onClick={() => changeSeconds(-1)} aria-label="Sekunden verringern">
                                ▼
                            </button>
                        </div>
                    </div>
                </div>
                <button
                    type="button"
                    className="touch-button primary large"
                    onClick={handleStart}
                    disabled={minutes === 0 && seconds === 0}
                >
                    Start
                </button>
            </div>
        );
    }

    return (
        <div className="timer-widget">
            <div className="timer-countdown">{formatDuration(timerRemaining)}</div>
            <div className="timer-status">{isRunning ? "Timer läuft" : "Pausiert"}</div>
            <div className="timer-controls">
                {isRunning ? (
                    <button type="button" className="touch-button secondary" onClick={pauseTimer}>
                        Pause
                    </button>
                ) : (
                    <button type="button" className="touch-button primary" onClick={resumeTimer}>
                        Fortsetzen
                    </button>
                )}
                <button type="button" className="touch-button secondary" onClick={resetTimer}>
                    Zurücksetzen
                </button>
            </div>
            <button type="button" className="touch-button danger" onClick={stopTimer}>
                Stopp
            </button>
        </div>
    );
}
