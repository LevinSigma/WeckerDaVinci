import { useEffect, useMemo, useState } from "react";



export default function ClockWidget() {
    const [time, setTime] = useState(new Date());

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

    return (
        <div className="clock-widget">
            <div className="clock-display">{formattedTime}</div>
            <div className="clock-date">{formattedDate}</div>
            <div className="quote-card">
                <div className="quote-mark">“</div>
                <p className="quote-text">{dailyQuote.text}</p>
                <span className="quote-author">{dailyQuote.author}</span>
            </div>
        </div>
    );
}
