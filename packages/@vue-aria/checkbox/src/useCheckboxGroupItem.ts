import { computed, toValue } from "vue";
import { checkboxGroupData } from "./utils";
import {
  useCheckbox,
  type UseCheckboxOptions,
  type UseCheckboxResult,
  type UseCheckboxState,
} from "./useCheckbox";
import type { MaybeReactive, ReadonlyRef } from "@vue-aria/types";
import type { UseCheckboxGroupState } from "./useCheckboxGroup";

type ValidationBehavior = "aria" | "native";

export interface UseCheckboxGroupItemOptions
  extends Omit<
    UseCheckboxOptions,
    "value" | "name" | "form" | "isDisabled" | "isReadOnly" | "isRequired"
  > {
  value: MaybeReactive<string>;
  name?: MaybeReactive<string | undefined>;
  form?: MaybeReactive<string | undefined>;
  isDisabled?: MaybeReactive<boolean | undefined>;
  isReadOnly?: MaybeReactive<boolean | undefined>;
  isRequired?: MaybeReactive<boolean | undefined>;
  validationBehavior?: MaybeReactive<ValidationBehavior | undefined>;
}

export interface UseCheckboxGroupItemResult extends UseCheckboxResult {
  inputProps: ReadonlyRef<Record<string, unknown>>;
}

function resolveBoolean(value: MaybeReactive<boolean | undefined> | undefined): boolean {
  if (value === undefined) {
    return false;
  }

  return Boolean(toValue(value));
}

export function useCheckboxGroupItem(
  options: UseCheckboxGroupItemOptions,
  state: UseCheckboxGroupState,
  inputRef?: MaybeReactive<HTMLInputElement | null | undefined>
): UseCheckboxGroupItemResult {
  const groupData = checkboxGroupData.get(state as object);
  const itemValue = computed(() => toValue(options.value));

  const toggleState: UseCheckboxState = {
    isSelected: computed(() => state.isSelected(itemValue.value)),
    setSelected: (isSelected) => {
      if (isSelected) {
        state.addValue(itemValue.value);
      } else {
        state.removeValue(itemValue.value);
      }
    },
    toggle: () => {
      state.toggleValue(itemValue.value);
      options.onChange?.(state.isSelected(itemValue.value));
    },
  };

  const isGroupInvalid = computed(
    () => resolveBoolean(state.isInvalid) || toValue(state.validationState) === "invalid"
  );

  const checkbox = useCheckbox(
    {
      ...options,
      value: itemValue,
      name:
        options.name === undefined
          ? groupData?.name
          : computed(() => toValue(options.name)),
      form:
        options.form === undefined
          ? groupData?.form
          : computed(() => toValue(options.form)),
      isDisabled: computed(
        () => resolveBoolean(options.isDisabled) || resolveBoolean(state.isDisabled)
      ),
      isReadOnly: computed(
        () => resolveBoolean(options.isReadOnly) || resolveBoolean(state.isReadOnly)
      ),
      isRequired:
        options.isRequired === undefined ? state.isRequired : options.isRequired,
      validationBehavior:
        options.validationBehavior ??
        (groupData?.validationBehavior as ValidationBehavior | undefined),
      onChange: options.onChange,
    },
    toggleState,
    inputRef
  );

  const inputProps = computed<Record<string, unknown>>(() => {
    const describedBy =
      options["aria-describedby"] === undefined
        ? undefined
        : toValue(options["aria-describedby"]);

    const ariaDescribedBy = [
      describedBy,
      isGroupInvalid.value ? groupData?.errorMessageId : undefined,
      groupData?.descriptionId,
    ]
      .filter(Boolean)
      .join(" ");

    return {
      ...checkbox.inputProps.value,
      "aria-describedby": ariaDescribedBy || undefined,
    };
  });

  return {
    ...checkbox,
    inputProps,
  };
}
