import { ref } from "vue";
import { describe, expect, it, vi } from "vitest";
import { useSliderState } from "../src/useSliderState";

describe("useSliderState", () => {
  it("initializes with default values and computes percent", () => {
    const state = useSliderState({
      defaultValue: [25],
      minValue: 0,
      maxValue: 100,
    });

    expect(state.values.value).toEqual([25]);
    expect(state.defaultValues.value).toEqual([25]);
    expect(state.getThumbPercent(0)).toBe(0.25);
  });

  it("clamps thumb values and preserves thumb ordering", () => {
    const state = useSliderState({
      defaultValue: [20, 80],
      minValue: 0,
      maxValue: 100,
      step: 1,
    });

    state.setThumbValue(0, 90);
    expect(state.values.value).toEqual([80, 80]);

    state.setThumbValue(1, 10);
    expect(state.values.value).toEqual([80, 80]);

    state.setThumbValue(0, -10);
    expect(state.values.value).toEqual([0, 80]);
  });

  it("updates values from percent and increment/decrement helpers", () => {
    const state = useSliderState({
      defaultValue: [50],
      minValue: 0,
      maxValue: 100,
      step: 5,
    });

    state.setThumbPercent(0, 0.2);
    expect(state.values.value).toEqual([20]);

    state.incrementThumb(0);
    expect(state.values.value).toEqual([25]);

    state.decrementThumb(0, 10);
    expect(state.values.value).toEqual([15]);
  });

  it("supports controlled values", () => {
    const controlled = ref([20]);
    const onChange = vi.fn();
    const state = useSliderState({
      value: controlled,
      minValue: 0,
      maxValue: 100,
      onChange,
    });

    state.setThumbValue(0, 40);
    expect(onChange).toHaveBeenCalledWith([40]);
    expect(state.values.value).toEqual([20]);

    controlled.value = [40];
    expect(state.values.value).toEqual([40]);
  });

  it("emits changeEnd when dragging transitions from true to false", () => {
    const onChangeEnd = vi.fn();
    const state = useSliderState({
      defaultValue: [10],
      onChangeEnd,
    });

    state.setThumbDragging(0, true);
    state.setThumbValue(0, 20);
    state.setThumbDragging(0, false);

    expect(onChangeEnd).toHaveBeenCalledWith([20]);
  });

  it("tracks focused and editable thumbs", () => {
    const state = useSliderState({
      defaultValue: [10, 90],
      isDisabled: false,
    });

    expect(state.isThumbEditable(0)).toBe(true);
    state.setThumbEditable?.(0, false);
    expect(state.isThumbEditable(0)).toBe(false);

    state.setFocusedThumb(1);
    expect(state.focusedThumb.value).toBe(1);
    state.setFocusedThumb(undefined);
    expect(state.focusedThumb.value).toBeUndefined();
  });
});
