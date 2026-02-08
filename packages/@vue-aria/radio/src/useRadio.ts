import { computed, toValue } from "vue";
import { usePress } from "@vue-aria/interactions";
import { mergeProps } from "@vue-aria/utils";
import { radioGroupData } from "./utils";
import type { MaybeReactive, PressEvent, ReadonlyRef } from "@vue-aria/types";
import type { UseRadioGroupState } from "./useRadioGroup";

export interface UseRadioOptions {
  value: MaybeReactive<string>;
  isDisabled?: MaybeReactive<boolean | undefined>;
  "aria-label"?: MaybeReactive<string | undefined>;
  "aria-labelledby"?: MaybeReactive<string | undefined>;
  "aria-describedby"?: MaybeReactive<string | undefined>;
  onPressStart?: (event: PressEvent) => void;
  onPressEnd?: (event: PressEvent) => void;
  onPress?: (event: PressEvent) => void;
  onChange?: (isSelected: boolean) => void;
}

export interface UseRadioResult {
  labelProps: ReadonlyRef<Record<string, unknown>>;
  inputProps: ReadonlyRef<Record<string, unknown>>;
  isDisabled: ReadonlyRef<boolean>;
  isSelected: ReadonlyRef<boolean>;
  isPressed: ReadonlyRef<boolean>;
}

function resolveBoolean(value: MaybeReactive<boolean | undefined> | undefined): boolean {
  if (value === undefined) {
    return false;
  }

  return Boolean(toValue(value));
}

function getValidationBehavior(state: UseRadioGroupState): "aria" | "native" {
  const data = radioGroupData.get(state as object);
  return data?.validationBehavior ?? "aria";
}

export function useRadio(
  options: UseRadioOptions,
  state: UseRadioGroupState,
  inputRef?: MaybeReactive<HTMLInputElement | null | undefined>
): UseRadioResult {
  const groupData = radioGroupData.get(state as object);
  const value = computed(() => toValue(options.value));

  const isDisabled = computed(
    () => resolveBoolean(options.isDisabled) || resolveBoolean(state.isDisabled)
  );
  const isReadOnly = computed(() => resolveBoolean(state.isReadOnly));
  const isSelected = computed(() => {
    const selected = toValue(state.selectedValue);
    return selected === value.value;
  });

  const { pressProps, isPressed: isInputPressed } = usePress({
    isDisabled,
    disableKeyboard: true,
    onPressStart: options.onPressStart,
    onPressEnd: options.onPressEnd,
    onPress: options.onPress,
  });

  const { pressProps: labelPressProps, isPressed: isLabelPressed } = usePress({
    isDisabled: computed(() => isDisabled.value || isReadOnly.value),
    disableKeyboard: true,
    onPressStart: options.onPressStart,
    onPressEnd: options.onPressEnd,
    onPress: (event) => {
      state.setSelectedValue(value.value);
      options.onChange?.(true);
      options.onPress?.(event);
      const element = inputRef === undefined ? undefined : toValue(inputRef);
      element?.focus();
    },
  });

  const tabIndex = computed<number | undefined>(() => {
    if (isDisabled.value) {
      return undefined;
    }

    const selected = toValue(state.selectedValue);
    if (selected !== null && selected !== undefined) {
      return selected === value.value ? 0 : -1;
    }

    const lastFocused =
      state.lastFocusedValue === undefined ? null : toValue(state.lastFocusedValue);
    return lastFocused === value.value || lastFocused === null || lastFocused === undefined
      ? 0
      : -1;
  });

  const onChange = (event: Event) => {
    event.stopPropagation();

    if (isDisabled.value || isReadOnly.value) {
      return;
    }

    state.setSelectedValue(value.value);
    options.onChange?.(true);
  };

  const labelProps = computed<Record<string, unknown>>(() =>
    mergeProps(labelPressProps, {
      onClick: (event: MouseEvent) => event.preventDefault(),
      onMousedown: (event: MouseEvent) => event.preventDefault(),
    })
  );

  const inputProps = computed<Record<string, unknown>>(() => {
    const describedBy =
      options["aria-describedby"] === undefined
        ? undefined
        : toValue(options["aria-describedby"]);
    const isInvalid =
      resolveBoolean(state.isInvalid) || toValue(state.validationState) === "invalid";
    const ariaDescribedBy = [describedBy, isInvalid ? groupData?.errorMessageId : undefined, groupData?.descriptionId]
      .filter(Boolean)
      .join(" ");

    return mergeProps(pressProps, {
      type: "radio",
      name: groupData?.name,
      form: groupData?.form,
      tabIndex: tabIndex.value,
      disabled: isDisabled.value,
      required:
        resolveBoolean(state.isRequired) && getValidationBehavior(state) === "native"
          ? true
          : undefined,
      checked: isSelected.value,
      value: value.value,
      "aria-label":
        options["aria-label"] === undefined
          ? undefined
          : toValue(options["aria-label"]),
      "aria-labelledby":
        options["aria-labelledby"] === undefined
          ? undefined
          : toValue(options["aria-labelledby"]),
      "aria-describedby": ariaDescribedBy || undefined,
      onFocus: () => state.setLastFocusedValue?.(value.value),
      onChange,
    });
  });

  const isPressed = computed(() => isInputPressed.value || isLabelPressed.value);

  return {
    labelProps,
    inputProps,
    isDisabled,
    isSelected,
    isPressed,
  };
}
