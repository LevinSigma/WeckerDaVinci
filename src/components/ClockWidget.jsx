import { useEffect, useMemo, useState } from "react";

const quotes = [
    { text: "Heute ist ein guter Tag, um ruhig zu beginnen.", author: "Daily Calm" },
    { text: "Kleine Schritte bringen große Veränderungen.", author: "Morgenroutine" },
    { text: "Ein stiller Anfang macht den Tag klarer.", author: "Sinnvoll leben" },
    { text: "Ruhe ist keine Pause, sondern ein guter Beginn.", author: "Tagesenergie" },
    { text: "Die beste Zeit, anzufangen, ist jetzt.", author: "Tagesmotto" },
];

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

    const dailyQuote = useMemo(() => {
        const dateKey = time.toISOString().slice(0, 10);
        const index = Array.from(dateKey).reduce((sum, char) => sum + char.charCodeAt(0), 0) % quotes.length;
        return quotes[index];
    }, [time]);

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
