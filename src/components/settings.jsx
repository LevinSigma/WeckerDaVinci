import { useEffect, useState, useRef } from "react";
import "./settings.css";
import beepAudio from "../assets/beep.mp3";
import morningJoyAudio from "../assets/morningJoy.mp3";
import synapseAudio from "../assets/synapse.mp3";

export default function Settings() {
    const audioMap = {
        "beep": beepAudio,
        "morningJoy": morningJoyAudio,
        "synapse": synapseAudio,
    };

    const[isOpen, setIsOpen] = useState(false);
    const [savedSettings, setSavedSettings] = useState(null);
    const audioRef = useRef(null);
    const [songs] = useState([
        { name: "Beep", key: "beep", path: beepAudio },
        { name: "Morning Joy", key: "morningJoy", path: morningJoyAudio },
        { name: "Synapse", key: "synapse", path: synapseAudio },
    ]);

   const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("settings_darkMode") === "true";
  });
    const [volume, setVolume] = useState(() => {
        return Number(localStorage.getItem("settings_volume")) || 50;
    });
    
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem("settings_theme") || "light";
    });

    const [audio, setAudio] = useState(() => {
        const savedAudioKey = localStorage.getItem("settings_audio") || "beep";
        return audioMap[savedAudioKey] || beepAudio;
    });

    useEffect(() => {
        localStorage.setItem("settings_volume", volume);
    }, [volume]);


    useEffect(() => {
        localStorage.setItem("settings_theme", theme);
    }, [theme]);

    useEffect(() => {
        localStorage.setItem("settings_audio", Object.keys(audioMap).find(key => audioMap[key] === audio) || "beep");
    }, [audio]);

    const handleSave = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        localStorage.setItem("settings_volume", volume);
        localStorage.setItem("settings_audio", Object.keys(audioMap).find(key => audioMap[key] === audio) || "beep");
        localStorage.setItem("settings_darkMode", String(darkMode));

        setIsOpen(false);
    };

    useEffect(() => {
        const theme = darkMode ? "dark" : "light";
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("settings_darkMode", String(darkMode));
    }, [darkMode]);

const dontSave = () => {
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
    }
    if (savedSettings) {
      setVolume(savedSettings.volume);
      setDarkMode(savedSettings.darkMode);
      setAudio(savedSettings.audio);
    }
    setIsOpen(false);
  };
    const openModal = () => {
    setSavedSettings({
      volume: volume,
      darkMode: darkMode,
      audio: audio,
    });
    setIsOpen(true);
  };

    const playPreview = (path) => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        audioRef.current = new Audio(path);
        audioRef.current.volume = volume / 100;
        audioRef.current.play().catch(err => console.error("Fehler beim Abspielen:", err));
    };

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume / 100;
        }
    }, [volume]);
    

return (
    <>
      <div className="settings">
        <button onClick={openModal}>Einstellungen</button>
      </div>

      {isOpen && (
        <div className="modal-overlay" onClick={dontSave}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="h2">Einstellungen</h2>
            
            <p className="p">Lautstärke ({volume}%)</p>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
            />

            <div className="setting-row">
              <span className="setting-label">Dark Mode</span>
              <label className="switch" htmlFor="dark-mode-toggle">
                <input
                  id="dark-mode-toggle"
                  type="checkbox"
                  checked={darkMode}
                  onChange={() => setDarkMode(!darkMode)}
                  aria-label="Toggle dark mode"
                />
                <span className="slider round"></span>
              </label>
            </div>

            <div className="setting-row">
              <span className="setting-label">Audio:</span>
              <select value={Object.keys(audioMap).find(key => audioMap[key] === audio) || "beep"} onChange={(e) => {
                const selectedAudio = audioMap[e.target.value];
                setAudio(selectedAudio);
                playPreview(selectedAudio);
              }}>
                <option value="beep">
                  Beep
                </option>
                <option value="morningJoy">
                  Morning Joy
                </option>
                <option value="synapse">
                  Synapse
                </option>
              </select>
         </div>
            <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
              <button onClick={handleSave}>Speichern</button>
              <button onClick={dontSave}>Abbrechen</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
    
