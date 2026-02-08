import { describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { useToggleState } from "../src";

describe("useToggleState", () => {
  it("toggles uncontrolled selection state", () => {
    const state = useToggleState();

    expect(state.isSelected.value).toBe(false);
    expect(state.defaultSelected.value).toBe(false);

    state.toggle();
    expect(state.isSelected.value).toBe(true);

    state.setSelected(false);
    expect(state.isSelected.value).toBe(false);
  });

  it("supports default selected state", () => {
    const state = useToggleState({
      defaultSelected: true,
    });

    expect(state.isSelected.value).toBe(true);
    expect(state.defaultSelected.value).toBe(true);

    state.toggle();

    expect(state.isSelected.value).toBe(false);
    expect(state.defaultSelected.value).toBe(true);
  });

  it("supports controlled state with onChange", () => {
    const isSelected = ref(false);
    const onChange = vi.fn((nextValue: boolean) => {
      isSelected.value = nextValue;
    });

    const state = useToggleState({
      isSelected,
      onChange,
    });

    state.setSelected(true);

    expect(onChange).toHaveBeenCalledWith(true);
    expect(state.isSelected.value).toBe(true);

    state.setSelected(true);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("does not update state when read-only", () => {
    const onChange = vi.fn();
    const state = useToggleState({
      defaultSelected: true,
      isReadOnly: true,
      onChange,
    });

    state.setSelected(false);
    state.toggle();

    expect(state.isSelected.value).toBe(true);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("captures initial controlled value as defaultSelected when absent", () => {
    const isSelected = ref(true);
    const state = useToggleState({
      isSelected,
    });

    expect(state.defaultSelected.value).toBe(true);

    isSelected.value = false;

    expect(state.isSelected.value).toBe(false);
    expect(state.defaultSelected.value).toBe(true);
  });
});
