import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick, ref } from "vue";
import { useHover } from "../src/useHover";

interface HoverHandlers {
  onPointerenter?: (event: PointerEvent) => void;
  onPointerleave?: (event: PointerEvent) => void;
}

function createPointerEvent(
  type: string,
  target: EventTarget,
  currentTarget: EventTarget,
  pointerType: "mouse" | "touch" | "pen"
): PointerEvent {
  const event = new PointerEvent(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, "pointerType", { value: pointerType });
  Object.defineProperty(event, "target", { value: target });
  Object.defineProperty(event, "currentTarget", { value: currentTarget });
  return event;
}

describe("useHover", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not handle hover events if disabled", () => {
    const onHoverStart = vi.fn();
    const onHoverEnd = vi.fn();
    const onHoverChange = vi.fn();
    const { hoverProps, isHovered } = useHover({
      isDisabled: true,
      onHoverStart,
      onHoverEnd,
      onHoverChange,
    });
    const handlers = hoverProps as HoverHandlers;

    const element = document.createElement("div");
    document.body.appendChild(element);

    handlers.onPointerenter?.(createPointerEvent("pointerenter", element, element, "mouse"));
    handlers.onPointerleave?.(createPointerEvent("pointerleave", element, element, "mouse"));

    expect(isHovered.value).toBe(false);
    expect(onHoverStart).not.toHaveBeenCalled();
    expect(onHoverEnd).not.toHaveBeenCalled();
    expect(onHoverChange).not.toHaveBeenCalled();
  });

  it("fires hover events based on pointer events", () => {
    const onHoverStart = vi.fn();
    const onHoverEnd = vi.fn();
    const onHoverChange = vi.fn();
    const { hoverProps, isHovered } = useHover({
      onHoverStart,
      onHoverEnd,
      onHoverChange,
    });
    const handlers = hoverProps as HoverHandlers;

    const element = document.createElement("div");
    document.body.appendChild(element);

    handlers.onPointerenter?.(createPointerEvent("pointerenter", element, element, "mouse"));
    expect(isHovered.value).toBe(true);
    handlers.onPointerleave?.(createPointerEvent("pointerleave", element, element, "mouse"));
    expect(isHovered.value).toBe(false);

    expect(onHoverStart).toHaveBeenCalledTimes(1);
    expect(onHoverStart.mock.calls[0][0]).toMatchObject({
      type: "hoverstart",
      target: element,
      pointerType: "mouse",
    });
    expect(onHoverChange).toHaveBeenNthCalledWith(1, true);
    expect(onHoverEnd).toHaveBeenCalledTimes(1);
    expect(onHoverEnd.mock.calls[0][0]).toMatchObject({
      type: "hoverend",
      target: element,
      pointerType: "mouse",
    });
    expect(onHoverChange).toHaveBeenNthCalledWith(2, false);
  });

  it("does not fire hover events for touch", () => {
    const onHoverStart = vi.fn();
    const onHoverEnd = vi.fn();
    const onHoverChange = vi.fn();
    const { hoverProps, isHovered } = useHover({
      onHoverStart,
      onHoverEnd,
      onHoverChange,
    });
    const handlers = hoverProps as HoverHandlers;

    const element = document.createElement("div");
    document.body.appendChild(element);

    handlers.onPointerenter?.(createPointerEvent("pointerenter", element, element, "touch"));
    handlers.onPointerleave?.(createPointerEvent("pointerleave", element, element, "touch"));

    expect(isHovered.value).toBe(false);
    expect(onHoverStart).not.toHaveBeenCalled();
    expect(onHoverEnd).not.toHaveBeenCalled();
    expect(onHoverChange).not.toHaveBeenCalled();
  });

  it("ignores emulated mouse events immediately after touch", () => {
    const onHoverStart = vi.fn();
    const { hoverProps, isHovered } = useHover({ onHoverStart });
    const handlers = hoverProps as HoverHandlers;

    const element = document.createElement("div");
    document.body.appendChild(element);

    const touchUp = new PointerEvent("pointerup", { bubbles: true, cancelable: true });
    Object.defineProperty(touchUp, "pointerType", { value: "touch" });
    document.dispatchEvent(touchUp);

    handlers.onPointerenter?.(createPointerEvent("pointerenter", element, element, "mouse"));
    expect(isHovered.value).toBe(false);
    expect(onHoverStart).not.toHaveBeenCalled();
  });

  it("allows mouse hover after ignore timeout", () => {
    const onHoverStart = vi.fn();
    const { hoverProps, isHovered } = useHover({ onHoverStart });
    const handlers = hoverProps as HoverHandlers;

    const element = document.createElement("div");
    document.body.appendChild(element);

    const touchUp = new PointerEvent("pointerup", { bubbles: true, cancelable: true });
    Object.defineProperty(touchUp, "pointerType", { value: "touch" });
    document.dispatchEvent(touchUp);
    vi.advanceTimersByTime(100);

    handlers.onPointerenter?.(createPointerEvent("pointerenter", element, element, "mouse"));
    expect(isHovered.value).toBe(true);
    expect(onHoverStart).toHaveBeenCalledTimes(1);
  });

  it("ends hover when disabled changes to true", async () => {
    const disabled = ref(false);
    const onHoverEnd = vi.fn();
    const onHoverChange = vi.fn();
    const { hoverProps, isHovered } = useHover({
      isDisabled: disabled,
      onHoverEnd,
      onHoverChange,
    });
    const handlers = hoverProps as HoverHandlers;

    const element = document.createElement("div");
    document.body.appendChild(element);

    handlers.onPointerenter?.(createPointerEvent("pointerenter", element, element, "mouse"));
    expect(isHovered.value).toBe(true);

    disabled.value = true;
    await nextTick();

    expect(isHovered.value).toBe(false);
    expect(onHoverEnd).toHaveBeenCalledTimes(1);
    expect(onHoverChange).toHaveBeenNthCalledWith(1, true);
    expect(onHoverChange).toHaveBeenNthCalledWith(2, false);
  });

  it("triggers hover end when pointer moves outside after child removal", () => {
    const onHoverStart = vi.fn();
    const onHoverEnd = vi.fn();
    const onHoverChange = vi.fn();
    const { hoverProps, isHovered } = useHover({
      onHoverStart,
      onHoverEnd,
      onHoverChange,
    });
    const handlers = hoverProps as HoverHandlers;

    const root = document.createElement("div");
    const child = document.createElement("button");
    root.appendChild(child);
    document.body.appendChild(root);

    handlers.onPointerenter?.(createPointerEvent("pointerenter", root, root, "mouse"));
    expect(isHovered.value).toBe(true);

    root.removeChild(child);
    const outside = document.createElement("div");
    document.body.appendChild(outside);
    const pointerOverOutside = new PointerEvent("pointerover", {
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(pointerOverOutside, "pointerType", { value: "mouse" });
    Object.defineProperty(pointerOverOutside, "target", { value: outside });
    document.dispatchEvent(pointerOverOutside);

    expect(isHovered.value).toBe(false);
    expect(onHoverStart).toHaveBeenCalledTimes(1);
    expect(onHoverEnd).toHaveBeenCalledTimes(1);
    expect(onHoverChange).toHaveBeenNthCalledWith(1, true);
    expect(onHoverChange).toHaveBeenNthCalledWith(2, false);
  });
});
