import { ref } from "vue";
import { describe, expect, it, vi } from "vitest";
import { useSlider } from "../src/useSlider";
import { createSliderState } from "./createSliderState";

interface TrackHandlers {
  onPointerdown?: (event: PointerEvent) => void;
  onPointerup?: (event: PointerEvent) => void;
}

function createPointerEvent(
  type: string,
  options: {
    pointerId: number;
    pointerType: "mouse" | "touch" | "pen";
    button?: number;
    pageX: number;
    pageY?: number;
  }
): PointerEvent {
  const event = new PointerEvent(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, "pointerId", { value: options.pointerId });
  Object.defineProperty(event, "pointerType", { value: options.pointerType });
  Object.defineProperty(event, "button", { value: options.button ?? 0 });
  Object.defineProperty(event, "pageX", { value: options.pageX });
  Object.defineProperty(event, "pageY", { value: options.pageY ?? 0 });
  Object.defineProperty(event, "clientX", { value: options.pageX });
  Object.defineProperty(event, "clientY", { value: options.pageY ?? 0 });
  return event;
}

function setTrackRect(track: HTMLElement, width = 100, height = 100): void {
  Object.defineProperty(track, "getBoundingClientRect", {
    value: () => ({
      top: 0,
      left: 0,
      width,
      height,
      right: width,
      bottom: height,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    }),
  });
}

describe("useSlider", () => {
  it("wires label and group semantics", () => {
    const state = createSliderState({ defaultValue: [0] });
    const trackRef = ref<Element | null>(null);
    const withLabel = useSlider({ label: "Slider" }, state, trackRef);

    expect(withLabel.groupProps.value.role).toBe("group");
    expect(withLabel.labelProps.value.htmlFor).toBeUndefined();

    const withAriaLabel = useSlider({ "aria-label": "Slider" }, state, trackRef);
    expect(withAriaLabel.groupProps.value.role).toBe("group");
    expect(withAriaLabel.groupProps.value["aria-label"]).toBe("Slider");
  });

  it("sets closest thumb value on track click", () => {
    const onChange = vi.fn();
    const state = createSliderState({
      defaultValue: [10, 80],
      onChange,
    });
    const track = document.createElement("div");
    setTrackRect(track);
    const trackRef = ref<Element | null>(track);
    const { trackProps } = useSlider({ "aria-label": "Slider" }, state, trackRef);
    const handlers = trackProps.value as TrackHandlers;

    handlers.onPointerdown?.(
      createPointerEvent("pointerdown", {
        pointerId: 1,
        pointerType: "mouse",
        button: 0,
        pageX: 20,
      })
    );
    handlers.onPointerup?.(
      createPointerEvent("pointerup", {
        pointerId: 1,
        pointerType: "mouse",
        pageX: 20,
      })
    );

    expect(onChange).toHaveBeenLastCalledWith([20, 80]);
    expect(state.valuesRef.value).toEqual([20, 80]);
  });

  it("supports pointer drag on track", () => {
    const onChange = vi.fn();
    const onChangeEnd = vi.fn();
    const state = createSliderState({
      defaultValue: [10, 80],
      onChange,
      onChangeEnd,
    });
    const track = document.createElement("div");
    setTrackRect(track);
    const trackRef = ref<Element | null>(track);
    const { trackProps } = useSlider({ "aria-label": "Slider" }, state, trackRef);
    const handlers = trackProps.value as TrackHandlers;

    handlers.onPointerdown?.(
      createPointerEvent("pointerdown", {
        pointerId: 2,
        pointerType: "mouse",
        button: 0,
        pageX: 20,
      })
    );
    window.dispatchEvent(
      createPointerEvent("pointermove", {
        pointerId: 2,
        pointerType: "mouse",
        pageX: 30,
      })
    );
    window.dispatchEvent(
      createPointerEvent("pointermove", {
        pointerId: 2,
        pointerType: "mouse",
        pageX: 40,
      })
    );
    window.dispatchEvent(
      createPointerEvent("pointerup", {
        pointerId: 2,
        pointerType: "mouse",
        pageX: 40,
      })
    );

    expect(onChange).toHaveBeenLastCalledWith([40, 80]);
    expect(onChangeEnd).toHaveBeenLastCalledWith([40, 80]);
    expect(state.valuesRef.value).toEqual([40, 80]);
  });

  it("does not update when disabled", () => {
    const onChange = vi.fn();
    const onChangeEnd = vi.fn();
    const state = createSliderState({
      defaultValue: [10, 80],
      isDisabled: true,
      onChange,
      onChangeEnd,
    });
    const track = document.createElement("div");
    setTrackRect(track);
    const trackRef = ref<Element | null>(track);
    const { trackProps } = useSlider(
      {
        "aria-label": "Slider",
        isDisabled: true,
      },
      state,
      trackRef
    );
    const handlers = trackProps.value as TrackHandlers;

    handlers.onPointerdown?.(
      createPointerEvent("pointerdown", {
        pointerId: 1,
        pointerType: "mouse",
        button: 0,
        pageX: 20,
      })
    );
    window.dispatchEvent(
      createPointerEvent("pointermove", {
        pointerId: 1,
        pointerType: "mouse",
        pageX: 40,
      })
    );
    window.dispatchEvent(
      createPointerEvent("pointerup", {
        pointerId: 1,
        pointerType: "mouse",
        pageX: 40,
      })
    );

    expect(onChange).not.toHaveBeenCalled();
    expect(onChangeEnd).not.toHaveBeenCalled();
    expect(state.valuesRef.value).toEqual([10, 80]);
  });
});
