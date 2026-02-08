import { ref } from "vue";
import { describe, expect, it, vi } from "vitest";
import { useSlider } from "../src/useSlider";
import { useSliderThumb } from "../src/useSliderThumb";
import { createSliderState } from "./createSliderState";

interface ThumbHandlers {
  onPointerdown?: (event: PointerEvent) => void;
}

interface InputHandlers {
  onChange?: (event: Event) => void;
  onKeydown?: (event: KeyboardEvent) => void;
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

describe("useSliderThumb", () => {
  it("provides range input props and thumb labeling", () => {
    const state = createSliderState({
      defaultValue: [50],
      minValue: 10,
      maxValue: 200,
      step: 2,
    });
    const track = document.createElement("div");
    setTrackRect(track);
    const trackRef = ref<Element | null>(track);

    const slider = useSlider(
      {
        label: "slider",
      },
      state,
      trackRef
    );
    const thumb = useSliderThumb(
      {
        index: 0,
        trackRef,
      },
      state
    );

    expect(slider.groupProps.value.role).toBe("group");
    expect(thumb.inputProps.value.type).toBe("range");
    expect(thumb.inputProps.value.step).toBe(2);
    expect(thumb.inputProps.value.value).toBe(50);
    expect(thumb.inputProps.value.min).toBe(10);
    expect(thumb.inputProps.value.max).toBe(200);
    expect(thumb.inputProps.value["aria-labelledby"]).toContain(
      slider.labelProps.value.id as string
    );
  });

  it("updates slider value on input change", () => {
    const state = createSliderState({
      defaultValue: [50],
      minValue: 10,
      maxValue: 200,
      step: 2,
    });
    const track = document.createElement("div");
    setTrackRect(track);
    const trackRef = ref<Element | null>(track);
    useSlider({ "aria-label": "slider" }, state, trackRef);
    const thumb = useSliderThumb(
      {
        index: 0,
        trackRef,
      },
      state
    );

    const handlers = thumb.inputProps.value as InputHandlers;
    handlers.onChange?.({
      target: { value: "70" },
    } as unknown as Event);

    expect(state.valuesRef.value).toEqual([70]);
  });

  it("supports pointer dragging", () => {
    const onChange = vi.fn();
    const onChangeEnd = vi.fn();
    const state = createSliderState({
      defaultValue: [10],
      onChange,
      onChangeEnd,
    });
    const track = document.createElement("div");
    setTrackRect(track);
    const trackRef = ref<Element | null>(track);
    useSlider({ "aria-label": "slider" }, state, trackRef);
    const thumb = useSliderThumb(
      {
        index: 0,
        trackRef,
      },
      state
    );

    const thumbHandlers = thumb.thumbProps.value as ThumbHandlers;
    thumbHandlers.onPointerdown?.(
      createPointerEvent("pointerdown", {
        pointerId: 3,
        pointerType: "mouse",
        button: 0,
        pageX: 10,
      })
    );
    window.dispatchEvent(
      createPointerEvent("pointermove", {
        pointerId: 3,
        pointerType: "mouse",
        pageX: 20,
      })
    );
    window.dispatchEvent(
      createPointerEvent("pointermove", {
        pointerId: 3,
        pointerType: "mouse",
        pageX: 40,
      })
    );
    window.dispatchEvent(
      createPointerEvent("pointerup", {
        pointerId: 3,
        pointerType: "mouse",
        pageX: 40,
      })
    );

    expect(onChange).toHaveBeenLastCalledWith([40]);
    expect(onChangeEnd).toHaveBeenLastCalledWith([40]);
    expect(state.valuesRef.value).toEqual([40]);
  });

  it("supports page/home/end keyboard behavior", () => {
    const state = createSliderState({
      defaultValue: [10],
      minValue: 0,
      maxValue: 100,
      step: 1,
      pageSize: 10,
    });
    const track = document.createElement("div");
    setTrackRect(track);
    const trackRef = ref<Element | null>(track);
    useSlider({ "aria-label": "slider" }, state, trackRef);
    const thumb = useSliderThumb(
      {
        index: 0,
        trackRef,
      },
      state
    );
    const inputHandlers = thumb.inputProps.value as InputHandlers;

    inputHandlers.onKeydown?.({
      key: "PageUp",
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as KeyboardEvent);
    expect(state.valuesRef.value).toEqual([20]);

    inputHandlers.onKeydown?.({
      key: "Home",
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as KeyboardEvent);
    expect(state.valuesRef.value).toEqual([0]);

    inputHandlers.onKeydown?.({
      key: "End",
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as KeyboardEvent);
    expect(state.valuesRef.value).toEqual([100]);
  });

  it("composes describedby and details from slider and thumb", () => {
    const state = createSliderState({
      defaultValue: [50],
    });
    const track = document.createElement("div");
    setTrackRect(track);
    const trackRef = ref<Element | null>(track);
    useSlider(
      {
        "aria-label": "slider",
        "aria-describedby": "group-description",
        "aria-details": "group-details",
      },
      state,
      trackRef
    );
    const thumb = useSliderThumb(
      {
        index: 0,
        trackRef,
        "aria-describedby": "thumb-description",
        "aria-details": "thumb-details",
      },
      state
    );

    expect(thumb.inputProps.value["aria-describedby"]).toBe(
      "group-description thumb-description"
    );
    expect(thumb.inputProps.value["aria-details"]).toBe("group-details thumb-details");
  });

  it("disables thumb interactions when disabled", () => {
    const state = createSliderState({
      defaultValue: [10],
      isDisabled: true,
    });
    const track = document.createElement("div");
    setTrackRect(track);
    const trackRef = ref<Element | null>(track);
    useSlider(
      {
        "aria-label": "slider",
        isDisabled: true,
      },
      state,
      trackRef
    );
    const thumb = useSliderThumb(
      {
        index: 0,
        trackRef,
        isDisabled: true,
      },
      state
    );

    expect(thumb.isDisabled.value).toBe(true);
    expect(thumb.inputProps.value.disabled).toBe(true);
    expect(thumb.inputProps.value.tabIndex).toBeUndefined();
    expect(thumb.thumbProps.value.onPointerdown).toBeUndefined();
  });
});
