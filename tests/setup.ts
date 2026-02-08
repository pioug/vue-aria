import { afterEach } from "vitest";

if (typeof globalThis.PointerEvent === "undefined") {
  globalThis.PointerEvent = MouseEvent as unknown as typeof PointerEvent;
}

afterEach(() => {
  document.body.innerHTML = "";
});
