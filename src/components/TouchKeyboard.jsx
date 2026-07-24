import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useKeyboard } from "../KeyboardContext.jsx";

const ROWS = [
    ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
    ["Q", "W", "E", "R", "T", "Z", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["Y", "X", "C", "V", "B", "N", "M", "Ä", "Ö", "Ü"],
];

export default function TouchKeyboard() {
    const { activeField, closeKeyboard } = useKeyboard();
    const [shift, setShift] = useState(false);

    useEffect(() => {
        document.body.classList.toggle("keyboard-open", activeField != null);
        return () => document.body.classList.remove("keyboard-open");
    }, [activeField]);

    if (!activeField || typeof document === "undefined") return null;

    function pressKey(key) {
        activeField.onInsert(shift ? key.toUpperCase() : key.toLowerCase());
    }

    function handleDone() {
        activeField.onDone && activeField.onDone();
        closeKeyboard();
    }

    return createPortal(
        <div className="touch-keyboard" role="group" aria-label="Bildschirmtastatur">
            {activeField.label && <div className="touch-keyboard-label">{activeField.label}</div>}
            <div className="touch-keyboard-rows">
                {ROWS.map((row, index) => (
                    <div className="touch-keyboard-row" key={index}>
                        {row.map((key) => (
                            <button
                                type="button"
                                key={key}
                                className="touch-keyboard-key"
                                onClick={() => pressKey(key)}
                            >
                                {shift ? key.toUpperCase() : key.toLowerCase()}
                            </button>
                        ))}
                    </div>
                ))}
                <div className="touch-keyboard-row touch-keyboard-actions">
                    <button
                        type="button"
                        className={`touch-keyboard-key touch-keyboard-key--wide ${shift ? "active" : ""}`}
                        onClick={() => setShift((current) => !current)}
                        aria-pressed={shift}
                        aria-label="Umschalttaste"
                    >
                        ⇧
                    </button>
                    <button
                        type="button"
                        className="touch-keyboard-key touch-keyboard-key--space"
                        onClick={() => activeField.onInsert(" ")}
                        aria-label="Leerzeichen"
                    >
                        Leerzeichen
                    </button>
                    <button
                        type="button"
                        className="touch-keyboard-key touch-keyboard-key--wide"
                        onClick={() => activeField.onBackspace()}
                        aria-label="Zeichen löschen"
                    >
                        ⌫
                    </button>
                    <button
                        type="button"
                        className="touch-keyboard-key touch-keyboard-key--done"
                        onClick={handleDone}
                    >
                        Fertig
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
