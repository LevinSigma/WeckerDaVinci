import { useState } from "react";
import { createPortal } from "react-dom";
import { useDragScroll } from "../useDragScroll.js";
import { useKeyboard } from "../KeyboardContext.jsx";

export default function AlarmErstellen({ visible, onClose, onSave }) {
    const [selectedTime, setSelectedTime] = useState("07:00");
    const [label, setLabel] = useState("");
    const contentRef = useDragScroll("y");
    const { openKeyboard } = useKeyboard();

    if (!visible || typeof document === "undefined") return null;

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
        const normalizedTime = selectedTime.length === 5 ? selectedTime : `${selectedTime.slice(0, 2)}:${selectedTime.slice(2)}`;
        onSave && onSave({ time: normalizedTime, label: label.trim() || "Wecker" });
        onClose && onClose();
    }

    return createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" ref={contentRef} onClick={(e) => e.stopPropagation()}>
                <h4>Neuer Wecker</h4>

                <div className="time-entry-block">
                    <label className="time-label">Uhrzeit</label>
                    <div className="touch-time-picker" aria-label="Uhrzeit wählen">
                        <div className="time-column">
                            <button type="button" className="step-button" onClick={() => changeTime("hours", 1)}>
                                ▲
                            </button>
                            <div className="time-value">{selectedTime.split(":")[0]}</div>
                            <button type="button" className="step-button" onClick={() => changeTime("hours", -1)}>
                                ▼
                            </button>
                        </div>
                        <div className="time-separator">:</div>
                        <div className="time-column">
                            <button type="button" className="step-button" onClick={() => changeTime("minutes", 1)}>
                                ▲
                            </button>
                            <div className="time-value">{selectedTime.split(":")[1]}</div>
                            <button type="button" className="step-button" onClick={() => changeTime("minutes", -1)}>
                                ▼
                            </button>
                        </div>
                    </div>
                </div>

                <input
                    placeholder="Beschreibung"
                    className="label-input"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    onFocus={() =>
                        openKeyboard({
                            label: "Beschreibung",
                            onInsert: (char) => setLabel((current) => current + char),
                            onBackspace: () => setLabel((current) => current.slice(0, -1)),
                            onDone: () => {},
                        })
                    }
                />

                <div className="button-group-right">
                    <button type="button" onClick={onClose} className="btn-secondary">
                        Schließen
                    </button>
                    <button type="button" onClick={save} className="btn-primary">
                        Speichern
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
