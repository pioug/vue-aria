import { effectScope, nextTick } from "vue";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getInteractionModality, setInteractionModality } from "@vue-aria/interactions";
import { useSafelyMouseToSubmenu } from "../src/useSafelyMouseToSubmenu";

function rect(left: number, top: number, right: number, bottom: number): DOMRect {
  return {
    left,
    top,
    right,
    bottom,
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
    toJSON: () => ({}),
  } as DOMRect;
}

function dispatchPointerMove(x: number, y: number) {
  let event: PointerEvent;
  if (typeof PointerEvent !== "undefined") {
    event = new PointerEvent("pointermove", {
      bubbles: true,
      pointerType: "mouse",
      clientX: x,
      clientY: y,
    });
  } else {
    event = new Event("pointermove", { bubbles: true }) as PointerEvent;
    (event as any).pointerType = "mouse";
    (event as any).clientX = x;
    (event as any).clientY = y;
  }
  window.dispatchEvent(event);
}

describe("useSafelyMouseToSubmenu", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    setInteractionModality("keyboard");
  });

  it("handles pointer movement lifecycle without leaving stale pointer-events", async () => {
    setInteractionModality("pointer");
    expect(getInteractionModality()).toBe("pointer");

    const menu = document.createElement("ul");
    const submenu = document.createElement("ul");
    document.body.append(menu, submenu);
    vi.spyOn(menu, "getBoundingClientRect").mockReturnValue(rect(0, 0, 100, 100));
    vi.spyOn(submenu, "getBoundingClientRect").mockReturnValue(rect(120, 0, 220, 100));

    const menuRef = { current: menu as Element | null };
    const submenuRef = { current: submenu as Element | null };
    let now = 0;
    vi.spyOn(Date, "now").mockImplementation(() => now);

    const scope = effectScope();
    scope.run(() => {
      useSafelyMouseToSubmenu({
        menuRef,
        submenuRef,
        isOpen: true,
      });
    });
    await nextTick();

    now = 0;
    dispatchPointerMove(10, 50);
    now = 100;
    dispatchPointerMove(20, 50);

    now = 200;
    dispatchPointerMove(-10, 50);
    expect(menu.style.pointerEvents).toBe("");

    scope.stop();
    menu.remove();
    submenu.remove();
  });

  it("clears pointer-events when disabled or closed", async () => {
    setInteractionModality("pointer");
    const menu = document.createElement("ul");
    const submenu = document.createElement("ul");
    menu.style.pointerEvents = "none";
    document.body.append(menu, submenu);

    const scope = effectScope();
    scope.run(() => {
      useSafelyMouseToSubmenu({
        menuRef: { current: menu },
        submenuRef: { current: submenu },
        isOpen: false,
      });
    });
    await nextTick();

    expect(menu.style.pointerEvents).toBe("");

    scope.stop();
    menu.remove();
    submenu.remove();
  });
});
