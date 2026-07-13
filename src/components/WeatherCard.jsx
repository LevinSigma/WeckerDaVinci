import React, { useState, useEffect } from 'react';

export default function WetterZuerich() {
  const [wetter, setWetter] = useState([]);

  useEffect(() => {
    fetch("https://api.open-meteo.com/v1/forecast?latitude=47.37&longitude=8.54&daily=temperature_2m_max&timezone=Europe%2FZurich")
      .then(res => res.json())
      .then(data => setWetter(data.daily.temperature_2m_max));
  }, []);

  const getWeekday = (index) => {
    const days = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
    const today = new Date();
    const dayIndex = (today.getDay() + index) % 7;
    return days[dayIndex];
  }

return (
    <div>
      <h2>Wetter in Zürich:</h2>
      <ul>
        {wetter.map((temp, index) => (
          <li key={index}>
            <strong>{getWeekday(index)}:</strong> {temp}°C
          </li>
        ))}
      </ul>
    </div>
  );
}