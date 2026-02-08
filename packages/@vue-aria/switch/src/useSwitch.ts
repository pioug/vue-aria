import { computed } from "vue";
import { mergeProps } from "@vue-aria/utils";
import {
  useCheckbox,
  type UseCheckboxOptions,
  type UseCheckboxResult,
  type UseCheckboxState,
} from "@vue-aria/checkbox";
import type { MaybeReactive, ReadonlyRef } from "@vue-aria/types";

export interface UseSwitchOptions extends UseCheckboxOptions {}

export interface UseSwitchResult
  extends Omit<UseCheckboxResult, "inputProps" | "isInvalid"> {
  inputProps: ReadonlyRef<Record<string, unknown>>;
}

export function useSwitch(
  options: UseSwitchOptions = {},
  state: UseCheckboxState,
  inputRef?: MaybeReactive<HTMLInputElement | null | undefined>
): UseSwitchResult {
  const checkbox = useCheckbox(options, state, inputRef);

  const inputProps = computed<Record<string, unknown>>(() =>
    mergeProps(checkbox.inputProps.value, {
      role: "switch",
      checked: checkbox.isSelected.value,
    })
  );

  return {
    labelProps: checkbox.labelProps,
    inputProps,
    isSelected: checkbox.isSelected,
    isPressed: checkbox.isPressed,
    isDisabled: checkbox.isDisabled,
    isReadOnly: checkbox.isReadOnly,
  };
}
