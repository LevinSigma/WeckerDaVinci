import { useEffect, useState, useRef } from "react";
import "./settings.css";
import { DEFAULT_SOUND_KEY, SOUND_LIBRARY, getSoundKeyForPath, getSoundPath } from "../audioLibrary.js";
import { resolveStoredThemeKey } from "../themeLibrary.js";
import { useDragScroll } from "../useDragScroll.js";
import ThemeSelector from "./ThemeSelector.jsx";

export default function Settings() {
    const audioMap = Object.fromEntries(SOUND_LIBRARY.map((sound) => [sound.key, sound.path]));

    const[isOpen, setIsOpen] = useState(false);
    const [savedSettings, setSavedSettings] = useState(null);
    const audioRef = useRef(null);
    const contentRef = useDragScroll("y");

    const [theme, setTheme] = useState(() => resolveStoredThemeKey());
    const [volume, setVolume] = useState(() => {
        return Number(localStorage.getItem("settings_volume")) || 50;
    });

    const [audio, setAudio] = useState(() => {
        const savedAudioKey = localStorage.getItem("settings_audio") || DEFAULT_SOUND_KEY;
        return getSoundPath(savedAudioKey);
    });

    useEffect(() => {
        localStorage.setItem("settings_volume", volume);
    }, [volume]);

    useEffect(() => {
        localStorage.setItem("settings_audio", getSoundKeyForPath(audio));
    }, [audio]);

    // Applies (and persists) immediately, same as before - so switching in
    // the modal already previews live, and "Abbrechen" reverts it again.
    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("settings_theme", theme);
    }, [theme]);

    const handleSave = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        localStorage.setItem("settings_volume", volume);
        localStorage.setItem("settings_audio", getSoundKeyForPath(audio));
        localStorage.setItem("settings_theme", theme);

        setIsOpen(false);
    };

const dontSave = () => {
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
    }
    if (savedSettings) {
      setVolume(savedSettings.volume);
      setTheme(savedSettings.theme);
      setAudio(savedSettings.audio);
    }
    setIsOpen(false);
  };
    const openModal = () => {
    setSavedSettings({
      volume: volume,
      theme: theme,
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
          <div className="modal-content" ref={contentRef} onClick={(e) => e.stopPropagation()}>
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

            <div className="setting-row setting-row-theme">
              <span className="setting-label">Theme</span>
              <ThemeSelector value={theme} onChange={setTheme} />
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
