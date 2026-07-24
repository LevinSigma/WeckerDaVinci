import { createContext, useCallback, useContext, useState } from "react";

const KeyboardContext = createContext(null);

export function KeyboardProvider({ children }) {
    const [activeField, setActiveField] = useState(null);

    const openKeyboard = useCallback((field) => {
        setActiveField(field);
    }, []);

    const closeKeyboard = useCallback(() => {
        setActiveField(null);
    }, []);

    const value = { activeField, openKeyboard, closeKeyboard };

    return <KeyboardContext.Provider value={value}>{children}</KeyboardContext.Provider>;
}

export function useKeyboard() {
    const context = useContext(KeyboardContext);
    if (!context) {
        throw new Error("useKeyboard must be used within a KeyboardProvider");
    }
    return context;
}
