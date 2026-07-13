import { useRef, useState, useEffect } from "react";
import "./alarm.css"; 

export default function AlarmErstellen({ visible, onClose, onSave }) {
    const timeRef = useRef(null);
    const labelRef = useRef(null);
    const [eingabe, setEingabe] = useState('');
    const [seconds, setSeconds] = useState(0);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        let timer = null;
        if (isActive && seconds > 0) {
            timer = setTimeout(() => {
                setSeconds(seconds - 1);
            }, 1000);
        } else if (isActive && seconds === 0) {
            setIsActive(false);
            alert("Wecker ist abgelaufen!");
        }
        return () => clearTimeout(timer);
    }, [isActive, seconds]);

    if (!visible) return null;

    function save() {
        onSave && onSave({ time: timeRef.current.value, label: labelRef.current.value, sekunden: eingabe });
        onClose && onClose();
    }

    const startTimer = () => {
        setSeconds(Number(eingabe));
        setIsActive(true);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                
                <h4>Neuer Wecker</h4>
                <div className="input-group">
                    <input ref={timeRef} type="time" className="time-input" />
                    <input ref={labelRef} placeholder="Beschreibung" className="label-input" />
                </div>
                
                <div className="button-group-right">
                    <button onClick={onClose} className="btn-secondary">Schließen</button>
                    <button onClick={save} className="btn-primary">Speichern</button>
                </div>

                <hr className="separator" />

                <div className="timer-section">
                    <h4>Timer ({seconds}s)</h4>
                    <div className="input-group">
                        <input
                            type="number"
                            placeholder="Sekunden"
                            value={eingabe}
                            onChange={(e) => setEingabe(e.target.value)}
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