import natureImage from "./assets/backgroundsNew/nature.jpg";
import beachImage from "./assets/backgroundsNew/beach.jpg";
import cityImage from "./assets/backgroundsNew/city.jpg";

export const DEFAULT_BACKGROUND_KEY = "standard";

export const BACKGROUND_LIBRARY = [
    { key: "standard", name: "Standard", icon: "✨", image: null },
    { key: "nature", name: "Natur", icon: "🌿", image: natureImage },
    { key: "beach", name: "Beach", icon: "🏖️", image: beachImage },
    { key: "city", name: "City", icon: "🏙️", image: cityImage },
];

const backgroundKeys = BACKGROUND_LIBRARY.map((background) => background.key);

export function isValidBackgroundKey(key) {
    return backgroundKeys.includes(key);
}

export function resolveStoredBackgroundKey() {
    const stored = window.localStorage.getItem("settings_background");
    return isValidBackgroundKey(stored) ? stored : DEFAULT_BACKGROUND_KEY;
}

// Single place that actually applies a background choice to the app - both
// the settings modal and (on load) the app entry point call this instead of
// each screen carrying its own background logic.
export function applyBackground(key) {
    const background = BACKGROUND_LIBRARY.find((entry) => entry.key === key) || BACKGROUND_LIBRARY[0];
    const root = document.documentElement;

    if (background.image) {
        // The scrim colors come from the *currently active* theme's own
        // --bg-scrim-1/-2 variables (see index.css), so the photo stays
        // readable and tonally matches whichever of the 4 themes is active,
        // without this function needing to know anything about themes.
        root.style.setProperty("--bg-scrim-layer", "linear-gradient(180deg, var(--bg-scrim-1), var(--bg-scrim-2))");
        root.style.setProperty("--bg-photo-layer", `url(${background.image})`);
    } else {
        root.style.setProperty("--bg-scrim-layer", "none");
        root.style.setProperty("--bg-photo-layer", "none");
    }

    root.setAttribute("data-background", background.key);
}
