import { effectScope, ref } from "vue";
import { describe, expect, it, vi } from "vitest";
import { useSlider } from "../src/useSlider";
import { useSliderThumb, type SliderThumbState } from "../src/useSliderThumb";

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

function createSliderThumbState(values: number[] = [50]) {
  const dragging = new Set<number>();
  const state: SliderThumbState = {
    values: [...values],
    defaultValues: [...values],
    orientation: "horizontal",
    step: 1,
    pageSize: 10,
    focusedThumb: undefined,
    isThumbDragging(index) {
      return dragging.has(index);
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
    getThumbPercent(index) {
      return state.values[index] / 100;
    },
    setThumbValue: vi.fn((index: number, value: number) => {
      state.values[index] = value;
    }),
    getThumbMinValue: vi.fn((index: number) => (index === 0 ? 10 : state.values[index - 1])),
    getThumbMaxValue: vi.fn((index: number) =>
      index === state.values.length - 1 ? 200 : state.values[index + 1]
    ),
    getThumbValueLabel: vi.fn((index: number) => String(state.values[index])),
    decrementThumb: vi.fn(),
    incrementThumb: vi.fn(),
    setFocusedThumb: vi.fn((index?: number) => {
      state.focusedThumb = index;
    }),
    setThumbEditable: vi.fn(),
  };

  return state;
}

describe("useSliderThumb", () => {
  it("wires slider-level label to thumb input aria-labelledby", () => {
    const track = document.createElement("div");
    vi.spyOn(track, "getBoundingClientRect").mockReturnValue({
      width: 100,
      height: 10,
      top: 0,
      left: 0,
      right: 100,
      bottom: 10,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    const state = createSliderThumbState([50]);
    const inputRef = ref<HTMLInputElement | null>(document.createElement("input"));
    const scope = effectScope();
    const result = scope.run(() => {
      const slider = useSlider({ label: "Slider" }, state as any, { current: track });
      const thumb = useSliderThumb(
        {
          index: 0,
          trackRef: { current: track },
          inputRef,
        },
        state
      );
      return { slider, thumb };
    })!;

    expect(result.thumb.inputProps["aria-labelledby"]).toBe(result.slider.labelProps.id);

    scope.stop();
  });

  it("wires thumb-level visible label with slider aria-label context", () => {
    const track = document.createElement("div");
    vi.spyOn(track, "getBoundingClientRect").mockReturnValue({
      width: 100,
      height: 10,
      top: 0,
      left: 0,
      right: 100,
      bottom: 10,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    const state = createSliderThumbState([50]);
    const inputRef = ref<HTMLInputElement | null>(document.createElement("input"));
    const scope = effectScope();
    const result = scope.run(() => {
      const slider = useSlider({ "aria-label": "Slider" }, state as any, { current: track });
      const thumb = useSliderThumb(
        {
          index: 0,
          label: "Thumb",
          trackRef: { current: track },
          inputRef,
        },
        state
      );
      return { slider, thumb };
    })!;

    expect(result.thumb.inputProps["aria-labelledby"]).toContain(result.thumb.labelProps.id);
    expect(result.thumb.inputProps["aria-labelledby"]).toContain(result.slider.groupProps.id);
    expect(result.thumb.labelProps.htmlFor).toBe(result.thumb.inputProps.id);

    scope.stop();
  });

  it("supports per-thumb aria-label wiring in multi-thumb state", () => {
    const track = document.createElement("div");
    vi.spyOn(track, "getBoundingClientRect").mockReturnValue({
      width: 100,
      height: 10,
      top: 0,
      left: 0,
      right: 100,
      bottom: 10,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    const state = createSliderThumbState([50, 70]);
    const inputRef0 = ref<HTMLInputElement | null>(document.createElement("input"));
    const inputRef1 = ref<HTMLInputElement | null>(document.createElement("input"));
    const scope = effectScope();
    const result = scope.run(() => {
      const slider = useSlider({ "aria-label": "Slider" }, state as any, { current: track });
      const thumb0 = useSliderThumb(
        {
          index: 0,
          "aria-label": "thumb0",
          trackRef: { current: track },
          inputRef: inputRef0,
        },
        state
      );
      const thumb1 = useSliderThumb(
        {
          index: 1,
          "aria-label": "thumb1",
          trackRef: { current: track },
          inputRef: inputRef1,
        },
        state
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
    const track = document.createElement("div");
    vi.spyOn(track, "getBoundingClientRect").mockReturnValue({
      width: 100,
      height: 10,
      top: 0,
      left: 0,
      right: 100,
      bottom: 10,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    const state = createSliderThumbState();
    const inputRef = ref<HTMLInputElement | null>(document.createElement("input"));
    const scope = effectScope();
    const result = scope.run(() => {
      useSlider({ label: "Slider" }, state as any, { current: track });
      return useSliderThumb(
        {
          index: 0,
          trackRef: { current: track },
          inputRef,
          name: "value",
          form: "form-id",
        },
        state
      );
    })!;

    expect(result.inputProps.type).toBe("range");
    expect(result.inputProps.min).toBe(10);
    expect(result.inputProps.max).toBe(200);
    expect(result.inputProps.value).toBe(50);
    expect(result.inputProps.name).toBe("value");
    expect(result.inputProps.form).toBe("form-id");
    expect(typeof result.inputProps["aria-labelledby"]).toBe("string");
    expect(result.thumbProps.style).toMatchObject({
      left: "50%",
      position: "absolute",
    });

    (result.inputProps.onChange as (event: Event) => void)({
      target: { value: "120.5" },
    } as unknown as Event);
    expect(state.setThumbValue).toHaveBeenLastCalledWith(0, 120.5);

    scope.stop();
  });

  it("handles PageUp keyboard interaction and shared description metadata", () => {
    const track = document.createElement("div");
    vi.spyOn(track, "getBoundingClientRect").mockReturnValue({
      width: 100,
      height: 10,
      top: 0,
      left: 0,
      right: 100,
      bottom: 10,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    const state = createSliderThumbState();
    const inputRef = ref<HTMLInputElement | null>(document.createElement("input"));
    const scope = effectScope();
    const result = scope.run(() => {
      useSlider(
        { label: "Slider", "aria-describedby": "slider-description" },
        state as any,
        { current: track }
      );
      return useSliderThumb(
        {
          index: 0,
          trackRef: { current: track },
          inputRef,
          "aria-describedby": "thumb-description",
        },
        state
      );
    })!;

    expect(result.inputProps["aria-describedby"]).toBe("slider-description thumb-description");

    const onKeydown = (result.thumbProps.onKeydown ?? result.thumbProps.onKeyDown) as
      | ((event: KeyboardEvent) => void)
      | undefined;
    expect(onKeydown).toBeDefined();

    onKeydown?.({
      key: "PageUp",
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      type: "keydown",
      target: track,
      currentTarget: track,
    } as unknown as KeyboardEvent);

    expect(state.incrementThumb).toHaveBeenCalledWith(0, state.pageSize);
    expect(state.setThumbDragging).toHaveBeenCalledWith(0, true);
    expect(state.setThumbDragging).toHaveBeenCalledWith(0, false);

    scope.stop();
  });

  it("ignores modified or non-primary mouse interactions on thumb", () => {
    const track = document.createElement("div");
    vi.spyOn(track, "getBoundingClientRect").mockReturnValue({
      width: 100,
      height: 10,
      top: 0,
      left: 0,
      right: 100,
      bottom: 10,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    const state = createSliderThumbState();
    const inputRef = ref<HTMLInputElement | null>(document.createElement("input"));
    const scope = effectScope();
    const result = scope.run(() => {
      useSlider({ label: "Slider" }, state as any, { current: track });
      return useSliderThumb(
        {
          index: 0,
          trackRef: { current: track },
          inputRef,
        },
        state
      );
    })!;

    const onMousedown = result.thumbProps.onMousedown as ((event: MouseEvent) => void) | undefined;
    expect(onMousedown).toBeDefined();

    const rightClick = new MouseEvent("mousedown", { bubbles: true, cancelable: true });
    Object.defineProperty(rightClick, "button", { value: 2 });
    onMousedown?.(rightClick);

    const modifiedClick = new MouseEvent("mousedown", { bubbles: true, cancelable: true });
    Object.defineProperty(modifiedClick, "button", { value: 0 });
    Object.defineProperty(modifiedClick, "ctrlKey", { value: true });
    onMousedown?.(modifiedClick);

    expect(state.setThumbDragging).not.toHaveBeenCalledWith(0, true);
    expect(state.isThumbDragging(0)).toBe(false);

    scope.stop();
  });

  it("handles PageDown/Home/End keyboard interactions", () => {
    const track = document.createElement("div");
    vi.spyOn(track, "getBoundingClientRect").mockReturnValue({
      width: 100,
      height: 10,
      top: 0,
      left: 0,
      right: 100,
      bottom: 10,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    const state = createSliderThumbState();
    const inputRef = ref<HTMLInputElement | null>(document.createElement("input"));
    const scope = effectScope();
    const result = scope.run(() => {
      useSlider({ label: "Slider" }, state as any, { current: track });
      return useSliderThumb(
        {
          index: 0,
          trackRef: { current: track },
          inputRef,
        },
        state
      );
    })!;

    dispatchThumbKey(result.thumbProps, "PageDown");
    expect(state.decrementThumb).toHaveBeenCalledWith(0, state.pageSize);

    dispatchThumbKey(result.thumbProps, "Home");
    expect(state.getThumbMinValue).toHaveBeenCalledWith(0);
    expect(state.setThumbValue).toHaveBeenCalledWith(0, 10);

    dispatchThumbKey(result.thumbProps, "End");
    expect(state.getThumbMaxValue).toHaveBeenCalledWith(0);
    expect(state.setThumbValue).toHaveBeenCalledWith(0, 200);

    expect(state.setThumbDragging).toHaveBeenCalledWith(0, true);
    expect(state.setThumbDragging).toHaveBeenCalledWith(0, false);

    scope.stop();
  });

  it("disables thumb input interactions when thumb is disabled", () => {
    const track = document.createElement("div");
    vi.spyOn(track, "getBoundingClientRect").mockReturnValue({
      width: 100,
      height: 10,
      top: 0,
      left: 0,
      right: 100,
      bottom: 10,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    const state = createSliderThumbState();
    const inputRef = ref<HTMLInputElement | null>(document.createElement("input"));
    const scope = effectScope();
    const result = scope.run(() => {
      useSlider({ label: "Slider" }, state as any, { current: track });
      return useSliderThumb(
        {
          index: 0,
          isDisabled: true,
          trackRef: { current: track },
          inputRef,
        },
        state
      );
    })!;

    expect(result.isDisabled).toBe(true);
    expect(result.inputProps.disabled).toBe(true);
    expect(result.inputProps.tabIndex).toBeUndefined();
    expect(result.thumbProps.onMousedown).toBeUndefined();
    expect(result.thumbProps.onPointerdown).toBeUndefined();
    expect(state.setThumbEditable).toHaveBeenCalledWith(0, false);

    scope.stop();
  });

  it("supports touch thumb dragging interactions", () => {
    const track = document.createElement("div");
    vi.spyOn(track, "getBoundingClientRect").mockReturnValue({
      width: 100,
      height: 10,
      top: 0,
      left: 0,
      right: 100,
      bottom: 10,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    const state = createSliderThumbState([50]);
    const inputRef = ref<HTMLInputElement | null>(document.createElement("input"));
    const scope = effectScope();
    const result = scope.run(() => {
      useSlider({ label: "Slider" }, state as any, { current: track });
      return useSliderThumb(
        {
          index: 0,
          trackRef: { current: track },
          inputRef,
        },
        state
      );
    })!;

    dispatchThumbTouchStart(result.thumbProps, 10);
    expect(state.isThumbDragging(0)).toBe(true);

    dispatchThumbTouchMove(40);
    expect(state.values).toEqual([80]);

    dispatchThumbTouchEnd(40);
    expect(state.isThumbDragging(0)).toBe(false);

    scope.stop();
  });
});
