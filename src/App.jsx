import { useEffect, useState } from "react";
import "./App.css";
import WidgetShell from "./components/WidgetShell.jsx";
import WidgetPicker from "./components/WidgetPicker.jsx";
import ClockWidget from "./components/ClockWidget.jsx";
import AlarmsWidget from "./components/AlarmsWidget.jsx";
import WeatherCard from "./components/WeatherCard.jsx";
import LightsCard from "./components/LightsCard.jsx";
import TodoCard from "./components/TodoCard.jsx";
import Settings from "./components/settings.jsx";
import AlarmPopup from "./components/AlarmPopup.jsx";
import { AlarmProvider } from "./AlarmContext.jsx";

const STORAGE_KEY = "davinci-widgets";

const WIDGET_TYPES = [
    { id: "clock", label: "Uhrzeit", icon: "", size: "lg", component: ClockWidget },
    { id: "alarms", label: "Wecker", icon: "", size: "lg", component: AlarmsWidget },
    { id: "weather", label: "Wetter", icon: "", size: "sm", component: WeatherCard },
    { id: "lights", label: "Licht", icon: "", size: "sm", component: LightsCard },
    { id: "todo", label: "To-Do", icon: "", size: "md", component: TodoCard },
];

const DEFAULT_WIDGETS = WIDGET_TYPES.map((widget) => widget.id);

function loadActiveWidgets() {
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : null;
        if (!Array.isArray(parsed)) return DEFAULT_WIDGETS;
        return parsed.filter((id) => WIDGET_TYPES.some((widget) => widget.id === id));
    } catch {
        return DEFAULT_WIDGETS;
    }
}

function App() {
    const [activeIds, setActiveIds] = useState(loadActiveWidgets);
    const [pickerOpen, setPickerOpen] = useState(false);

    useEffect(() => {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(activeIds));
    }, [activeIds]);

    function addWidget(id) {
        setActiveIds((current) => (current.includes(id) ? current : [...current, id]));
    }

    function removeWidget(id) {
        setActiveIds((current) => current.filter((widgetId) => widgetId !== id));
    }

    const pickerOptions = WIDGET_TYPES.filter((widget) => !activeIds.includes(widget.id));

    return (
        <AlarmProvider>
            <div className="dashboard">
                <header className="dashboard-header">
                    <button
                        type="button"
                        className="add-widget-button"
                        onClick={() => setPickerOpen(true)}
                        aria-label={('widget.add')}
                    >
                        +
                    </button>
                </header>

                <main className="dashboard-grid">
                    {activeIds.map((id) => {
                        const widget = WIDGET_TYPES.find((entry) => entry.id === id);
                        if (!widget) return null;
                        const WidgetComponent = widget.component;
                        return (
                            <WidgetShell
                                key={id}
                                title={widget.label}
                                icon={widget.icon}
                                size={widget.size}
                                onRemove={() => removeWidget(id)}
                            >
                                <WidgetComponent />
                            </WidgetShell>
                        );
                    })}
                </main>

                <WidgetPicker
                    visible={pickerOpen}
                    options={pickerOptions}
                    onAdd={addWidget}
                    onClose={() => setPickerOpen(false)}
                />
                <Settings />
                <AlarmPopup />
            </div>
        </AlarmProvider>
    );
}

export default App;
