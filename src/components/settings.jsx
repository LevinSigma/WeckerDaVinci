import { useEffect, useState, useRef } from "react";
import "./settings.css";
import { DEFAULT_SOUND_KEY, SOUND_LIBRARY, getSoundKeyForPath, getSoundPath } from "../audioLibrary.js";

export default function Settings() {
    const audioMap = Object.fromEntries(SOUND_LIBRARY.map((sound) => [sound.key, sound.path]));

    const[isOpen, setIsOpen] = useState(false);
    const [savedSettings, setSavedSettings] = useState(null);
    const audioRef = useRef(null);

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
        const savedAudioKey = localStorage.getItem("settings_audio") || DEFAULT_SOUND_KEY;
        return getSoundPath(savedAudioKey);
    });

    useEffect(() => {
        localStorage.setItem("settings_volume", volume);
    }, [volume]);


    useEffect(() => {
        localStorage.setItem("settings_theme", theme);
    }, [theme]);

    useEffect(() => {
        localStorage.setItem("settings_audio", getSoundKeyForPath(audio));
    }, [audio]);

    const handleSave = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        localStorage.setItem("settings_volume", volume);
        localStorage.setItem("settings_audio", getSoundKeyForPath(audio));
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
        <button
          type="button"
          className="settings-trigger"
          onClick={openModal}
          aria-label="Einstellungen öffnen"
        >
          ⚙
        </button>
      </div>

      {isOpen && (
        <div className="modal-overlay" onClick={dontSave}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h4>Einstellungen</h4>

            <p className="settings-volume-label">Lautstärke ({volume}%)</p>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              aria-label="Lautstärke"
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
              <select
                className="setting-select"
                value={getSoundKeyForPath(audio)}
                onChange={(e) => {
                  const selectedAudio = audioMap[e.target.value];
                  setAudio(selectedAudio);
                  playPreview(selectedAudio);
                }}
              >
                {SOUND_LIBRARY.map((sound) => (
                  <option key={sound.key} value={sound.key}>
                    {sound.name}
                  </option>
                ))}
              </select>
         </div>

            <div className="button-group-right">
              <button onClick={dontSave} className="btn-secondary">
                Abbrechen
              </button>
              <button onClick={handleSave} className="btn-primary">
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
    
