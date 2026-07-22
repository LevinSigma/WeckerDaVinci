import { useEffect, useMemo, useState } from "react";
import { useAlarms } from "../AlarmContext.jsx";
import { useDragScroll } from "../useDragScroll.js";



export default function ClockWidget() {
    const [time, setTime] = useState(new Date());
    const { timerEndAt, timerRemaining, cancelTimer } = useAlarms();
    const scrollRef = useDragScroll("y");

    useEffect(() => {
        const interval = window.setInterval(() => setTime(new Date()), 1000);
        return () => window.clearInterval(interval);
    }, []);


    const formattedTime = useMemo(
        () =>
            time.toLocaleTimeString("de-DE", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
            }),
        [time]
    );

    const formattedDate = useMemo(
        () =>
            time.toLocaleDateString("de-DE", {
                weekday: "long",
                day: "2-digit",
                month: "long",
            }),
        [time]
    );

const [dailyQuote, setDailyQuote] = useState({ text: "", author: "" });

    useEffect(() => {
        fetch("https://dummyjson.com/quotes/random")
            .then((res) => res.json())
            .then((data) => setDailyQuote({ text: data.quote, author: data.author }))
            .catch((err) => {
                if (err.name !== "AbortError") {
                    console.error("Fehler beim Abrufen des Zitats:", err);
                }
            });
    }, []);

    const formattedTimerRemaining = useMemo(() => {
        const totalSeconds = Math.max(timerRemaining, 0);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }, [timerRemaining]);

    return (
        <div className="clock-widget" ref={scrollRef}>
            <div className="clock-display">{formattedTime}</div>
            <div className="clock-date">{formattedDate}</div>

            {timerEndAt != null && (
                <div className="quote-card timer-running-card">
                    <span className="quote-author">Timer läuft</span>
                    <div className="clock-display timer-remaining">{formattedTimerRemaining}</div>
                    <button type="button" className="touch-button secondary" onClick={cancelTimer}>
                        Timer abbrechen
                    </button>
                </div>
            )}

            <div className="quote-card">
                <div className="quote-mark">“</div>
                <p className="quote-text">{dailyQuote.text}</p>
                <span className="quote-author">{dailyQuote.author}</span>
            </div>
        </div>
    );
}
