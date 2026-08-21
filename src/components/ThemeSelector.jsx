import { THEME_LIBRARY } from "../themeLibrary.js";

export default function ThemeSelector({ value, onChange }) {
    return (
        <div className="theme-selector" role="radiogroup" aria-label="Theme auswählen">
            {THEME_LIBRARY.map((theme) => {
                const [bg1, bg2, accent, accent2] = theme.swatch;
                const selected = value === theme.key;
                return (
                    <button
                        key={theme.key}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        className={`theme-option ${selected ? "selected" : ""}`}
                        style={{
                            "--sw-1": bg1,
                            "--sw-2": bg2,
                            "--sw-3": accent,
                            "--sw-4": accent2,
                        }}
                        onClick={() => onChange(theme.key)}
                    >
                        <span className="theme-option-preview">
                            <span className="theme-option-dot" />
                        </span>
                        <span className="theme-option-icon" aria-hidden="true">{theme.icon}</span>
                        <span className="theme-option-name">{theme.name}</span>
                    </button>
                );
            })}
        </div>
    );
}
