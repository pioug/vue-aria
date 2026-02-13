import { effectScope, nextTick, reactive } from "vue";
import { describe, expect, it, vi } from "vitest";
import { useSliderState } from "../src/useSliderState";

function setupSliderState(
  props: Parameters<typeof useSliderState<number | number[]>>[0]
) {
  const scope = effectScope();
  const state = scope.run(() => useSliderState(props as any))!;
  return { state, stop: () => scope.stop() };
}

describe("useSliderState", () => {
  const numberFormatter = new Intl.NumberFormat("en-US", {});

  it("allows setting and reading values, percentages, and labels", () => {
    const currencyFormatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    });
    const { state, stop } = setupSliderState({
      defaultValue: [50],
      minValue: 10,
      maxValue: 200,
      step: 10,
      numberFormatter: currencyFormatter,
    });

    expect(state.getThumbValue(0)).toBe(50);
    expect(state.getThumbPercent(0)).toBe(40 / 190);
    expect(state.getValuePercent(50)).toBe(40 / 190);
    expect(state.getThumbValueLabel(0)).toBe("$50.00");

    state.setThumbValue(0, 100);
    expect(state.getThumbValue(0)).toBe(100);
    expect(state.getThumbPercent(0)).toBe(90 / 190);
    expect(state.getThumbValueLabel(0)).toBe("$100.00");

    state.setThumbValue(0, 500);
    expect(state.getThumbValue(0)).toBe(200);
    expect(state.getThumbPercent(0)).toBe(1);
    expect(state.getThumbValueLabel(0)).toBe("$200.00");

    state.setThumbValue(0, 0);
    expect(state.getThumbValue(0)).toBe(10);
    expect(state.getThumbPercent(0)).toBe(0);
    expect(state.getThumbValueLabel(0)).toBe("$10.00");

    state.setThumbValue(0, 7);
    expect(state.getThumbValue(0)).toBe(10);
    expect(state.getThumbPercent(0)).toBe(0);
    expect(state.getThumbValueLabel(0)).toBe("$10.00");

    state.setThumbPercent(0, 0.13);
    expect(state.getThumbValue(0)).toBe(30);
    expect(state.getThumbPercent(0)).toBe(20 / 190);

    stop();
  });

  it("enforces min and max bounds for multiple thumbs", () => {
    const { state, stop } = setupSliderState({
      defaultValue: [50, 70, 90],
      minValue: 10,
      maxValue: 200,
      numberFormatter,
    });

    expect(state.values).toEqual([50, 70, 90]);
    expect(state.getThumbMinValue(0)).toBe(10);
    expect(state.getThumbMaxValue(0)).toBe(70);
    expect(state.getThumbMinValue(1)).toBe(50);
    expect(state.getThumbMaxValue(1)).toBe(90);
    expect(state.getThumbMinValue(2)).toBe(70);
    expect(state.getThumbMaxValue(2)).toBe(200);

    state.setThumbValue(1, 80);
    expect(state.values).toEqual([50, 80, 90]);
    expect(state.getThumbMinValue(2)).toBe(80);

    state.setThumbValue(1, 100);
    expect(state.values).toEqual([50, 90, 90]);
    expect(state.getThumbMinValue(2)).toBe(90);

    stop();
  });

  it("rounds values to nearest step with two thumbs", () => {
    const { state, stop } = setupSliderState({
      minValue: 1,
      maxValue: 15,
      step: 2.5,
      defaultValue: [1, 13],
      numberFormatter,
    });

    expect(state.values).toEqual([1, 13.5]);
    expect(state.getThumbMinValue(1)).toBe(1);

    state.setThumbValue(0, 3);
    expect(state.values).toEqual([3.5, 13.5]);
    expect(state.getThumbMinValue(1)).toBe(3.5);
    expect(state.getThumbMaxValue(0)).toBe(13.5);

    state.setThumbValue(1, 5);
    expect(state.values).toEqual([3.5, 6]);
    expect(state.getThumbMaxValue(0)).toBe(6);

    stop();
  });

  it("rounds values to nearest step with three thumbs", () => {
    const { state, stop } = setupSliderState({
      minValue: 1,
      maxValue: 15,
      step: 2.5,
      defaultValue: [1, 6, 13],
      numberFormatter,
    });

    expect(state.values).toEqual([1, 6, 13.5]);
    expect(state.getThumbMinValue(1)).toBe(1);
    expect(state.getThumbMinValue(2)).toBe(6);

    state.setThumbValue(0, 3);
    expect(state.values).toEqual([3.5, 6, 13.5]);
    expect(state.getThumbMinValue(2)).toBe(6);
    expect(state.getThumbMinValue(1)).toBe(3.5);
    expect(state.getThumbMaxValue(0)).toBe(6);
    expect(state.getThumbMaxValue(1)).toBe(13.5);

    state.setThumbValue(2, 5);
    expect(state.values).toEqual([3.5, 6, 6]);
    expect(state.getThumbMaxValue(0)).toBe(6);
    expect(state.getThumbMaxValue(1)).toBe(6);

    stop();
  });

  it("calls onChange and onChangeEnd at drag boundaries", () => {
    const onChangeEnd = vi.fn();
    const onChange = vi.fn();
    const { state, stop } = setupSliderState({
      onChangeEnd,
      onChange,
      numberFormatter,
    });

    expect(state.values).toEqual([0]);
    state.setThumbDragging(0, true);
    state.setThumbValue(0, 50);
    state.setThumbDragging(0, false);

    expect(onChange).toHaveBeenLastCalledWith([50]);
    expect(onChangeEnd).toHaveBeenLastCalledWith([50]);

    onChangeEnd.mockClear();

    state.setThumbDragging(0, true);
    expect(state.isThumbDragging(0)).toBe(true);
    state.setThumbValue(0, 55);
    expect(onChange).toHaveBeenLastCalledWith([55]);
    expect(onChangeEnd).not.toHaveBeenCalled();
    state.setThumbValue(0, 60);
    expect(onChange).toHaveBeenLastCalledWith([60]);
    expect(onChangeEnd).not.toHaveBeenCalled();
    state.setThumbValue(0, 65);
    state.setThumbDragging(0, false);
    expect(onChange).toHaveBeenLastCalledWith([65]);
    expect(onChangeEnd).toHaveBeenLastCalledWith([65]);

    stop();
  });

  it("does not call onChange or onChangeEnd when value does not change", () => {
    const onChangeEnd = vi.fn();
    const onChange = vi.fn();
    const { state, stop } = setupSliderState({
      onChangeEnd,
      onChange,
      numberFormatter,
    });

    expect(state.values).toEqual([0]);
    state.setThumbValue(0, 0);
    expect(onChange).not.toHaveBeenCalled();
    expect(onChangeEnd).not.toHaveBeenCalled();

    stop();
  });

  it("converts single-value callbacks to numbers", () => {
    const onChangeEnd = vi.fn();
    const onChange = vi.fn();
    const { state, stop } = setupSliderState({
      defaultValue: 25,
      onChangeEnd,
      onChange,
      numberFormatter,
    });

    state.setThumbDragging(0, true);
    state.setThumbValue(0, 30);
    state.setThumbDragging(0, false);

    expect(onChange).toHaveBeenLastCalledWith(30);
    expect(onChangeEnd).toHaveBeenLastCalledWith(30);

    stop();
  });

  it("does not update disabled or non-editable thumbs", () => {
    const disabled = setupSliderState({
      defaultValue: [20],
      isDisabled: true,
      numberFormatter,
    });
    disabled.state.setThumbValue(0, 40);
    expect(disabled.state.values).toEqual([20]);
    disabled.stop();

    const nonEditable = setupSliderState({
      defaultValue: [20],
      numberFormatter,
    });
    nonEditable.state.setThumbEditable(0, false);
    nonEditable.state.setThumbValue(0, 40);
    expect(nonEditable.state.values).toEqual([20]);

    nonEditable.state.setThumbEditable(0, true);
    nonEditable.state.setThumbValue(0, 40);
    expect(nonEditable.state.values).toEqual([40]);
    nonEditable.stop();
  });

  it("reflects controlled array value updates from reactive props", async () => {
    const onChange = vi.fn();
    const controlledProps = reactive({
      value: [10, 40],
      onChange,
      numberFormatter,
    });

    const { state, stop } = setupSliderState(controlledProps as any);
    expect(state.values).toEqual([10, 40]);

    state.setThumbValue(0, 20);
    expect(onChange).toHaveBeenLastCalledWith([20, 40]);
    expect(state.values).toEqual([10, 40]);

    controlledProps.value = [20, 40];
    await nextTick();
    expect(state.values).toEqual([20, 40]);

    controlledProps.value = [30, 60];
    await nextTick();
    expect(state.values).toEqual([30, 60]);

    stop();
  });

  it("uses numeric callback shape for controlled single value", async () => {
    const onChange = vi.fn();
    const controlledProps = reactive({
      value: 25,
      onChange,
      numberFormatter,
    });

    const { state, stop } = setupSliderState(controlledProps as any);
    expect(state.values).toEqual([25]);

    state.incrementThumb(0);
    expect(onChange).toHaveBeenLastCalledWith(26);
    expect(state.values).toEqual([25]);

    controlledProps.value = 26;
    await nextTick();
    expect(state.values).toEqual([26]);

    stop();
  });

  it("supports controlled-to-uncontrolled transition", async () => {
    const onChange = vi.fn();
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const controlledProps = reactive<{
      value: number[] | undefined;
      defaultValue?: number[];
      onChange: (value: number[]) => void;
      numberFormatter: Intl.NumberFormat;
    }>({
      value: [10],
      onChange,
      numberFormatter,
    });

    const { state, stop } = setupSliderState(controlledProps as any);
    expect(state.values).toEqual([10]);

    controlledProps.value = [20];
    await nextTick();
    expect(state.values).toEqual([20]);

    controlledProps.value = undefined;
    await nextTick();
    expect(warnSpy).toHaveBeenCalled();
    expect(state.values).toEqual([20]);

    state.setThumbValue(0, 30);
    expect(onChange).toHaveBeenLastCalledWith([30]);
    expect(state.values).toEqual([30]);

    warnSpy.mockRestore();
    stop();
  });

  it("supports uncontrolled-to-controlled transition", async () => {
    const onChange = vi.fn();
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const props = reactive<{
      value: number[] | undefined;
      defaultValue: number[];
      onChange: (value: number[]) => void;
      numberFormatter: Intl.NumberFormat;
    }>({
      value: undefined,
      defaultValue: [5],
      onChange,
      numberFormatter,
    });

    const { state, stop } = setupSliderState(props as any);
    expect(state.values).toEqual([5]);

    state.setThumbValue(0, 12);
    expect(onChange).toHaveBeenLastCalledWith([12]);
    expect(state.values).toEqual([12]);

    props.value = [40];
    await nextTick();
    expect(warnSpy).toHaveBeenCalled();
    expect(state.values).toEqual([40]);

    state.setThumbValue(0, 50);
    expect(onChange).toHaveBeenLastCalledWith([50]);
    expect(state.values).toEqual([40]);

    props.value = [50];
    await nextTick();
    expect(state.values).toEqual([50]);

    warnSpy.mockRestore();
    stop();
  });

  it("keeps dragging/editable/focus bookkeeping aligned with dynamic thumb count", async () => {
    const props = reactive({
      value: [10, 40],
      numberFormatter,
    });

    const { state, stop } = setupSliderState(props as any);
    expect(state.values).toEqual([10, 40]);

    state.setThumbEditable(1, false);
    expect(state.isThumbEditable(1)).toBe(false);
    state.setThumbDragging(0, true);
    expect(state.isThumbDragging(0)).toBe(true);

    props.value = [10, 40, 70];
    await nextTick();
    expect(state.values).toEqual([10, 40, 70]);
    expect(state.isThumbDragging(0)).toBe(true);
    expect(state.isThumbDragging(2)).toBe(false);
    expect(state.isThumbEditable(1)).toBe(false);
    expect(state.isThumbEditable(2)).toBe(true);

    state.setFocusedThumb(2);
    expect(state.focusedThumb).toBe(2);
    state.setThumbDragging(0, false);
    expect(state.isThumbDragging(0)).toBe(false);

    props.value = [10];
    await nextTick();
    expect(state.values).toEqual([10]);
    expect(state.isThumbDragging(0)).toBe(false);
    expect(state.isThumbEditable(0)).toBe(true);
    expect(state.focusedThumb).toBeUndefined();

    stop();
  });
});
