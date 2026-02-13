import { effectScope, ref } from "vue";
import { describe, expect, it, vi } from "vitest";
import { useSlider } from "../src/useSlider";
import { useSliderThumb, type SliderThumbState } from "../src/useSliderThumb";

function createSliderThumbState() {
  const dragging = new Set<number>();
  const state: SliderThumbState = {
    values: [50],
    defaultValues: [50],
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
    getThumbMinValue: vi.fn(() => 10),
    getThumbMaxValue: vi.fn(() => 200),
    getThumbValueLabel: vi.fn(() => "50"),
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
});
