import { useCallback, useEffect, useState } from "react";

const THRESHOLD = 6;

// Drives scrolling from raw Pointer Events instead of relying on the
// browser's native touch-scroll gesture. Some touchscreens (notably the
// Raspberry Pi's official 7" panel under X11) report input as emulated
// single-touch mouse events rather than real touch/pointer pan gestures, so
// native touch-scrolling never engages there — only interactive widgets
// like a scrollbar thumb respond, because those just react to any pointer
// drag. Pointer Events fire uniformly for mouse, touch and pen, so driving
// scrollLeft/scrollTop by hand here works regardless of how the input
// arrived. Pair with `touch-action: none` on the element so the browser
// doesn't also try to handle the gesture natively and fight this.
//
// Returns a callback ref rather than a plain useRef: several callers attach
// this to content that's only mounted conditionally (a modal's body, a
// dropdown panel behind isOpen &&...). A plain ref's effect only runs once,
// so if the element didn't exist yet on that first run (closed modal), it
// would silently never attach - a callback ref re-fires every time the
// underlying DOM node actually changes, including from null to a real node.
export function useDragScroll(axis = "x") {
    const [el, setEl] = useState(null);
    const ref = useCallback((node) => setEl(node), []);

    useEffect(() => {
        if (!el) return undefined;

        let pointerId = null;
        let moved = false;
        let startX = 0;
        let startY = 0;
        let startScroll = 0;

        function reset() {
            pointerId = null;
            moved = false;
        }

        function suppressNextClick() {
            const onClickCapture = (event) => {
                event.preventDefault();
                event.stopPropagation();
            };
            el.addEventListener("click", onClickCapture, { capture: true, once: true });
            window.setTimeout(() => el.removeEventListener("click", onClickCapture, true), 0);
        }

        function onPointerDown(event) {
            if (event.pointerType === "mouse" && event.button !== 0) return;
            pointerId = event.pointerId;
            moved = false;
            startX = event.clientX;
            startY = event.clientY;
            startScroll = axis === "x" ? el.scrollLeft : el.scrollTop;
        }

        function onPointerMove(event) {
            if (pointerId === null || event.pointerId !== pointerId) return;
            const dx = event.clientX - startX;
            const dy = event.clientY - startY;

            if (!moved) {
                const primary = axis === "x" ? Math.abs(dx) : Math.abs(dy);
                const cross = axis === "x" ? Math.abs(dy) : Math.abs(dx);
                if (primary < THRESHOLD) return;
                if (primary <= cross) {
                    // Movement is mostly along the other axis - not ours,
                    // let it bubble up/through to whichever ancestor or
                    // sibling scroller handles that axis instead.
                    pointerId = null;
                    return;
                }
                moved = true;
                el.setPointerCapture?.(event.pointerId);
                el.classList.add("dragging-scroll");
            }

            event.stopPropagation();
            event.preventDefault();
            if (axis === "x") {
                el.scrollLeft = startScroll - dx;
            } else {
                el.scrollTop = startScroll - dy;
            }
        }

        function onPointerUp(event) {
            if (pointerId === null || event.pointerId !== pointerId) return;
            if (moved) {
                event.stopPropagation();
                suppressNextClick();
            }
            el.classList.remove("dragging-scroll");
            reset();
        }

        // Capture-phase safety net on window: guarantees local state is
        // cleared even when a nested drag handler stopped this pointerup
        // from bubbling up to us. Deferred so our own bubble-phase handler
        // above (if this element is the actual gesture owner) runs first.
        function scheduleReset() {
            window.setTimeout(reset, 0);
        }

        el.addEventListener("pointerdown", onPointerDown);
        el.addEventListener("pointermove", onPointerMove);
        el.addEventListener("pointerup", onPointerUp);
        el.addEventListener("pointercancel", onPointerUp);
        window.addEventListener("pointerup", scheduleReset, true);
        window.addEventListener("pointercancel", scheduleReset, true);

        return () => {
            el.removeEventListener("pointerdown", onPointerDown);
            el.removeEventListener("pointermove", onPointerMove);
            el.removeEventListener("pointerup", onPointerUp);
            el.removeEventListener("pointercancel", onPointerUp);
            window.removeEventListener("pointerup", scheduleReset, true);
            window.removeEventListener("pointercancel", scheduleReset, true);
        };
    }, [axis, el]);

    return ref;
}
