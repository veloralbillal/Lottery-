/**
 * Fixed Screen Layout & Anti-Zoom Engine
 * Disables gesture zooming on iOS Safari and Desktop shortcuts
 * while guaranteeing 100% smooth, unrestricted vertical touch scrolling.
 */

export function enableFixedLayoutAndPreventZoom(): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  // 1. Prevent Safari iOS gesture zoom (pinch/expand) - only fires on 2-finger zoom gestures
  document.addEventListener(
    "gesturestart",
    (e: Event) => {
      e.preventDefault();
    },
    { passive: false }
  );

  document.addEventListener(
    "gesturechange",
    (e: Event) => {
      e.preventDefault();
    },
    { passive: false }
  );

  document.addEventListener(
    "gestureend",
    (e: Event) => {
      e.preventDefault();
    },
    { passive: false }
  );

  // 2. Prevent multi-touch pinch to zoom (2 or more fingers moving)
  document.addEventListener(
    "touchmove",
    (e: TouchEvent) => {
      if (e.touches && e.touches.length > 1) {
        e.preventDefault();
      }
    },
    { passive: false }
  );

  // 2. Prevent Ctrl + Wheel zoom on trackpads and mice
  document.addEventListener(
    "wheel",
    (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
      }
    },
    { passive: false }
  );

  // 3. Prevent keyboard zoom shortcuts (Ctrl/Cmd + '+' or '-' or '0')
  document.addEventListener("keydown", (e: KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      if (
        e.key === "+" ||
        e.key === "-" ||
        e.key === "=" ||
        e.key === "_" ||
        e.key === "0" ||
        e.keyCode === 187 ||
        e.keyCode === 189 ||
        e.keyCode === 107 ||
        e.keyCode === 109 ||
        e.keyCode === 48 ||
        e.keyCode === 96
      ) {
        e.preventDefault();
      }
    }
  });

  // 4. Prevent double click / double tap zoom on non-input elements
  document.addEventListener(
    "dblclick",
    (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }
      e.preventDefault();
    },
    { passive: false }
  );

  // 5. Ensure viewport meta is locked with user-scalable=no
  const lockedViewport =
    "width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no, viewport-fit=cover, shrink-to-fit=no";
  let metaViewport = document.querySelector('meta[name="viewport"]') as HTMLMetaElement | null;
  if (!metaViewport) {
    metaViewport = document.createElement("meta");
    metaViewport.name = "viewport";
    document.head.appendChild(metaViewport);
  }
  metaViewport.content = lockedViewport;
}

// Auto-run on load
if (typeof window !== "undefined") {
  enableFixedLayoutAndPreventZoom();
}
