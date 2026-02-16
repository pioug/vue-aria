import { effectScope, ref } from "vue";
import { describe, expect, it, vi } from "vitest";
import { useSlider } from "../src/useSlider";
import { useSliderThumb } from "../src/useSliderThumb";
import { useSliderState } from "@vue-stately/slider";

const TRACK_RECT = {
  width: 100,
  height: 10,
  top: 0,
  left: 0,
  right: 100,
  bottom: 10,
  x: 0,
  y: 0,
  toJSON: () => ({}),
};

const numberFormatter = new Intl.NumberFormat("en-US", {});

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

function dispatchThumbTouchStart(thumbProps: Record<string, unknown>, value: number) {
  const event = new Event("touchstart", { bubbles: true, cancelable: true });
  Object.defineProperty(event, "changedTouches", {
    value: [{ identifier: 1, pageX: value, pageY: value }],
  });
  (thumbProps.onTouchstart as (event: TouchEvent) => void)(event as TouchEvent);
}

function dispatchThumbTouchMove(value: number) {
  const event = new Event("touchmove", { bubbles: true, cancelable: true });
  Object.defineProperty(event, "changedTouches", {
    value: [{ identifier: 1, pageX: value, pageY: value }],
  });
  window.dispatchEvent(event);
}

function dispatchThumbTouchEnd(value: number) {
  const event = new Event("touchend", { bubbles: true, cancelable: true });
  Object.defineProperty(event, "changedTouches", {
    value: [{ identifier: 1, pageX: value, pageY: value }],
  });
  window.dispatchEvent(event);
}

function setupSingleThumb({
  defaultValue = [50],
  sliderProps = { label: "Slider" },
  thumbOptions = {},
}: {
  defaultValue?: number[];
  sliderProps?: Record<string, unknown>;
  thumbOptions?: Record<string, unknown>;
}) {
  const track = document.createElement("div");
  vi.spyOn(track, "getBoundingClientRect").mockReturnValue(TRACK_RECT);
  const inputRef = ref<HTMLInputElement | null>(document.createElement("input"));

  const scope = effectScope();
  const result = scope.run(() => {
    const state = useSliderState({
      defaultValue,
      minValue: 10,
      maxValue: 200,
      numberFormatter,
    });
    const setThumbEditableSpy = vi.spyOn(state, "setThumbEditable");
    const slider = useSlider(sliderProps as any, state as any, { current: track });
    const thumb = useSliderThumb(
      {
        index: 0,
        trackRef: { current: track },
        inputRef,
        ...thumbOptions,
      } as any,
      state as any
    );
    return { state, slider, thumb, setThumbEditableSpy };
  })!;

  return { scope, ...result };
}

describe("useSliderThumb", () => {
  it("wires slider-level label to thumb input aria-labelledby", () => {
    const { scope, slider, thumb } = setupSingleThumb({
      defaultValue: [50],
      sliderProps: { label: "Slider" },
    });

    expect(thumb.inputProps["aria-labelledby"]).toBe(slider.labelProps.id);

    scope.stop();
  });

  it("wires thumb-level visible label with slider aria-label context", () => {
    const { scope, slider, thumb } = setupSingleThumb({
      defaultValue: [50],
      sliderProps: { "aria-label": "Slider" },
      thumbOptions: { label: "Thumb" },
    });

    expect(thumb.inputProps["aria-labelledby"]).toContain(thumb.labelProps.id);
    expect(thumb.inputProps["aria-labelledby"]).toContain(slider.groupProps.id);
    expect(thumb.labelProps.htmlFor).toBe(thumb.inputProps.id);

    scope.stop();
  });

  it("supports per-thumb aria-label wiring in multi-thumb state", () => {
    const track = document.createElement("div");
    vi.spyOn(track, "getBoundingClientRect").mockReturnValue(TRACK_RECT);
    const inputRef0 = ref<HTMLInputElement | null>(document.createElement("input"));
    const inputRef1 = ref<HTMLInputElement | null>(document.createElement("input"));

    const scope = effectScope();
    const result = scope.run(() => {
      const state = useSliderState({
        defaultValue: [50, 70],
        minValue: 10,
        maxValue: 200,
        numberFormatter,
      });
      const slider = useSlider({ "aria-label": "Slider" }, state as any, { current: track });
      const thumb0 = useSliderThumb(
        {
          index: 0,
          "aria-label": "thumb0",
          trackRef: { current: track },
          inputRef: inputRef0,
        },
        state as any
      );
      const thumb1 = useSliderThumb(
        {
          index: 1,
          "aria-label": "thumb1",
          trackRef: { current: track },
          inputRef: inputRef1,
        },
        state as any
      );
      return { slider, thumb0, thumb1 };
    })!;

    expect(result.thumb0.inputProps["aria-label"]).toBe("thumb0");
    expect(result.thumb0.inputProps.min).toBe(10);
    expect(result.thumb0.inputProps.max).toBe(70);
    expect(result.thumb0.inputProps["aria-labelledby"]).toContain(result.thumb0.inputProps.id);
    expect(result.thumb0.inputProps["aria-labelledby"]).toContain(result.slider.groupProps.id);

    expect(result.thumb1.inputProps["aria-label"]).toBe("thumb1");
    expect(result.thumb1.inputProps.min).toBe(50);
    expect(result.thumb1.inputProps.max).toBe(200);
    expect(result.thumb1.inputProps["aria-labelledby"]).toContain(result.thumb1.inputProps.id);
    expect(result.thumb1.inputProps["aria-labelledby"]).toContain(result.slider.groupProps.id);

    scope.stop();
  });

  it("returns expected input props and updates thumb value on change", () => {
    const { scope, state, thumb } = setupSingleThumb({
      defaultValue: [50],
      sliderProps: { label: "Slider" },
      thumbOptions: {
        name: "value",
        form: "form-id",
      },
    });

    expect(thumb.inputProps.type).toBe("range");
    expect(thumb.inputProps.min).toBe(10);
    expect(thumb.inputProps.max).toBe(200);
    expect(thumb.inputProps.value).toBe(50);
    expect(thumb.inputProps.name).toBe("value");
    expect(thumb.inputProps.form).toBe("form-id");
    expect(typeof thumb.inputProps["aria-labelledby"]).toBe("string");
    expect(thumb.thumbProps.style).toMatchObject({
      left: "21.052631578947366%",
      position: "absolute",
    });

    (thumb.inputProps.onChange as (event: Event) => void)({
      target: { value: "120.5" },
    } as unknown as Event);
    expect(state.values).toEqual([121]);

    scope.stop();
  });

  it("handles PageUp keyboard interaction and shared description metadata", () => {
    const { scope, state, thumb } = setupSingleThumb({
      defaultValue: [50],
      sliderProps: { label: "Slider", "aria-describedby": "slider-description" },
      thumbOptions: { "aria-describedby": "thumb-description" },
    });

    expect(thumb.inputProps["aria-describedby"]).toBe("slider-description thumb-description");

    dispatchThumbKey(thumb.thumbProps, "PageUp");
    expect(state.values).toEqual([69]);
    expect(state.isThumbDragging(0)).toBe(false);

    scope.stop();
  });

  it("ignores modified or non-primary mouse interactions on thumb", () => {
    const { scope, state, thumb } = setupSingleThumb({
      defaultValue: [50],
      sliderProps: { label: "Slider" },
    });

    const onMousedown = thumb.thumbProps.onMousedown as ((event: MouseEvent) => void) | undefined;
    expect(onMousedown).toBeDefined();

    const rightClick = new MouseEvent("mousedown", { bubbles: true, cancelable: true });
    Object.defineProperty(rightClick, "button", { value: 2 });
    onMousedown?.(rightClick);

    const modifiedClick = new MouseEvent("mousedown", { bubbles: true, cancelable: true });
    Object.defineProperty(modifiedClick, "button", { value: 0 });
    Object.defineProperty(modifiedClick, "ctrlKey", { value: true });
    onMousedown?.(modifiedClick);

    expect(state.values).toEqual([50]);
    expect(state.isThumbDragging(0)).toBe(false);

    scope.stop();
  });

  it("handles PageDown/Home/End keyboard interactions", () => {
    const { scope, state, thumb } = setupSingleThumb({
      defaultValue: [50],
      sliderProps: { label: "Slider" },
    });

    dispatchThumbKey(thumb.thumbProps, "PageDown");
    expect(state.values).toEqual([31]);

    dispatchThumbKey(thumb.thumbProps, "Home");
    expect(state.values).toEqual([10]);

    dispatchThumbKey(thumb.thumbProps, "End");
    expect(state.values).toEqual([200]);
    expect(state.isThumbDragging(0)).toBe(false);

    scope.stop();
  });

  it("disables thumb input interactions when thumb is disabled", () => {
    const { scope, thumb, setThumbEditableSpy } = setupSingleThumb({
      defaultValue: [50],
      sliderProps: { label: "Slider" },
      thumbOptions: { isDisabled: true },
    });

    expect(thumb.isDisabled).toBe(true);
    expect(thumb.inputProps.disabled).toBe(true);
    expect(thumb.inputProps.tabIndex).toBeUndefined();
    expect(thumb.thumbProps.onMousedown).toBeUndefined();
    expect(thumb.thumbProps.onPointerdown).toBeUndefined();
    expect(setThumbEditableSpy).toHaveBeenCalledWith(0, false);

    scope.stop();
  });

  it("supports touch thumb dragging interactions", () => {
    const { scope, state, thumb } = setupSingleThumb({
      defaultValue: [50],
      sliderProps: { label: "Slider" },
    });

    dispatchThumbTouchStart(thumb.thumbProps, 10);
    expect(state.isThumbDragging(0)).toBe(true);

    dispatchThumbTouchMove(40);
    expect(state.values[0]).toBeGreaterThan(50);

    dispatchThumbTouchEnd(40);
    expect(state.isThumbDragging(0)).toBe(false);

    scope.stop();
  });
});
