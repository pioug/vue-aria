import { effectScope } from "vue";
import { describe, expect, it, vi } from "vitest";
import { useSlider, type SliderState } from "../src/useSlider";
import * as interactions from "@vue-aria/interactions";

function createSliderState(initialValues: number[] = [10, 80]) {
  const dragging = new Set<number>();
  const state: SliderState = {
    values: [...initialValues],
    isThumbDragging(index) {
      return dragging.has(index);
    },
    isThumbEditable() {
      return true;
    },
    getThumbPercent(index) {
      return state.values[index] / 100;
    },
    getPercentValue(percent) {
      return Math.round(percent * 100);
    },
    setThumbDragging: vi.fn((index: number, isDragging: boolean) => {
      if (isDragging) {
        dragging.add(index);
      } else {
        dragging.delete(index);
      }
    }),
    setThumbPercent: vi.fn((index: number, percent: number) => {
      state.values[index] = Math.round(percent * 100);
    }),
    setThumbValue: vi.fn((index: number, value: number) => {
      state.values[index] = Math.round(value);
    }),
    setFocusedThumb: vi.fn(),
  };

  return state;
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
    const track = document.createElement("div");
    vi.spyOn(track, "getBoundingClientRect").mockReturnValue({
      width: 100,
      height: 100,
      top: 0,
      left: 0,
      right: 100,
      bottom: 10,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    const state = createSliderState([0]);
    const scope = effectScope();
    const result = scope.run(() =>
      useSlider({ label: "Slider" }, state, { current: track })
    )!;

    expect(result.groupProps.role).toBe("group");
    expect(result.labelProps.htmlFor).toBeUndefined();
    expect(typeof result.labelProps.onClick).toBe("function");
    expect((result.outputProps.htmlFor as string).split(" ")).toHaveLength(1);

    scope.stop();
  });

  it("focuses first thumb and sets keyboard modality when label is clicked", () => {
    const track = document.createElement("div");
    vi.spyOn(track, "getBoundingClientRect").mockReturnValue({
      width: 100,
      height: 100,
      top: 0,
      left: 0,
      right: 100,
      bottom: 10,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    const state = createSliderState([0]);
    const setInteractionModalitySpy = vi.spyOn(interactions, "setInteractionModality");

    const scope = effectScope();
    const result = scope.run(() =>
      useSlider({ label: "Slider" }, state, { current: track })
    )!;

    const thumb = document.createElement("input");
    thumb.id = (result.outputProps.htmlFor as string).split(" ")[0];
    const focusSpy = vi.spyOn(thumb, "focus");
    document.body.appendChild(thumb);

    (result.labelProps.onClick as () => void)?.();
    expect(focusSpy).toHaveBeenCalledTimes(1);
    expect(setInteractionModalitySpy).toHaveBeenCalledWith("keyboard");

    scope.stop();
    thumb.remove();
  });

  it("returns expected group props for aria-label", () => {
    const track = document.createElement("div");
    vi.spyOn(track, "getBoundingClientRect").mockReturnValue({
      width: 100,
      height: 100,
      top: 0,
      left: 0,
      right: 100,
      bottom: 100,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    const state = createSliderState([0]);
    const scope = effectScope();
    const result = scope.run(() =>
      useSlider({ "aria-label": "Slider" }, state, { current: track })
    )!;

    expect(result.labelProps).toEqual({});
    expect(result.groupProps.role).toBe("group");
    expect(result.groupProps["aria-label"]).toBe("Slider");

    scope.stop();
  });

  it("sets nearest thumb value and supports track dragging", () => {
    const track = document.createElement("div");
    vi.spyOn(track, "getBoundingClientRect").mockReturnValue({
      width: 100,
      height: 100,
      top: 0,
      left: 0,
      right: 100,
      bottom: 10,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    const state = createSliderState([10, 80]);
    const scope = effectScope();
    const { trackProps } = scope.run(() =>
      useSlider({ "aria-label": "Slider" }, state, { current: track })
    )!;

    const kind = dispatchTrackDown(trackProps, 20);
    expect(state.setThumbValue).toHaveBeenLastCalledWith(0, 20);
    expect(state.values).toEqual([20, 80]);

    dispatchTrackMove(kind, 30);
    expect(state.values).toEqual([30, 80]);

    dispatchTrackUp(kind, 30);
    expect(state.setThumbDragging).toHaveBeenCalledWith(0, false);

    scope.stop();
  });

  it("does not change values when disabled", () => {
    const track = document.createElement("div");
    vi.spyOn(track, "getBoundingClientRect").mockReturnValue({
      width: 100,
      height: 100,
      top: 0,
      left: 0,
      right: 100,
      bottom: 10,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    const state = createSliderState([10, 80]);
    const scope = effectScope();
    const { trackProps } = scope.run(() =>
      useSlider({ "aria-label": "Slider", isDisabled: true }, state, { current: track })
    )!;

    dispatchTrackDown(trackProps, 20);
    expect(state.setThumbValue).not.toHaveBeenCalled();
    expect(state.values).toEqual([10, 80]);

    scope.stop();
  });

  it("supports vertical track dragging", () => {
    const track = document.createElement("div");
    vi.spyOn(track, "getBoundingClientRect").mockReturnValue({
      width: 100,
      height: 100,
      top: 0,
      left: 0,
      right: 100,
      bottom: 100,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    const state = createSliderState([10, 80]);
    const scope = effectScope();
    const { trackProps } = scope.run(() =>
      useSlider({ "aria-label": "Slider", orientation: "vertical" }, state, { current: track })
    )!;

    const kind = dispatchTrackDown(trackProps, 80);
    expect(state.setThumbValue).toHaveBeenLastCalledWith(0, 20);
    expect(state.values).toEqual([20, 80]);

    dispatchTrackMove(kind, 70);
    expect(state.values).toEqual([30, 80]);

    dispatchTrackUp(kind, 70);
    expect(state.setThumbDragging).toHaveBeenCalledWith(0, false);

    scope.stop();
  });

  it("picks the left thumb when stacked and click is before", () => {
    const track = document.createElement("div");
    vi.spyOn(track, "getBoundingClientRect").mockReturnValue({
      width: 100,
      height: 100,
      top: 0,
      left: 0,
      right: 100,
      bottom: 100,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    const state = createSliderState([40, 40]);
    const scope = effectScope();
    const { trackProps } = scope.run(() =>
      useSlider({ "aria-label": "Slider" }, state, { current: track })
    )!;

    dispatchTrackDown(trackProps, 20);
    expect(state.setThumbValue).toHaveBeenLastCalledWith(0, 20);
    expect(state.values).toEqual([20, 40]);

    scope.stop();
  });

  it("picks the right thumb when stacked and click is after", () => {
    const track = document.createElement("div");
    vi.spyOn(track, "getBoundingClientRect").mockReturnValue({
      width: 100,
      height: 100,
      top: 0,
      left: 0,
      right: 100,
      bottom: 100,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    const state = createSliderState([40, 40]);
    const scope = effectScope();
    const { trackProps } = scope.run(() =>
      useSlider({ "aria-label": "Slider" }, state, { current: track })
    )!;

    dispatchTrackDown(trackProps, 60);
    expect(state.setThumbValue).toHaveBeenLastCalledWith(1, 60);
    expect(state.values).toEqual([40, 60]);

    scope.stop();
  });

  it("picks nearest thumbs correctly in dense stacked sets", () => {
    const track = document.createElement("div");
    vi.spyOn(track, "getBoundingClientRect").mockReturnValue({
      width: 100,
      height: 100,
      top: 0,
      left: 0,
      right: 100,
      bottom: 100,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    const state = createSliderState([25, 25, 50, 75, 75]);
    const scope = effectScope();
    const { trackProps } = scope.run(() =>
      useSlider({ "aria-label": "Slider" }, state, { current: track })
    )!;

    const kind = dispatchTrackDown(trackProps, 70);
    expect(state.setThumbValue).toHaveBeenLastCalledWith(3, 70);
    expect(state.values).toEqual([25, 25, 50, 70, 75]);
    dispatchTrackUp(kind, 70);

    dispatchTrackDown(trackProps, 20);
    expect(state.setThumbValue).toHaveBeenLastCalledWith(0, 20);
    expect(state.values).toEqual([20, 25, 50, 70, 75]);

    scope.stop();
  });

  it("ignores modified mouse interactions on track", () => {
    const track = document.createElement("div");
    vi.spyOn(track, "getBoundingClientRect").mockReturnValue({
      width: 100,
      height: 100,
      top: 0,
      left: 0,
      right: 100,
      bottom: 100,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    const state = createSliderState([10, 80]);
    const scope = effectScope();
    const { trackProps } = scope.run(() =>
      useSlider({ "aria-label": "Slider" }, state, { current: track })
    )!;

    const modifiedMouseEvent = new MouseEvent("mousedown", { bubbles: true, cancelable: true });
    Object.defineProperty(modifiedMouseEvent, "button", { value: 0 });
    Object.defineProperty(modifiedMouseEvent, "clientX", { value: 20 });
    Object.defineProperty(modifiedMouseEvent, "clientY", { value: 20 });
    Object.defineProperty(modifiedMouseEvent, "altKey", { value: true });
    (trackProps.onMousedown as (event: MouseEvent) => void)(modifiedMouseEvent);

    expect(state.setThumbValue).not.toHaveBeenCalled();
    expect(state.values).toEqual([10, 80]);

    scope.stop();
  });

  it("supports pointer track dragging when PointerEvent is available", () => {
    const originalPointerEvent = globalThis.PointerEvent;
    vi.stubGlobal("PointerEvent", MouseEvent);

    const track = document.createElement("div");
    vi.spyOn(track, "getBoundingClientRect").mockReturnValue({
      width: 100,
      height: 100,
      top: 0,
      left: 0,
      right: 100,
      bottom: 100,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    const state = createSliderState([10, 80]);
    const scope = effectScope();
    const { trackProps } = scope.run(() =>
      useSlider({ "aria-label": "Slider" }, state, { current: track })
    )!;

    const kind = dispatchTrackDown(trackProps, 20);
    expect(kind).toBe("pointer");
    expect(state.values).toEqual([20, 80]);

    dispatchTrackMove(kind, 40);
    expect(state.values).toEqual([40, 80]);

    dispatchTrackUp(kind, 40);
    expect(state.setThumbDragging).toHaveBeenCalledWith(0, false);
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

    const track = document.createElement("div");
    vi.spyOn(track, "getBoundingClientRect").mockReturnValue({
      width: 100,
      height: 100,
      top: 0,
      left: 0,
      right: 100,
      bottom: 100,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    const state = createSliderState([10, 80]);
    const scope = effectScope();
    const { trackProps } = scope.run(() =>
      useSlider({ "aria-label": "Slider" }, state, { current: track })
    )!;

    const modifiedPointerEvent = new MouseEvent("pointerdown", { bubbles: true, cancelable: true });
    Object.defineProperty(modifiedPointerEvent, "button", { value: 0 });
    Object.defineProperty(modifiedPointerEvent, "ctrlKey", { value: true });
    Object.defineProperty(modifiedPointerEvent, "clientX", { value: 20 });
    Object.defineProperty(modifiedPointerEvent, "clientY", { value: 20 });
    Object.defineProperty(modifiedPointerEvent, "pointerId", { value: 1 });
    Object.defineProperty(modifiedPointerEvent, "pointerType", { value: "mouse" });
    (trackProps.onPointerdown as (event: PointerEvent) => void)(modifiedPointerEvent as PointerEvent);

    expect(state.setThumbValue).not.toHaveBeenCalled();
    expect(state.values).toEqual([10, 80]);
    scope.stop();

    if (originalPointerEvent === undefined) {
      vi.unstubAllGlobals();
    } else {
      vi.stubGlobal("PointerEvent", originalPointerEvent);
    }
  });

  it("supports touch track dragging interactions", () => {
    const track = document.createElement("div");
    vi.spyOn(track, "getBoundingClientRect").mockReturnValue({
      width: 100,
      height: 100,
      top: 0,
      left: 0,
      right: 100,
      bottom: 100,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    const state = createSliderState([10, 80]);
    const scope = effectScope();
    const { trackProps } = scope.run(() =>
      useSlider({ "aria-label": "Slider" }, state, { current: track })
    )!;

    dispatchTrackTouchStart(trackProps, 20);
    expect(state.values).toEqual([20, 80]);

    dispatchTrackTouchMove(30);
    expect(state.values).toEqual([30, 80]);

    dispatchTrackTouchEnd(30);
    expect(state.setThumbDragging).toHaveBeenCalledWith(0, false);

    scope.stop();
  });
});
