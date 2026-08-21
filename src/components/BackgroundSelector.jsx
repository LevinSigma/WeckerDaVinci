import { BACKGROUND_LIBRARY } from "../backgroundLibrary.js";

export default function BackgroundSelector({ value, onChange }) {
    return (
        <div className="background-selector" role="radiogroup" aria-label="Hintergrund auswählen">
            {BACKGROUND_LIBRARY.map((background) => {
                const selected = value === background.key;
                return (
                    <button
                        key={background.key}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        className={`background-option ${selected ? "selected" : ""}`}
                        onClick={() => onChange(background.key)}
                    >
                        <span
                            className={`background-option-preview ${background.image ? "" : "background-option-preview--standard"}`}
                            style={background.image ? { backgroundImage: `url(${background.image})` } : undefined}
                        />
                        <span className="background-option-icon" aria-hidden="true">{background.icon}</span>
                        <span className="background-option-name">{background.name}</span>
                    </button>
                );
            })}
        </div>
    );
}
