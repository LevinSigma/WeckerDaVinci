export default function WidgetPicker({ visible, options, onAdd, onClose }) {
    if (!visible) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content picker-content" onClick={(e) => e.stopPropagation()}>
                <h4>Widget hinzufügen</h4>

                {options.length === 0 ? (
                    <p className="empty-state">Alle Widgets sind bereits auf dem Dashboard.</p>
                ) : (
                    <div className="picker-grid">
                        {options.map((option) => (
                            <button
                                key={option.id}
                                type="button"
                                className="picker-option"
                                onClick={() => onAdd(option.id)}
                            >
                                <span className="picker-option-icon" aria-hidden="true">{option.icon}</span>
                                <span className="picker-option-label">{option.label}</span>
                            </button>
                        ))}
                    </div>
                )}

                <div className="button-group-right">
                    <button onClick={onClose} className="btn-secondary">
                        Schließen
                    </button>
                </div>
            </div>
        </div>
    );
}
