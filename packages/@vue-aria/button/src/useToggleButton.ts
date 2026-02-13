import { chain, mergeProps } from "@vue-aria/utils";
import { useButton, type AriaButtonOptions, type ButtonAria } from "./useButton";

export interface ToggleState {
  isSelected: boolean;
  toggle: () => void;
}

export interface AriaToggleButtonOptions extends AriaButtonOptions {}

export interface ToggleButtonAria<T = Record<string, unknown>> extends ButtonAria<T> {
  isSelected: boolean;
  isDisabled: boolean;
}

export function useToggleButton(
  props: AriaToggleButtonOptions,
  state: ToggleState,
  ref: { current: Element | null } = { current: null }
): ToggleButtonAria<Record<string, unknown>> {
  const { isSelected } = state;
  const { isPressed, buttonProps } = useButton(
    {
      ...props,
      onPress: chain(state.toggle, props.onPress),
    },
    ref
  );

  return {
    isPressed,
    isSelected,
    isDisabled: props.isDisabled || false,
    buttonProps: mergeProps(buttonProps, {
      "aria-pressed": isSelected,
    }),
  };
}
