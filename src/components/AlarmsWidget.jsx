import { useState } from "react";
import AlarmErstellen from "./AlarmErstellen.jsx";
import { useAlarms } from "../AlarmContext.jsx";

export default function AlarmsWidget() {
    const [showOverlay, setShowOverlay] = useState(false);
    const { alarms, addAlarm, toggleAlarm, deleteAlarm, ringing, startTimer } = useAlarms();

    function handleSave(alarm) {
        addAlarm(alarm);
        setShowOverlay(false);
    }

    return (
        <div className="alarms-widget">
            <div className="alarm-actions">
                <button className="touch-button primary" onClick={() => setShowOverlay(true)}>
                    Wecker hinzufügen
                </button>
            </div>

            <div className="alarm-list">
                {alarms.length === 0 ? (
                    <p className="empty-state">Keine Wecker vorhanden</p>
                ) : (
                    alarms.map((alarm) => (
                        <div
                            key={alarm.id}
                            className={`alarm-item ${ringing?.id === alarm.id ? "ringing" : ""}`}
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
                                    onClick={() => toggleAlarm(alarm.id)}
                                >
                                    <span className="toggle-knob" />
                                </button>
                                <button className="delete-button" onClick={() => deleteAlarm(alarm.id)}>
                                    Löschen
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <AlarmErstellen
                visible={showOverlay}
                onClose={() => setShowOverlay(false)}
                onSave={handleSave}
                onStartTimer={startTimer}
            />
        </div>
    );
}
