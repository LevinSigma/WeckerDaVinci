import { useEffect, useState } from "react";
import "./alarm.css";

const PI_BASE_URL = import.meta.env.VITE_PI_ALARM_URL || "http://raspberrypi.local:5000";

export default function LightsCard() {
    const [status, setStatus] = useState({ scheinwerfer1: false, scheinwerfer2: false });
    const [loading, setLoading] = useState(false);
    const [reachable, setReachable] = useState(true);

    useEffect(() => {
        fetchStatus();
    }, []);

    async function fetchStatus() {
        try {
            const res = await fetch(`${PI_BASE_URL}/status`);
            const data = await res.json();
            setStatus(data);
            setReachable(true);
        } catch (error) {
            console.warn("Lichtsteuerung nicht erreichbar:", error);
            setReachable(false);
        }
    }

    async function callEndpoint(path) {
        setLoading(true);
        try {
            const res = await fetch(`${PI_BASE_URL}${path}`);
            const data = await res.json();
            setStatus(data);
            setReachable(true);
        } catch (error) {
            console.warn("Lichtsteuerung nicht erreichbar:", error);
            setReachable(false);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="page-card">
            <h2>Lichtsteuerung</h2>

            {!reachable && (
                <p className="empty-state">Lichtsteuerung nicht erreichbar. Läuft der Server auf dem Raspberry Pi?</p>
            )}

            <div className="alarm-list">
                <div className="alarm-item">
                    <div>
                        <div className="alarm-time">Scheinwerfer 1</div>
                        <div className="alarm-label">{status.scheinwerfer1 ? "An" : "Aus"}</div>
                    </div>
                    <button
                        className={`touch-button ${status.scheinwerfer1 ? "primary" : "secondary"}`}
                        onClick={() => callEndpoint("/toggle/1")}
                        disabled={loading}
                    >
                        {status.scheinwerfer1 ? "Ausschalten" : "Einschalten"}
                    </button>
                </div>

                <div className="alarm-item">
                    <div>
                        <div className="alarm-time">Scheinwerfer 2</div>
                        <div className="alarm-label">{status.scheinwerfer2 ? "An" : "Aus"}</div>
                    </div>
                    <button
                        className={`touch-button ${status.scheinwerfer2 ? "primary" : "secondary"}`}
                        onClick={() => callEndpoint("/toggle/2")}
                        disabled={loading}
                    >
                        {status.scheinwerfer2 ? "Ausschalten" : "Einschalten"}
                    </button>
                </div>
            </div>

            <div className="alarm-actions">
                <button className="touch-button primary" onClick={() => callEndpoint("/alle-an")} disabled={loading}>
                    Alle An
                </button>
                <button className="touch-button secondary" onClick={() => callEndpoint("/alle-aus")} disabled={loading}>
                    Alle Aus
                </button>
            </div>
        </div>
    );
}
