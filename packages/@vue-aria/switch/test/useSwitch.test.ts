import { describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { useSwitch } from "../src/useSwitch";
import type { UseCheckboxState } from "@vue-aria/checkbox";

interface SwitchInputHandlers {
  onChange?: (event: Event) => void;
}

interface SwitchLabelHandlers {
  onPointerdown?: (event: PointerEvent) => void;
  onPointerup?: (event: PointerEvent) => void;
}

function createToggleState(initial = false): UseCheckboxState {
  const isSelected = ref(initial);
  return {
    isSelected,
    setSelected: (nextSelected) => {
      isSelected.value = nextSelected;
    },
    toggle: () => {
      isSelected.value = !isSelected.value;
    },
  };
}

function createPointerEvent(type: string): PointerEvent {
  return new PointerEvent(type, {
    bubbles: true,
    cancelable: true,
    button: 0,
    pointerType: "mouse",
  });
}

describe("useSwitch", () => {
  it("sets role=switch and maps selected state to checked", () => {
    const state = createToggleState(true);
    const { inputProps, isSelected } = useSwitch({}, state);

    expect(inputProps.value.role).toBe("switch");
    expect(inputProps.value.checked).toBe(true);
    expect(isSelected.value).toBe(true);
  });

  it("handles input changes and label press", () => {
    const state = createToggleState(false);
    const onChange = vi.fn();
    const { inputProps, labelProps } = useSwitch({ onChange }, state);

    const inputHandlers = inputProps.value as SwitchInputHandlers;
    inputHandlers.onChange?.({
      stopPropagation: vi.fn(),
      target: { checked: true },
    } as unknown as Event);
    expect(inputProps.value.checked).toBe(true);
    expect(onChange).toHaveBeenCalledWith(true);

    const labelHandlers = labelProps.value as SwitchLabelHandlers;
    labelHandlers.onPointerdown?.(createPointerEvent("pointerdown"));
    labelHandlers.onPointerup?.(createPointerEvent("pointerup"));
    expect(inputProps.value.checked).toBe(false);
  });

  it("does not toggle when disabled", () => {
    const state = createToggleState(false);
    const { inputProps, labelProps, isDisabled } = useSwitch(
      {
        isDisabled: true,
      },
      state
    );

    const inputHandlers = inputProps.value as SwitchInputHandlers;
    inputHandlers.onChange?.({
      stopPropagation: vi.fn(),
      target: { checked: true },
    } as unknown as Event);
    expect(inputProps.value.checked).toBe(false);

    const labelHandlers = labelProps.value as SwitchLabelHandlers;
    labelHandlers.onPointerdown?.(createPointerEvent("pointerdown"));
    labelHandlers.onPointerup?.(createPointerEvent("pointerup"));

    expect(isDisabled.value).toBe(true);
    expect(inputProps.value.checked).toBe(false);
  });
});
