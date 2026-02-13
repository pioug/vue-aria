import { effectScope } from "vue";
import { describe, expect, it, vi } from "vitest";
import { useHover } from "../src/useHover";

describe("useHover", () => {
  it("fires hover start/end and change callbacks", () => {
    const events: Array<any> = [];
    const addEvent = (event: any) => events.push(event);

    const scope = effectScope();
    const { hoverProps } = scope.run(() =>
      useHover({
        onHoverStart: addEvent,
        onHoverEnd: addEvent,
        onHoverChange: (isHovering) => addEvent({ type: "hoverchange", isHovering }),
      })
    )!;

    const el = document.createElement("div");
    const enterHandler =
      (hoverProps.onPointerenter as ((event: PointerEvent) => void) | undefined) ??
      (hoverProps.onMouseenter as ((event: MouseEvent) => void) | undefined);
    const leaveHandler =
      (hoverProps.onPointerleave as ((event: PointerEvent) => void) | undefined) ??
      (hoverProps.onMouseleave as ((event: MouseEvent) => void) | undefined);

    const enterEvent = new MouseEvent("mouseenter", { bubbles: true });
    Object.defineProperty(enterEvent, "target", { value: el });
    Object.defineProperty(enterEvent, "currentTarget", { value: el });
    Object.defineProperty(enterEvent, "pointerType", { value: "mouse" });

    const leaveEvent = new MouseEvent("mouseleave", { bubbles: true });
    Object.defineProperty(leaveEvent, "target", { value: el });
    Object.defineProperty(leaveEvent, "currentTarget", { value: el });
    Object.defineProperty(leaveEvent, "pointerType", { value: "mouse" });

    enterHandler?.(enterEvent as PointerEvent);
    leaveHandler?.(leaveEvent as PointerEvent);

    expect(events).toEqual([
      { type: "hoverstart", target: el, pointerType: "mouse" },
      { type: "hoverchange", isHovering: true },
      { type: "hoverend", target: el, pointerType: "mouse" },
      { type: "hoverchange", isHovering: false },
    ]);

    scope.stop();
  });

  it("does not fire when disabled", () => {
    const onHoverStart = vi.fn();
    const onHoverEnd = vi.fn();
    const onHoverChange = vi.fn();

    const scope = effectScope();
    const { hoverProps } = scope.run(() =>
      useHover({ isDisabled: true, onHoverStart, onHoverEnd, onHoverChange })
    )!;

    const el = document.createElement("div");
    const enterHandler =
      (hoverProps.onPointerenter as ((event: PointerEvent) => void) | undefined) ??
      (hoverProps.onMouseenter as ((event: MouseEvent) => void) | undefined);
    const leaveHandler =
      (hoverProps.onPointerleave as ((event: PointerEvent) => void) | undefined) ??
      (hoverProps.onMouseleave as ((event: MouseEvent) => void) | undefined);

    const enterEvent = new MouseEvent("mouseenter", { bubbles: true });
    Object.defineProperty(enterEvent, "target", { value: el });
    Object.defineProperty(enterEvent, "currentTarget", { value: el });
    Object.defineProperty(enterEvent, "pointerType", { value: "mouse" });

    const leaveEvent = new MouseEvent("mouseleave", { bubbles: true });
    Object.defineProperty(leaveEvent, "target", { value: el });
    Object.defineProperty(leaveEvent, "currentTarget", { value: el });
    Object.defineProperty(leaveEvent, "pointerType", { value: "mouse" });

    enterHandler?.(enterEvent as PointerEvent);
    leaveHandler?.(leaveEvent as PointerEvent);

    expect(onHoverStart).not.toHaveBeenCalled();
    expect(onHoverEnd).not.toHaveBeenCalled();
    expect(onHoverChange).not.toHaveBeenCalled();

    scope.stop();
  });

  it("ignores touch pointer type for hover start", () => {
    const onHoverStart = vi.fn();

    const scope = effectScope();
    const { hoverProps } = scope.run(() =>
      useHover({ onHoverStart })
    )!;

    const el = document.createElement("div");
    const pointerEnter = hoverProps.onPointerenter as
      | ((event: PointerEvent) => void)
      | undefined;
    const mouseEnter = hoverProps.onMouseenter as
      | ((event: MouseEvent) => void)
      | undefined;
    const touchStart = hoverProps.onTouchstart as (() => void) | undefined;

    if (pointerEnter) {
      const enterEvent = new MouseEvent("mouseenter", { bubbles: true });
      Object.defineProperty(enterEvent, "target", { value: el });
      Object.defineProperty(enterEvent, "currentTarget", { value: el });
      Object.defineProperty(enterEvent, "pointerType", { value: "touch" });
      pointerEnter(enterEvent as PointerEvent);
    } else {
      touchStart?.();
      const enterEvent = new MouseEvent("mouseenter", { bubbles: true });
      Object.defineProperty(enterEvent, "target", { value: el });
      Object.defineProperty(enterEvent, "currentTarget", { value: el });
      mouseEnter?.(enterEvent);
    }

    expect(onHoverStart).not.toHaveBeenCalled();

    scope.stop();
  });
});
