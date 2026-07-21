import { createPortal } from "react-dom";
import { useAlarms } from "../AlarmContext.jsx";
import "./alarmPopup.css";

export default function AlarmPopup() {
    const { ringing, stop, snooze } = useAlarms();

    if (!ringing || typeof document === "undefined") return null;

    return createPortal(
        <div className="alarm-ring-overlay">
            <div className="alarm-ring-card">
                <h3>{ringing.type === "timer" ? "Timer abgelaufen!" : "Wecker klingelt!"}</h3>
                <p className="alarm-ring-label">{ringing.label}</p>
                {ringing.time && <div className="alarm-times">{ringing.time}</div>}

                <div className="alarm-touch-actions">
                    <button className="touch-button primary large" onClick={stop}>
                        Stopp
                    </button>
                    {ringing.type === "alarm" && (
                        <button className="touch-button secondary large" onClick={snooze}>
                            Snooze
                        </button>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}
