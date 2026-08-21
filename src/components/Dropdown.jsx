import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useDragScroll } from "../useDragScroll.js";

const VIEWPORT_MARGIN = 10;
const MAX_PANEL_HEIGHT = 260;
const MIN_PANEL_HEIGHT = 120;

// A custom listbox instead of a native <select>. Native select popups are
// drawn by the OS/browser outside the page's layout, so on the Pi's small
// touchscreen they can render partially off-screen or get clipped by a
// scrolling ancestor with no way for us to fix it from CSS. This renders its
// panel through a portal straight into <body> and measures the viewport
// itself, so it can never be clipped by a parent and always flips to stay
// fully visible.
export default function Dropdown({ options, value, onChange, ariaLabel }) {
    const [isOpen, setIsOpen] = useState(false);
    const [placement, setPlacement] = useState(null);
    const triggerRef = useRef(null);
    const panelRef = useRef(null);
    const listRef = useDragScroll("y");

    const selected = options.find((option) => option.key === value) || null;

    useLayoutEffect(() => {
        if (!isOpen || !triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom - VIEWPORT_MARGIN;
        const spaceAbove = rect.top - VIEWPORT_MARGIN;
        const openUp = spaceBelow < MIN_PANEL_HEIGHT && spaceAbove > spaceBelow;
        // Never force more height than is actually available on the chosen
        // side - a hard minimum here would push the panel back off-screen on
        // a very short viewport, defeating the whole point of measuring it.
        const chosenSpace = Math.max(openUp ? spaceAbove : spaceBelow, 0);
        const maxHeight = Math.min(MAX_PANEL_HEIGHT, Math.max(chosenSpace, 40));
        const left = Math.min(
            Math.max(rect.left, VIEWPORT_MARGIN),
            Math.max(window.innerWidth - rect.width - VIEWPORT_MARGIN, VIEWPORT_MARGIN)
        );

        setPlacement({
            left,
            width: rect.width,
            top: openUp ? undefined : rect.bottom + 6,
            bottom: openUp ? window.innerHeight - rect.top + 6 : undefined,
            maxHeight,
        });
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return undefined;

        function onPointerDownOutside(event) {
            if (triggerRef.current?.contains(event.target)) return;
            if (panelRef.current?.contains(event.target)) return;
            setIsOpen(false);
        }
        function onKeyDown(event) {
            if (event.key === "Escape") setIsOpen(false);
        }
        function onResize() {
            setIsOpen(false);
        }
        // The drag-scroll here and in the panel's own list both scroll by
        // setting scrollTop by hand (see useDragScroll.js), which fires a
        // native "scroll" event same as a real scroll would - so this has to
        // ignore scrolls that originate from *inside* the panel/list itself,
        // otherwise dragging the list closes it on the very first pointermove.
        function onScrollOutside(event) {
            if (panelRef.current?.contains(event.target)) return;
            setIsOpen(false);
        }

        window.addEventListener("pointerdown", onPointerDownOutside, true);
        window.addEventListener("keydown", onKeyDown);
        window.addEventListener("resize", onResize);
        window.addEventListener("scroll", onScrollOutside, true);

        return () => {
            window.removeEventListener("pointerdown", onPointerDownOutside, true);
            window.removeEventListener("keydown", onKeyDown);
            window.removeEventListener("resize", onResize);
            window.removeEventListener("scroll", onScrollOutside, true);
        };
    }, [isOpen]);

    function selectOption(key) {
        onChange(key);
        setIsOpen(false);
    }

    return (
        <div className="dropdown">
            <button
                type="button"
                ref={triggerRef}
                className="dropdown-trigger"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-label={ariaLabel}
                onClick={() => setIsOpen((open) => !open)}
            >
                <span className="dropdown-trigger-label">{selected?.label ?? ""}</span>
                <span className="dropdown-trigger-arrow" aria-hidden="true">▾</span>
            </button>

            {isOpen && placement && createPortal(
                <div
                    ref={panelRef}
                    className="dropdown-panel"
                    role="listbox"
                    aria-label={ariaLabel}
                    style={{
                        left: placement.left,
                        width: placement.width,
                        top: placement.top,
                        bottom: placement.bottom,
                        maxHeight: placement.maxHeight,
                    }}
                >
                    <div className="dropdown-list" ref={listRef}>
                        {options.map((option) => (
                            <button
                                key={option.key}
                                type="button"
                                role="option"
                                aria-selected={option.key === value}
                                className={`dropdown-option ${option.key === value ? "selected" : ""}`}
                                onClick={() => selectOption(option.key)}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
