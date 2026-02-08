import { computed, toValue } from "vue";
import { mergeProps } from "@vue-aria/utils";
import { useButton, type UseButtonOptions } from "./useButton";
import type { MaybeReactive, PressEvent, ReadonlyRef } from "@vue-aria/types";

export interface UseToggleButtonState {
  isSelected: MaybeReactive<boolean>;
  toggle: () => void;
}

export interface UseToggleButtonOptions extends UseButtonOptions {}

export interface UseToggleButtonResult {
  buttonProps: ReadonlyRef<Record<string, unknown>>;
  isPressed: ReadonlyRef<boolean>;
  isSelected: ReadonlyRef<boolean>;
  isDisabled: ReadonlyRef<boolean>;
  isFocused: ReadonlyRef<boolean>;
  isFocusVisible: ReadonlyRef<boolean>;
}

export function useToggleButton(
  options: UseToggleButtonOptions = {},
  state: UseToggleButtonState
): UseToggleButtonResult {
  const isSelected = computed(() => Boolean(toValue(state.isSelected)));
  const isDisabled = computed(() => {
    if (options.isDisabled === undefined) {
      return false;
    }
    return Boolean(toValue(options.isDisabled));
  });

  const { buttonProps: baseButtonProps, isPressed, isFocused, isFocusVisible } = useButton({
    ...options,
    onPress: (event: PressEvent) => {
      state.toggle();
      options.onPress?.(event);
    },
  });

  const buttonProps = computed<Record<string, unknown>>(() =>
    mergeProps(baseButtonProps.value, {
      "aria-pressed": isSelected.value,
    })
  );

  return {
    buttonProps,
    isPressed,
    isSelected,
    isDisabled,
    isFocused,
    isFocusVisible,
  };
}
