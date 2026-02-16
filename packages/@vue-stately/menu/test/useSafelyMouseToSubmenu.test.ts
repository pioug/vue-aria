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

function dispatchPointerMove(x: number, y: number, pointerType: string = "mouse") {
  const event = new Event("pointermove", { bubbles: true }) as PointerEvent;
  (event as any).pointerType = pointerType;
  (event as any).clientX = x;
  (event as any).clientY = y;
  window.dispatchEvent(event);
}

describe("useSafelyMouseToSubmenu", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
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

  it("ignores touch and pen pointer movements", async () => {
    setInteractionModality("pointer");
    const menu = document.createElement("ul");
    const submenu = document.createElement("ul");
    document.body.append(menu, submenu);
    vi.spyOn(menu, "getBoundingClientRect").mockReturnValue(rect(0, 0, 100, 100));
    vi.spyOn(submenu, "getBoundingClientRect").mockReturnValue(rect(120, 0, 220, 100));

    const scope = effectScope();
    scope.run(() => {
      useSafelyMouseToSubmenu({
        menuRef: { current: menu },
        submenuRef: { current: submenu },
        isOpen: true,
      });
    });
    await nextTick();

    dispatchPointerMove(30, 50, "touch");
    dispatchPointerMove(40, 50, "pen");
    expect(menu.style.pointerEvents).toBe("");

    scope.stop();
    menu.remove();
    submenu.remove();
  });

  it("resets safe-triangle pointer-events when interaction modality changes", async () => {
    vi.useFakeTimers();
    setInteractionModality("pointer");

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
    await nextTick();

    dispatchPointerMove(10, 50);
    now = 100;
    dispatchPointerMove(20, 50);
    now = 200;
    dispatchPointerMove(30, 50);
    expect(menu.style.pointerEvents).toBe("none");

    setInteractionModality("keyboard");
    await nextTick();
    expect(menu.style.pointerEvents).toBe("");

    scope.stop();
    menu.remove();
    submenu.remove();
  });

  it("dispatches pointerover fallback after timeout when pointer movement stalls", async () => {
    vi.useFakeTimers();
    setInteractionModality("pointer");

    const menu = document.createElement("ul");
    const target = document.createElement("li");
    menu.appendChild(target);
    const submenu = document.createElement("ul");
    document.body.append(menu, submenu);
    vi.spyOn(menu, "getBoundingClientRect").mockReturnValue(rect(0, 0, 100, 100));
    vi.spyOn(submenu, "getBoundingClientRect").mockReturnValue(rect(120, 0, 220, 100));
    const originalElementFromPoint = (document as any).elementFromPoint;
    (document as any).elementFromPoint = vi.fn(() => target);
    const pointerOverSpy = vi.fn();
    target.addEventListener("pointerover", pointerOverSpy);

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
    await nextTick();

    dispatchPointerMove(10, 50);
    now = 100;
    dispatchPointerMove(20, 50);
    now = 200;
    dispatchPointerMove(30, 50);
    expect(menu.style.pointerEvents).toBe("none");

    vi.advanceTimersByTime(1000);
    expect(menu.style.pointerEvents).toBe("");
    vi.advanceTimersByTime(100);
    expect(pointerOverSpy).toHaveBeenCalledTimes(1);

    scope.stop();
    if (originalElementFromPoint) {
      (document as any).elementFromPoint = originalElementFromPoint;
    } else {
      delete (document as any).elementFromPoint;
    }
    menu.remove();
    submenu.remove();
  });
});
