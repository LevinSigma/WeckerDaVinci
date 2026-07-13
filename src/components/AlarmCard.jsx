import {useState, useEffect} from "react";
import AlarmErstellen from "./AlarmErstellen.jsx";
import wetter from "./WeatherCard.jsx";


export default function AlarmCard() {
    const [showOverlay, setShowOverlay] = useState(false);
    const [time, setTime] = useState(new Date());
    useEffect(() => {
        const interval = setInterval(() => {
            setTime(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const formattedTime = time.toLocaleTimeString();

    function handleSave(alarm) {
        console.log("Neuer Wecker:", alarm);
        setShowOverlay(false);
    }

    return (
        <>

            <div style={{fontSize: "2rem", fontFamily: "monospace"}}>
                {formattedTime}
            </div>
            <button onClick={() => setShowOverlay(true)}>Neu</button>
            <button>+</button>

            <AlarmErstellen
                visible={showOverlay}
                onClose={() => setShowOverlay(false)}
                onSave={handleSave}
            />
        </>
    )
}








