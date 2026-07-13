import { useEffect, useRef, useState } from "react";
import "./alarm.css";

export default function AlarmErstellen({ visible, onClose, onSave }) {
    const labelRef = useRef(null);
    const [selectedTime, setSelectedTime] = useState("07:00");
    const [seconds, setSeconds] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [timerInput, setTimerInput] = useState("");

    useEffect(() => {
        let timer = null;
        if (isActive && seconds > 0) {
            timer = window.setTimeout(() => {
                setSeconds((current) => current - 1);
            }, 1000);
        } else if (isActive && seconds === 0) {
            setIsActive(false);
            window.alert("Wecker ist abgelaufen!");
        }
        return () => window.clearTimeout(timer);
    }, [isActive, seconds]);

    if (!visible) return null;

    function changeTime(kind, delta) {
        const [hours, minutes] = selectedTime.split(":").map(Number);
        let nextHours = hours;
        let nextMinutes = minutes;

        if (kind === "hours") {
            nextHours = (hours + delta + 24) % 24;
        } else {
            nextMinutes = (minutes + delta + 60) % 60;
        }

        setSelectedTime(`${String(nextHours).padStart(2, "0")}:${String(nextMinutes).padStart(2, "0")}`);
    }

    function save() {
        const labelValue = labelRef.current?.value || "Wecker";
        const normalizedTime = selectedTime.length === 5 ? selectedTime : `${selectedTime.slice(0, 2)}:${selectedTime.slice(2)}`;
        onSave && onSave({ time: normalizedTime, label: labelValue });
        onClose && onClose();
    }

    const startTimer = () => {
        const value = Number(timerInput);
        if (!Number.isFinite(value) || value <= 0) {
            window.alert("Bitte gib eine gültige Zahl in Sekunden ein.");
            return;
        }

        setSeconds(value);
        setIsActive(true);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h4>Neuer Wecker</h4>

                <div className="time-entry-block">
                    <label className="time-label">Uhrzeit</label>
                    <div className="touch-time-picker" aria-label="Uhrzeit wählen">
                        <div className="time-column">
                            <button className="step-button" onClick={() => changeTime("hours", 1)}>
                                ▲
                            </button>
                            <div className="time-value">{selectedTime.split(":")[0]}</div>
                            <button className="step-button" onClick={() => changeTime("hours", -1)}>
                                ▼
                            </button>
                        </div>
                        <div className="time-separator">:</div>
                        <div className="time-column">
                            <button className="step-button" onClick={() => changeTime("minutes", 1)}>
                                ▲
                            </button>
                            <div className="time-value">{selectedTime.split(":")[1]}</div>
                            <button className="step-button" onClick={() => changeTime("minutes", -1)}>
                                ▼
                            </button>
                        </div>
                    </div>
                    <input
                        type="time"
                        className="time-input-native"
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                    />
                </div>

                <input ref={labelRef} placeholder="Beschreibung" className="label-input" />

                <div className="button-group-right">
                    <button onClick={onClose} className="btn-secondary">
                        Schließen
                    </button>
                    <button onClick={save} className="btn-primary">
                        Speichern
                    </button>
                </div>

                <hr className="separator" />

                <div className="timer-section">
                    <h4>Timer ({seconds}s)</h4>
                    <div className="input-group">
                        <input
                            type="number"
                            placeholder="Sekunden"
                            value={timerInput}
                            onChange={(e) => setTimerInput(e.target.value)}
                            className="timer-input-field"
                        />
                        <button onClick={startTimer} className="btn-timer">
                            Timer starten
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}