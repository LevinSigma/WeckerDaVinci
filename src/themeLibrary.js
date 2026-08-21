export const DEFAULT_THEME_KEY = "light";

// swatch = [bg1, bg2, accent, accent2], used only for the static mini-preview
// in the theme selector - independent of which theme is currently active.
export const THEME_LIBRARY = [
    { key: "light", name: "Light", icon: "☀️", swatch: ["#eef1fa", "#ffffff", "#6a4dff", "#0891b2"] },
    { key: "dark", name: "Dark", icon: "🌑", swatch: ["#0b0f1d", "#141a30", "#7c6bff", "#22d3ee"] },
    { key: "colorful", name: "Colorful", icon: "🌈", swatch: ["#f2ecff", "#fff5fa", "#7c3aed", "#ec4899"] },
    { key: "night", name: "Night", icon: "🌙", swatch: ["#1a120b", "#241a10", "#e8973a", "#c66a2e"] },
];

const themeKeys = THEME_LIBRARY.map((theme) => theme.key);

export function isValidThemeKey(key) {
    return themeKeys.includes(key);
}

// Pre-selector rollout only had an on/off "settings_darkMode" flag; carry that
// choice forward once instead of silently resetting everyone to light.
export function resolveStoredThemeKey() {
    const stored = window.localStorage.getItem("settings_theme");
    if (isValidThemeKey(stored)) return stored;
    if (window.localStorage.getItem("settings_darkMode") === "true") return "dark";
    return DEFAULT_THEME_KEY;
}
