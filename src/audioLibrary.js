import beepAudio from "./assets/beep.mp3";
import morningJoyAudio from "./assets/morningJoy.mp3";
import synapseAudio from "./assets/synapse.mp3";

export const DEFAULT_SOUND_KEY = "beep";

export const SOUND_LIBRARY = [
    { key: "beep", name: "Beep", path: beepAudio },
    { key: "morningJoy", name: "Morning Joy", path: morningJoyAudio },
    { key: "synapse", name: "Synapse", path: synapseAudio },
];

const soundPathByKey = Object.fromEntries(SOUND_LIBRARY.map((sound) => [sound.key, sound.path]));

export function getSoundPath(key) {
    return soundPathByKey[key] || soundPathByKey[DEFAULT_SOUND_KEY];
}

export function getSoundKeyForPath(path) {
    return SOUND_LIBRARY.find((sound) => sound.path === path)?.key || DEFAULT_SOUND_KEY;
}

export function getSelectedSoundPath() {
    const key = window.localStorage.getItem("settings_audio") || DEFAULT_SOUND_KEY;
    return getSoundPath(key);
}

export function getSelectedVolume() {
    const stored = Number(window.localStorage.getItem("settings_volume"));
    const normalized = Number.isFinite(stored) ? stored : 50;
    return Math.min(Math.max(normalized, 0), 100) / 100;
}
