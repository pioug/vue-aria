import { effectScope, ref } from "vue";
import { describe, expect, it, vi } from "vitest";
import { useSlider } from "../src/useSlider";
import { useSliderThumb } from "../src/useSliderThumb";
import { useSliderState } from "@vue-aria/slider-state";

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
    return "pointer" as const;
  }

  const event = new MouseEvent("mousedown", { bubbles: true, cancelable: true });
  Object.defineProperty(event, "button", { value: 0 });
  Object.defineProperty(event, "clientX", { value });
  Object.defineProperty(event, "clientY", { value });
  Object.defineProperty(event, "pageX", { value });
  Object.defineProperty(event, "pageY", { value });
  (trackProps.onMousedown as (event: MouseEvent) => void)(event);
  return "mouse" as const;
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

function dispatchThumbDown(thumbProps: Record<string, unknown>, value: number) {
  if (typeof PointerEvent !== "undefined" && thumbProps.onPointerdown) {
    const event = new MouseEvent("pointerdown", { bubbles: true, cancelable: true });
    Object.defineProperty(event, "button", { value: 0 });
    Object.defineProperty(event, "pageX", { value });
    Object.defineProperty(event, "pageY", { value });
    Object.defineProperty(event, "pointerId", { value: 1 });
    Object.defineProperty(event, "pointerType", { value: "mouse" });
    (thumbProps.onPointerdown as (event: PointerEvent) => void)(event as PointerEvent);
    return "pointer" as const;
  }

  const event = new MouseEvent("mousedown", { bubbles: true, cancelable: true });
  Object.defineProperty(event, "button", { value: 0 });
  Object.defineProperty(event, "pageX", { value });
  Object.defineProperty(event, "pageY", { value });
  (thumbProps.onMousedown as (event: MouseEvent) => void)(event);
  return "mouse" as const;
}

function dispatchThumbMove(kind: "pointer" | "mouse", value: number) {
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

function dispatchThumbUp(kind: "pointer" | "mouse", value: number) {
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

describe("useSlider integration with useSliderState", () => {
  const numberFormatter = new Intl.NumberFormat("en-US", {});

  it("updates closest thumb value from track click", () => {
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

    const scope = effectScope();
    const { state, trackProps } = scope.run(() => {
      const state = useSliderState({
        defaultValue: [10, 80],
        numberFormatter,
      });
      const { trackProps } = useSlider({ "aria-label": "Slider" }, state as any, {
        current: track,
      });
      return { state, trackProps };
    })!;

    const kind = dispatchTrackDown(trackProps, 20);
    dispatchTrackUp(kind, 20);
    expect(state.values).toEqual([20, 80]);

    dispatchTrackDown(trackProps, 90);
    dispatchTrackUp(kind, 90);
    expect(state.values).toEqual([20, 90]);

    scope.stop();
  });

  it("updates thumb value while dragging with real state", () => {
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

    const inputRef = ref<HTMLInputElement | null>(document.createElement("input"));
    const scope = effectScope();
    const { state, thumbProps } = scope.run(() => {
      const state = useSliderState({
        defaultValue: [10, 80],
        numberFormatter,
      });
      useSlider({ "aria-label": "Slider" }, state as any, { current: track });
      const { thumbProps } = useSliderThumb(
        {
          index: 0,
          "aria-label": "Thumb",
          trackRef: { current: track },
          inputRef,
        },
        state as any
      );
      return { state, thumbProps };
    })!;

    const kind = dispatchThumbDown(thumbProps, 10);
    dispatchThumbMove(kind, 40);
    dispatchThumbUp(kind, 40);

    expect(state.values).toEqual([40, 80]);
    expect(state.isThumbDragging(0)).toBe(false);

    scope.stop();
  });

  it("clamps upper thumb drag at lower thumb value", () => {
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

    const minInputRef = ref<HTMLInputElement | null>(document.createElement("input"));
    const maxInputRef = ref<HTMLInputElement | null>(document.createElement("input"));
    const scope = effectScope();
    const { state, maxThumbProps } = scope.run(() => {
      const state = useSliderState({
        defaultValue: [40, 80],
        numberFormatter,
      });
      useSlider({ "aria-label": "Slider" }, state as any, { current: track });
      useSliderThumb(
        {
          index: 0,
          "aria-label": "Min",
          trackRef: { current: track },
          inputRef: minInputRef,
        },
        state as any
      );
      const { thumbProps } = useSliderThumb(
        {
          index: 1,
          "aria-label": "Max",
          trackRef: { current: track },
          inputRef: maxInputRef,
        },
        state as any
      );
      return { state, maxThumbProps: thumbProps };
    })!;

    const kind = dispatchThumbDown(maxThumbProps, 80);
    dispatchThumbMove(kind, 60);
    expect(state.values).toEqual([40, 60]);

    dispatchThumbMove(kind, 30);
    expect(state.values).toEqual([40, 40]);

    dispatchThumbUp(kind, 30);
    expect(state.isThumbDragging(1)).toBe(false);

    scope.stop();
  });
});
