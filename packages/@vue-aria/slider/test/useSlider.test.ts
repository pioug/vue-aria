import { effectScope } from "vue";
import { describe, expect, it, vi } from "vitest";
import { useSlider } from "../src/useSlider";
import { useSliderState } from "@vue-aria/slider-state";
import * as interactions from "@vue-aria/interactions";

const HORIZONTAL_TRACK_RECT = {
  width: 100,
  height: 100,
  top: 0,
  left: 0,
  right: 100,
  bottom: 10,
  x: 0,
  y: 0,
  toJSON: () => ({}),
};

const VERTICAL_TRACK_RECT = {
  width: 100,
  height: 100,
  top: 0,
  left: 0,
  right: 100,
  bottom: 100,
  x: 0,
  y: 0,
  toJSON: () => ({}),
};

const numberFormatter = new Intl.NumberFormat("en-US", {});

function setupSlider({
  defaultValue = [10, 80],
  sliderProps = { "aria-label": "Slider" },
  trackRect = HORIZONTAL_TRACK_RECT,
}: {
  defaultValue?: number[];
  sliderProps?: Record<string, unknown>;
  trackRect?: typeof HORIZONTAL_TRACK_RECT;
}) {
  const track = document.createElement("div");
  vi.spyOn(track, "getBoundingClientRect").mockReturnValue(trackRect);

  const scope = effectScope();
  const result = scope.run(() => {
    const state = useSliderState({
      defaultValue,
      numberFormatter,
    });
    const slider = useSlider(sliderProps as any, state as any, { current: track });
    return { state, ...slider };
  })!;

  return { scope, track, ...result };
}

function dispatchTrackDown(trackProps: Record<string, unknown>, value: number) {
  if (typeof PointerEvent !== "undefined" && trackProps.onPointerdown) {
    const event = new MouseEvent("pointerdown", { bubbles: true, cancelable: true });
    Object.defineProperty(event, "clientX", { value });
    Object.defineProperty(event, "clientY", { value });
    Object.defineProperty(event, "pageX", { value });
    Object.defineProperty(event, "pageY", { value });
    Object.defineProperty(event, "pointerId", { value: 1 });
    Object.defineProperty(event, "pointerType", { value: "mouse" });
    (trackProps.onPointerdown as (event: PointerEvent) => void)(event as PointerEvent);
    return "pointer";
  }

  const event = new MouseEvent("mousedown", { bubbles: true, cancelable: true });
  Object.defineProperty(event, "button", { value: 0 });
  Object.defineProperty(event, "clientX", { value });
  Object.defineProperty(event, "clientY", { value });
  Object.defineProperty(event, "pageX", { value });
  Object.defineProperty(event, "pageY", { value });
  (trackProps.onMousedown as (event: MouseEvent) => void)(event);
  return "mouse";
}

function dispatchTrackMove(kind: "pointer" | "mouse", value: number) {
  const eventName = kind === "pointer" ? "pointermove" : "mousemove";
  const event = new MouseEvent(eventName, { bubbles: true, cancelable: true });
  Object.defineProperty(event, "pageX", { value });
  Object.defineProperty(event, "pageY", { value });
  if (kind === "pointer") {
    Object.defineProperty(event, "pointerId", { value: 1 });
    Object.defineProperty(event, "pointerType", { value: "mouse" });
  }
  window.dispatchEvent(event);
}

function dispatchTrackUp(kind: "pointer" | "mouse", value: number) {
  const eventName = kind === "pointer" ? "pointerup" : "mouseup";
  const event = new MouseEvent(eventName, { bubbles: true, cancelable: true });
  Object.defineProperty(event, "pageX", { value });
  Object.defineProperty(event, "pageY", { value });
  if (kind === "pointer") {
    Object.defineProperty(event, "pointerId", { value: 1 });
    Object.defineProperty(event, "pointerType", { value: "mouse" });
  }
  window.dispatchEvent(event);
}

function dispatchTrackTouchStart(trackProps: Record<string, unknown>, value: number) {
  const event = new Event("touchstart", { bubbles: true, cancelable: true });
  Object.defineProperty(event, "changedTouches", {
    value: [{ identifier: 1, clientX: value, clientY: value, pageX: value, pageY: value }],
  });
  (trackProps.onTouchstart as (event: TouchEvent) => void)(event as TouchEvent);
}

function dispatchTrackTouchMove(value: number) {
  const event = new Event("touchmove", { bubbles: true, cancelable: true });
  Object.defineProperty(event, "changedTouches", {
    value: [{ identifier: 1, pageX: value, pageY: value }],
  });
  window.dispatchEvent(event);
}

function dispatchTrackTouchEnd(value: number) {
  const event = new Event("touchend", { bubbles: true, cancelable: true });
  Object.defineProperty(event, "changedTouches", {
    value: [{ identifier: 1, pageX: value, pageY: value }],
  });
  window.dispatchEvent(event);
}

describe("useSlider", () => {
  it("returns expected label and group props for visible label", () => {
    const { scope, labelProps, groupProps, outputProps } = setupSlider({
      defaultValue: [0],
      sliderProps: { label: "Slider" },
    });

    expect(groupProps.role).toBe("group");
    expect(labelProps.htmlFor).toBeUndefined();
    expect(typeof labelProps.onClick).toBe("function");
    expect((outputProps.htmlFor as string).split(" ")).toHaveLength(1);

    scope.stop();
  });

  it("focuses first thumb and sets keyboard modality when label is clicked", () => {
    const { scope, labelProps, outputProps } = setupSlider({
      defaultValue: [0],
      sliderProps: { label: "Slider" },
    });
    const setInteractionModalitySpy = vi.spyOn(interactions, "setInteractionModality");

    const thumb = document.createElement("input");
    thumb.id = (outputProps.htmlFor as string).split(" ")[0];
    const focusSpy = vi.spyOn(thumb, "focus");
    document.body.appendChild(thumb);

    (labelProps.onClick as () => void)?.();
    expect(focusSpy).toHaveBeenCalledTimes(1);
    expect(setInteractionModalitySpy).toHaveBeenCalledWith("keyboard");

    scope.stop();
    thumb.remove();
  });

  it("returns expected group props for aria-label", () => {
    const { scope, labelProps, groupProps } = setupSlider({
      defaultValue: [0],
      sliderProps: { "aria-label": "Slider" },
      trackRect: VERTICAL_TRACK_RECT,
    });

    expect(labelProps).toEqual({});
    expect(groupProps.role).toBe("group");
    expect(groupProps["aria-label"]).toBe("Slider");

    scope.stop();
  });

  it("sets nearest thumb value and supports track dragging", () => {
    const { scope, state, trackProps } = setupSlider({
      defaultValue: [10, 80],
      sliderProps: { "aria-label": "Slider" },
    });

    const kind = dispatchTrackDown(trackProps, 20);
    expect(state.values).toEqual([20, 80]);

    dispatchTrackMove(kind, 30);
    expect(state.values).toEqual([30, 80]);

    dispatchTrackUp(kind, 30);
    expect(state.isThumbDragging(0)).toBe(false);

    scope.stop();
  });

  it("does not change values when disabled", () => {
    const { scope, state, trackProps } = setupSlider({
      defaultValue: [10, 80],
      sliderProps: { "aria-label": "Slider", isDisabled: true },
    });

    dispatchTrackDown(trackProps, 20);
    expect(state.values).toEqual([10, 80]);

    scope.stop();
  });

  it("supports vertical track dragging", () => {
    const { scope, state, trackProps } = setupSlider({
      defaultValue: [10, 80],
      sliderProps: { "aria-label": "Slider", orientation: "vertical" },
      trackRect: VERTICAL_TRACK_RECT,
    });

    const kind = dispatchTrackDown(trackProps, 80);
    expect(state.values).toEqual([20, 80]);

    dispatchTrackMove(kind, 70);
    expect(state.values).toEqual([30, 80]);

    dispatchTrackUp(kind, 70);
    expect(state.isThumbDragging(0)).toBe(false);

    scope.stop();
  });

  it("picks the left thumb when stacked and click is before", () => {
    const { scope, state, trackProps } = setupSlider({
      defaultValue: [40, 40],
      sliderProps: { "aria-label": "Slider" },
      trackRect: VERTICAL_TRACK_RECT,
    });

    dispatchTrackDown(trackProps, 20);
    expect(state.values).toEqual([20, 40]);

    scope.stop();
  });

  it("picks the right thumb when stacked and click is after", () => {
    const { scope, state, trackProps } = setupSlider({
      defaultValue: [40, 40],
      sliderProps: { "aria-label": "Slider" },
      trackRect: VERTICAL_TRACK_RECT,
    });

    dispatchTrackDown(trackProps, 60);
    expect(state.values).toEqual([40, 60]);

    scope.stop();
  });

  it("picks nearest thumbs correctly in dense stacked sets", () => {
    const { scope, state, trackProps } = setupSlider({
      defaultValue: [25, 25, 50, 75, 75],
      sliderProps: { "aria-label": "Slider" },
      trackRect: VERTICAL_TRACK_RECT,
    });

    const kind = dispatchTrackDown(trackProps, 70);
    expect(state.values).toEqual([25, 25, 50, 70, 75]);
    dispatchTrackUp(kind, 70);

    dispatchTrackDown(trackProps, 20);
    expect(state.values).toEqual([20, 25, 50, 70, 75]);

    scope.stop();
  });

  it("ignores modified mouse interactions on track", () => {
    const { scope, state, trackProps } = setupSlider({
      defaultValue: [10, 80],
      sliderProps: { "aria-label": "Slider" },
      trackRect: VERTICAL_TRACK_RECT,
    });

    const modifiedMouseEvent = new MouseEvent("mousedown", { bubbles: true, cancelable: true });
    Object.defineProperty(modifiedMouseEvent, "button", { value: 0 });
    Object.defineProperty(modifiedMouseEvent, "clientX", { value: 20 });
    Object.defineProperty(modifiedMouseEvent, "clientY", { value: 20 });
    Object.defineProperty(modifiedMouseEvent, "altKey", { value: true });
    (trackProps.onMousedown as (event: MouseEvent) => void)(modifiedMouseEvent);

    expect(state.values).toEqual([10, 80]);

    scope.stop();
  });

  it("supports pointer track dragging when PointerEvent is available", () => {
    const originalPointerEvent = globalThis.PointerEvent;
    vi.stubGlobal("PointerEvent", MouseEvent);

    const { scope, state, trackProps } = setupSlider({
      defaultValue: [10, 80],
      sliderProps: { "aria-label": "Slider" },
      trackRect: VERTICAL_TRACK_RECT,
    });

    const kind = dispatchTrackDown(trackProps, 20);
    expect(kind).toBe("pointer");
    expect(state.values).toEqual([20, 80]);

    dispatchTrackMove(kind, 40);
    expect(state.values).toEqual([40, 80]);

    dispatchTrackUp(kind, 40);
    expect(state.isThumbDragging(0)).toBe(false);
    scope.stop();

    if (originalPointerEvent === undefined) {
      vi.unstubAllGlobals();
    } else {
      vi.stubGlobal("PointerEvent", originalPointerEvent);
    }
  });

  it("ignores modified pointer interactions on track", () => {
    const originalPointerEvent = globalThis.PointerEvent;
    vi.stubGlobal("PointerEvent", MouseEvent);

    const { scope, state, trackProps } = setupSlider({
      defaultValue: [10, 80],
      sliderProps: { "aria-label": "Slider" },
      trackRect: VERTICAL_TRACK_RECT,
    });

    const modifiedPointerEvent = new MouseEvent("pointerdown", { bubbles: true, cancelable: true });
    Object.defineProperty(modifiedPointerEvent, "button", { value: 0 });
    Object.defineProperty(modifiedPointerEvent, "ctrlKey", { value: true });
    Object.defineProperty(modifiedPointerEvent, "clientX", { value: 20 });
    Object.defineProperty(modifiedPointerEvent, "clientY", { value: 20 });
    Object.defineProperty(modifiedPointerEvent, "pointerId", { value: 1 });
    Object.defineProperty(modifiedPointerEvent, "pointerType", { value: "mouse" });
    (trackProps.onPointerdown as (event: PointerEvent) => void)(modifiedPointerEvent as PointerEvent);

    expect(state.values).toEqual([10, 80]);
    scope.stop();

    if (originalPointerEvent === undefined) {
      vi.unstubAllGlobals();
    } else {
      vi.stubGlobal("PointerEvent", originalPointerEvent);
    }
  });

  it("supports touch track dragging interactions", () => {
    const { scope, state, trackProps } = setupSlider({
      defaultValue: [10, 80],
      sliderProps: { "aria-label": "Slider" },
      trackRect: VERTICAL_TRACK_RECT,
    });

    dispatchTrackTouchStart(trackProps, 20);
    expect(state.values).toEqual([20, 80]);

    dispatchTrackTouchMove(30);
    expect(state.values).toEqual([30, 80]);

    dispatchTrackTouchEnd(30);
    expect(state.isThumbDragging(0)).toBe(false);

    scope.stop();
  });
});
