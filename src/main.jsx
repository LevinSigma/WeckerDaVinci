import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AlarmCard from './components/AlarmCard.jsx'
import WeatherCard from './components/WeatherCard.jsx'

import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
      <AlarmCard />
      <WeatherCard />
  </StrictMode>,
)
