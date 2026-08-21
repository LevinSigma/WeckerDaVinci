import beepAudio from "./assets/beep.mp3";
import morningJoyAudio from "./assets/morningJoy.mp3";
import synapseAudio from "./assets/synapse.mp3";
import beeps700HzAudio from "./assets/beeps700Hz.mp3";
import alarmBellAudio from "./assets/alarmBell.mp3";
import starDustAudio from "./assets/starDust.mp3";
import superMario64Audio from "./assets/superMario64.mp3";
import ringtone022Audio from "./assets/ringtone022.mp3";
import ringtone025Audio from "./assets/ringtone025.mp3";
import gangnamStyleAudio from "./assets/gangnamStyle.mp3";
import intoxicatedAudio from "./assets/intoxicated.mp3";
import justDanceAudio from "./assets/justDance.mp3";

export const DEFAULT_SOUND_KEY = "beep";

export const SOUND_LIBRARY = [
    { key: "beep", name: "Beep", path: beepAudio },
    { key: "morningJoy", name: "Morning Joy", path: morningJoyAudio },
    { key: "synapse", name: "Synapse", path: synapseAudio },
    { key: "beeps700Hz", name: "700 Hz Beeps", path: beeps700HzAudio },
    { key: "alarmBell", name: "Alarm Bell", path: alarmBellAudio },
    { key: "starDust", name: "Star Dust", path: starDustAudio },
    { key: "superMario64", name: "Super Mario 64", path: superMario64Audio },
    { key: "ringtone022", name: "Ringtone 022", path: ringtone022Audio },
    { key: "ringtone025", name: "Ringtone 025", path: ringtone025Audio },
    { key: "gangnamStyle", name: "Gangnam Style", path: gangnamStyleAudio },
    { key: "intoxicated", name: "Intoxicated", path: intoxicatedAudio },
    { key: "justDance", name: "Just Dance", path: justDanceAudio },
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
