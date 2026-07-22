import { useEffect, useRef, useState } from "react";
import { useAlarms } from "../AlarmContext.jsx";
import { getSelectedSoundPath, getSelectedVolume } from "../audioLibrary.js";

const PI_BASE_URL = import.meta.env.VITE_PI_ALARM_URL || "http://raspberrypi.local:5000";

export default function LightsCard() {
    const [status, setStatus] = useState({ scheinwerfer1: false, scheinwerfer2: false, beacon: false, fan: false });
    const [loading, setLoading] = useState(false);
    const [reachable, setReachable] = useState(true);
    const [testPlaying, setTestPlaying] = useState(false);
    const testAudioRef = useRef(null);
    const { ringing } = useAlarms();

    useEffect(() => {
        fetchStatus();
    }, []);

    useEffect(() => {
        if (ringing) stopTest();
    }, [ringing]);

    useEffect(() => () => stopTest(), []);

    async function fetchStatus() {
        try {
            const res = await fetch(`${PI_BASE_URL}/status`);
            const data = await res.json();
            setStatus(data);
            setReachable(true);
        } catch (error) {
            console.warn("Steuerung nicht erreichbar:", error);
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
            console.warn("Steuerung nicht erreichbar:", error);
            setReachable(false);
        } finally {
            setLoading(false);
        }
    }

    function stopTest() {
        if (testAudioRef.current) {
            testAudioRef.current.pause();
            testAudioRef.current.currentTime = 0;
            testAudioRef.current = null;
        }
        setTestPlaying(false);
    }

    function toggleTest() {
        if (testPlaying) {
            stopTest();
            return;
        }

        const audio = new Audio(getSelectedSoundPath());
        audio.loop = true;
        audio.volume = getSelectedVolume();
        audio.addEventListener("ended", () => setTestPlaying(false));
        testAudioRef.current = audio;
        void audio.play().catch((error) => {
            console.warn("Testton konnte nicht abgespielt werden:", error);
        });
        setTestPlaying(true);
    }

    const deviceToggles = [
        { key: "scheinwerfer1", label: "Licht 1", icon: "💡", on: status.scheinwerfer1, onClick: () => callEndpoint("/toggle/1") },
        { key: "scheinwerfer2", label: "Licht 2", icon: "💡", on: status.scheinwerfer2, onClick: () => callEndpoint("/toggle/2") },
        { key: "beacon", label: "Blitz", icon: "🚨", on: status.beacon, onClick: () => callEndpoint("/beacon/toggle") },
        { key: "fan", label: "Wind", icon: "🌀", on: status.fan, onClick: () => callEndpoint("/fan/toggle") },
    ];

    return (
        <div className="lights-widget">
            {!reachable && (
                <p className="empty-state">Steuerung nicht erreichbar. Läuft der Server auf dem Raspberry Pi?</p>
            )}

            <div className="toggle-grid">
                {deviceToggles.map((toggle) => (
                    <button
                        key={toggle.key}
                        type="button"
                        className={`toggle-chip ${toggle.on ? "on" : ""}`}
                        onClick={toggle.onClick}
                        disabled={loading}
                        aria-pressed={toggle.on}
                        aria-label={`${toggle.label} ${toggle.on ? "ausschalten" : "einschalten"}`}
                    >
                        <span className="toggle-chip-icon" aria-hidden="true">{toggle.icon}</span>
                        <span className="toggle-chip-label">{toggle.label}</span>
                    </button>
                ))}

                <button
                    type="button"
                    className={`toggle-chip toggle-chip--wide ${testPlaying ? "on" : ""}`}
                    onClick={toggleTest}
                    aria-pressed={testPlaying}
                    aria-label={testPlaying ? "Sound-Test stoppen" : "Sound-Test abspielen"}
                >
                    <span className="toggle-chip-icon" aria-hidden="true">🔊</span>
                    <span className="toggle-chip-label">{testPlaying ? "Stopp" : "Sound-Test"}</span>
                </button>
            </div>
        </div>
    );
}
