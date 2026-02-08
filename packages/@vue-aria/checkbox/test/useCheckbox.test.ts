import { describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { useCheckbox, type UseCheckboxState } from "../src/useCheckbox";

interface CheckboxInputHandlers {
  onChange?: (event: Event) => void;
}

interface CheckboxLabelHandlers {
  onPointerdown?: (event: PointerEvent) => void;
  onPointerup?: (event: PointerEvent) => void;
  onClick?: (event: MouseEvent) => void;
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

describe("useCheckbox", () => {
  it("handles input change and label press", () => {
    const state = createToggleState(false);
    const onChange = vi.fn();
    const onPress = vi.fn();
    const { inputProps, labelProps, isSelected } = useCheckbox(
      {
        value: "dogs",
        name: "pets",
        onChange,
        onPress,
      },
      state
    );

    expect(inputProps.value.type).toBe("checkbox");
    expect(inputProps.value.checked).toBe(false);
    expect(inputProps.value.value).toBe("dogs");
    expect(inputProps.value.name).toBe("pets");
    expect(isSelected.value).toBe(false);

    const handlers = inputProps.value as CheckboxInputHandlers;
    const stopPropagation = vi.fn();
    handlers.onChange?.({
      stopPropagation,
      target: { checked: true },
    } as unknown as Event);

    expect(stopPropagation).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(true);
    expect(isSelected.value).toBe(true);
    expect(inputProps.value.checked).toBe(true);

    const labelHandlers = labelProps.value as CheckboxLabelHandlers;
    labelHandlers.onPointerdown?.(createPointerEvent("pointerdown"));
    labelHandlers.onPointerup?.(createPointerEvent("pointerup"));

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(isSelected.value).toBe(false);
  });

  it("supports aria vs native required semantics", () => {
    const ariaState = createToggleState(false);
    const { inputProps: ariaInputProps } = useCheckbox(
      {
        isRequired: true,
        validationBehavior: "aria",
      },
      ariaState
    );
    expect(ariaInputProps.value["aria-required"]).toBe(true);
    expect(ariaInputProps.value.required).toBeUndefined();

    const nativeState = createToggleState(false);
    const { inputProps: nativeInputProps } = useCheckbox(
      {
        isRequired: true,
        validationBehavior: "native",
      },
      nativeState
    );
    expect(nativeInputProps.value["aria-required"]).toBeUndefined();
    expect(nativeInputProps.value.required).toBe(true);
  });

  it("prevents changes when disabled or readonly", () => {
    const disabledState = createToggleState(false);
    const disabled = useCheckbox(
      {
        isDisabled: true,
      },
      disabledState
    );
    const disabledHandlers = disabled.inputProps.value as CheckboxInputHandlers;
    disabledHandlers.onChange?.({
      stopPropagation: vi.fn(),
      target: { checked: true },
    } as unknown as Event);
    expect(disabled.inputProps.value.disabled).toBe(true);
    expect(disabled.isSelected.value).toBe(false);

    const readOnlyState = createToggleState(false);
    const readOnly = useCheckbox(
      {
        isReadOnly: true,
      },
      readOnlyState
    );
    const readOnlyHandlers = readOnly.inputProps.value as CheckboxInputHandlers;
    readOnlyHandlers.onChange?.({
      stopPropagation: vi.fn(),
      target: { checked: true },
    } as unknown as Event);
    expect(readOnly.inputProps.value["aria-readonly"]).toBe(true);
    expect(readOnly.isSelected.value).toBe(false);
  });

  it("focuses the input ref on label press", () => {
    const state = createToggleState(false);
    const focus = vi.fn();
    const inputRef = { focus } as unknown as HTMLInputElement;
    const { labelProps } = useCheckbox({}, state, inputRef);
    const labelHandlers = labelProps.value as CheckboxLabelHandlers;

    labelHandlers.onPointerdown?.(createPointerEvent("pointerdown"));
    labelHandlers.onPointerup?.(createPointerEvent("pointerup"));

    expect(focus).toHaveBeenCalledTimes(1);
  });

  it("forwards indeterminate and invalid state props", () => {
    const state = createToggleState(false);
    const { inputProps, isInvalid } = useCheckbox(
      {
        isIndeterminate: true,
        validationState: "invalid",
      },
      state
    );

    expect(inputProps.value.indeterminate).toBe(true);
    expect(inputProps.value["aria-invalid"]).toBe(true);
    expect(isInvalid.value).toBe(true);
  });
});
