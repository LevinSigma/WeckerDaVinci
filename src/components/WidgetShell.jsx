export default function WidgetShell({ id, title, icon, onRemove, size, children }) {
    return (
        <section className={`widget widget--${size || "md"}`} data-widget={id}>
            <header className="widget-header">
                <span className="widget-icon" aria-hidden="true">{icon}</span>
                <h2 className="widget-title">{title}</h2>
                {onRemove && (
                    <button
                        type="button"
                        className="widget-remove"
                        onClick={onRemove}
                        aria-label={`${title} entfernen`}
                    >
                        ×
                    </button>
                )}
            </header>
            <div className="widget-body">{children}</div>
        </section>
    );
}
