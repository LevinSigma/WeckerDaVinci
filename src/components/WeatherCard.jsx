import { useEffect, useState } from "react";
import { useDragScroll } from "../useDragScroll.js";

const WEEKDAYS = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];

export default function WeatherCard() {
    const [temperatures, setTemperatures] = useState(null);
    const [error, setError] = useState(false);
    const scrollRef = useDragScroll("y");

    useEffect(() => {
        fetch(
            "https://api.open-meteo.com/v1/forecast?latitude=47.37&longitude=8.54&daily=temperature_2m_max&timezone=Europe%2FZurich"
        )
            .then((res) => res.json())
            .then((data) => setTemperatures(data.daily.temperature_2m_max))
            .catch(() => setError(true));
    }, []);

    function getWeekday(index) {
        const today = new Date();
        const dayIndex = (today.getDay() + index) % 7;
        return WEEKDAYS[dayIndex];
    }

    if (error) {
        return <p className="empty-state">Wetterdaten nicht verfügbar.</p>;
    }

    if (!temperatures) {
        return <p className="empty-state">Lade Wetterdaten…</p>;
    }

    return (
        <div className="weather-widget" ref={scrollRef}>
            <div className="weather-today">
                <span className="weather-today-temp">{Math.round(temperatures[0])}°</span>
                <span className="weather-today-label">Zürich, heute</span>
            </div>
            <ul className="weather-forecast">
                {temperatures.slice(1, 5).map((temp, index) => (
                    <li key={index} className="weather-forecast-item">
                        <span className="weather-day">{getWeekday(index + 1)}</span>
                        <span className="weather-temp">{Math.round(temp)}°C</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
