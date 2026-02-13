import { useToggle, type AriaToggleProps, type ToggleAria, type ToggleState } from "@vue-aria/toggle";

export interface SwitchAria extends Omit<ToggleAria, "isInvalid"> {
  labelProps: Record<string, unknown>;
  inputProps: Record<string, unknown>;
}

export function useSwitch(
  props: AriaToggleProps,
  state: ToggleState,
  ref: { current: HTMLInputElement | null }
): SwitchAria {
  const { labelProps, inputProps, isSelected, isPressed, isDisabled, isReadOnly } = useToggle(
    props,
    state,
    ref
  );

  return {
    labelProps,
    inputProps: {
      ...inputProps,
      role: "switch",
      checked: isSelected,
    },
    isSelected,
    isPressed,
    isDisabled,
    isReadOnly,
  };
}
