import { effectScope, ref } from "vue";
import { describe, expect, it, vi } from "vitest";
import { useSlider } from "../src/useSlider";
import { useSliderThumb } from "../src/useSliderThumb";
import { useSliderState } from "@vue-aria/slider-state";

const TRACK_RECT = {
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

function createTrack() {
  const track = document.createElement("div");
  vi.spyOn(track, "getBoundingClientRect").mockReturnValue(TRACK_RECT);
  return track;
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

function dispatchThumbKey(thumbProps: Record<string, unknown>, key: string) {
  const event = {
    key,
    type: "keydown",
    target: null,
    currentTarget: null,
    shiftKey: false,
    ctrlKey: false,
    metaKey: false,
    altKey: false,
    defaultPrevented: false,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
  } as unknown as KeyboardEvent;
  const onKeydown = (thumbProps.onKeydown ?? thumbProps.onKeyDown) as
    | ((event: KeyboardEvent) => void)
    | undefined;
  onKeydown?.(event);
}

describe("useSlider integration with useSliderState", () => {
  const numberFormatter = new Intl.NumberFormat("en-US", {});

  it("updates closest thumb value from track click", () => {
    const track = createTrack();

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

  it("updates thumb value while dragging with real state and fires callbacks", () => {
    const track = createTrack();
    const onChange = vi.fn();
    const onChangeEnd = vi.fn();

    const inputRef = ref<HTMLInputElement | null>(document.createElement("input"));
    const scope = effectScope();
    const { state, thumbProps } = scope.run(() => {
      const state = useSliderState({
        defaultValue: [10, 80],
        onChange,
        onChangeEnd,
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
    expect(onChange).toHaveBeenLastCalledWith([40, 80]);
    expect(onChangeEnd).toHaveBeenLastCalledWith([40, 80]);

    scope.stop();
  });

  it("clamps upper thumb drag at lower thumb value", () => {
    const track = createTrack();

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

  it("supports pointer-path thumb dragging when PointerEvent is available", () => {
    const originalPointerEvent = globalThis.PointerEvent;
    vi.stubGlobal("PointerEvent", MouseEvent);

    const track = createTrack();
    const inputRef = ref<HTMLInputElement | null>(document.createElement("input"));
    const scope = effectScope();
    const { state, thumbProps } = scope.run(() => {
      const state = useSliderState({
        defaultValue: [10],
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
    expect(kind).toBe("pointer");
    dispatchThumbMove(kind, 30);
    dispatchThumbUp(kind, 30);

    expect(state.values).toEqual([30]);
    expect(state.isThumbDragging(0)).toBe(false);

    scope.stop();
    if (originalPointerEvent === undefined) {
      vi.unstubAllGlobals();
    } else {
      vi.stubGlobal("PointerEvent", originalPointerEvent);
    }
  });

  it("supports arrow-key thumb movement in horizontal orientation", () => {
    const track = createTrack();
    const onChange = vi.fn();
    const onChangeEnd = vi.fn();
    const inputRef = ref<HTMLInputElement | null>(document.createElement("input"));

    const scope = effectScope();
    const { state, thumbProps } = scope.run(() => {
      const state = useSliderState({
        defaultValue: [10],
        onChange,
        onChangeEnd,
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

    dispatchThumbKey(thumbProps, "ArrowRight");
    expect(state.values).toEqual([11]);
    expect(onChange).toHaveBeenLastCalledWith([11]);
    expect(onChangeEnd).toHaveBeenLastCalledWith([11]);

    dispatchThumbKey(thumbProps, "ArrowLeft");
    expect(state.values).toEqual([10]);
    expect(onChange).toHaveBeenLastCalledWith([10]);
    expect(onChangeEnd).toHaveBeenLastCalledWith([10]);

    scope.stop();
  });

  it("fires onChangeEnd at the beginning boundary on ArrowLeft", () => {
    const track = createTrack();
    const onChange = vi.fn();
    const onChangeEnd = vi.fn();
    const inputRef = ref<HTMLInputElement | null>(document.createElement("input"));

    const scope = effectScope();
    const { state, thumbProps } = scope.run(() => {
      const state = useSliderState({
        defaultValue: [0],
        onChange,
        onChangeEnd,
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

    dispatchThumbKey(thumbProps, "ArrowLeft");
    expect(state.values).toEqual([0]);
    expect(onChange).not.toHaveBeenCalled();
    expect(onChangeEnd).toHaveBeenLastCalledWith([0]);

    dispatchThumbKey(thumbProps, "ArrowRight");
    expect(state.values).toEqual([1]);
    expect(onChange).toHaveBeenLastCalledWith([1]);
    expect(onChangeEnd).toHaveBeenLastCalledWith([1]);

    scope.stop();
  });

  it("fires onChangeEnd at the end boundary on ArrowRight", () => {
    const track = createTrack();
    const onChange = vi.fn();
    const onChangeEnd = vi.fn();
    const inputRef = ref<HTMLInputElement | null>(document.createElement("input"));

    const scope = effectScope();
    const { state, thumbProps } = scope.run(() => {
      const state = useSliderState({
        defaultValue: [100],
        onChange,
        onChangeEnd,
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

    dispatchThumbKey(thumbProps, "ArrowRight");
    expect(state.values).toEqual([100]);
    expect(onChange).not.toHaveBeenCalled();
    expect(onChangeEnd).toHaveBeenLastCalledWith([100]);

    dispatchThumbKey(thumbProps, "ArrowLeft");
    expect(state.values).toEqual([99]);
    expect(onChange).toHaveBeenLastCalledWith([99]);
    expect(onChangeEnd).toHaveBeenLastCalledWith([99]);

    scope.stop();
  });

  it("supports arrow-key thumb movement in vertical orientation", () => {
    const track = createTrack();
    const onChange = vi.fn();
    const onChangeEnd = vi.fn();
    const inputRef = ref<HTMLInputElement | null>(document.createElement("input"));

    const scope = effectScope();
    const { state, thumbProps } = scope.run(() => {
      const state = useSliderState({
        defaultValue: [10],
        orientation: "vertical",
        onChange,
        onChangeEnd,
        numberFormatter,
      });
      useSlider({ "aria-label": "Slider", orientation: "vertical" }, state as any, {
        current: track,
      });
      const { thumbProps } = useSliderThumb(
        {
          index: 0,
          "aria-label": "Thumb",
          orientation: "vertical",
          trackRef: { current: track },
          inputRef,
        },
        state as any
      );
      return { state, thumbProps };
    })!;

    dispatchThumbKey(thumbProps, "ArrowRight");
    expect(state.values).toEqual([11]);
    dispatchThumbKey(thumbProps, "ArrowUp");
    expect(state.values).toEqual([12]);
    dispatchThumbKey(thumbProps, "ArrowDown");
    expect(state.values).toEqual([11]);
    dispatchThumbKey(thumbProps, "ArrowLeft");
    expect(state.values).toEqual([10]);
    expect(onChangeEnd).toHaveBeenLastCalledWith([10]);

    scope.stop();
  });

  it("fires vertical boundary callbacks at bottom and top limits", () => {
    const track = createTrack();
    const bottomChange = vi.fn();
    const bottomChangeEnd = vi.fn();
    const bottomInputRef = ref<HTMLInputElement | null>(document.createElement("input"));

    const bottomScope = effectScope();
    const { bottomState, bottomThumbProps } = bottomScope.run(() => {
      const state = useSliderState({
        defaultValue: [0],
        orientation: "vertical",
        onChange: bottomChange,
        onChangeEnd: bottomChangeEnd,
        numberFormatter,
      });
      useSlider({ "aria-label": "Slider", orientation: "vertical" }, state as any, {
        current: track,
      });
      const { thumbProps } = useSliderThumb(
        {
          index: 0,
          "aria-label": "Thumb",
          orientation: "vertical",
          trackRef: { current: track },
          inputRef: bottomInputRef,
        },
        state as any
      );
      return { bottomState: state, bottomThumbProps: thumbProps };
    })!;

    dispatchThumbKey(bottomThumbProps, "ArrowDown");
    expect(bottomState.values).toEqual([0]);
    expect(bottomChange).not.toHaveBeenCalled();
    expect(bottomChangeEnd).toHaveBeenLastCalledWith([0]);

    dispatchThumbKey(bottomThumbProps, "ArrowUp");
    expect(bottomState.values).toEqual([1]);
    expect(bottomChange).toHaveBeenLastCalledWith([1]);
    expect(bottomChangeEnd).toHaveBeenLastCalledWith([1]);
    bottomScope.stop();

    const topChange = vi.fn();
    const topChangeEnd = vi.fn();
    const topInputRef = ref<HTMLInputElement | null>(document.createElement("input"));
    const topScope = effectScope();
    const { topState, topThumbProps } = topScope.run(() => {
      const state = useSliderState({
        defaultValue: [100],
        orientation: "vertical",
        onChange: topChange,
        onChangeEnd: topChangeEnd,
        numberFormatter,
      });
      useSlider({ "aria-label": "Slider", orientation: "vertical" }, state as any, {
        current: track,
      });
      const { thumbProps } = useSliderThumb(
        {
          index: 0,
          "aria-label": "Thumb",
          orientation: "vertical",
          trackRef: { current: track },
          inputRef: topInputRef,
        },
        state as any
      );
      return { topState: state, topThumbProps: thumbProps };
    })!;

    dispatchThumbKey(topThumbProps, "ArrowUp");
    expect(topState.values).toEqual([100]);
    expect(topChange).not.toHaveBeenCalled();
    expect(topChangeEnd).toHaveBeenLastCalledWith([100]);

    dispatchThumbKey(topThumbProps, "ArrowDown");
    expect(topState.values).toEqual([99]);
    expect(topChange).toHaveBeenLastCalledWith([99]);
    expect(topChangeEnd).toHaveBeenLastCalledWith([99]);
    topScope.stop();
  });
});
