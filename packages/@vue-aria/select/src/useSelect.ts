import { computed, toValue } from "vue";
import { useId } from "@vue-aria/ssr";
import { useField } from "@vue-aria/label";
import { filterDOMProps, mergeProps } from "@vue-aria/utils";
import type { Key, MaybeReactive, ReadonlyRef } from "@vue-aria/types";
import type { ListBoxItem } from "@vue-aria/listbox";
import type { FocusStrategy, UseSelectStateResult } from "./useSelectState";

export interface HiddenSelectProps<T extends ListBoxItem = ListBoxItem> {
  isDisabled: boolean;
  name?: string;
  form?: string;
  state: UseSelectStateResult<T>;
}

export interface UseSelectOptions {
  id?: MaybeReactive<string | undefined>;
  label?: MaybeReactive<string | undefined>;
  description?: MaybeReactive<string | undefined>;
  errorMessage?: MaybeReactive<string | undefined>;
  isDisabled?: MaybeReactive<boolean | undefined>;
  isRequired?: MaybeReactive<boolean | undefined>;
  isInvalid?: MaybeReactive<boolean | undefined>;
  validationState?: MaybeReactive<"valid" | "invalid" | undefined>;
  name?: MaybeReactive<string | undefined>;
  form?: MaybeReactive<string | undefined>;
  "aria-label"?: MaybeReactive<string | undefined>;
  "aria-labelledby"?: MaybeReactive<string | undefined>;
  "aria-describedby"?: MaybeReactive<string | undefined>;
  onFocus?: (event: FocusEvent) => void;
  onBlur?: (event: FocusEvent) => void;
  onFocusChange?: (isFocused: boolean) => void;
  onKeydown?: (event: KeyboardEvent) => void;
  onKeyup?: (event: KeyboardEvent) => void;
  [key: string]: unknown;
}

export interface UseSelectResult<T extends ListBoxItem = ListBoxItem> {
  labelProps: ReadonlyRef<Record<string, unknown>>;
  triggerProps: ReadonlyRef<Record<string, unknown>>;
  valueProps: ReadonlyRef<Record<string, unknown>>;
  menuProps: ReadonlyRef<Record<string, unknown>>;
  descriptionProps: ReadonlyRef<Record<string, unknown>>;
  errorMessageProps: ReadonlyRef<Record<string, unknown>>;
  isInvalid: ReadonlyRef<boolean>;
  hiddenSelectProps: ReadonlyRef<HiddenSelectProps<T>>;
}

function resolveBoolean(value: MaybeReactive<boolean | undefined> | undefined): boolean {
  if (value === undefined) {
    return false;
  }

  return Boolean(toValue(value));
}

function nextKey<T extends ListBoxItem>(
  state: UseSelectStateResult<T>,
  direction: "next" | "prev"
): Key | null {
  const current = state.selectedKey.value;
  const fallback = state.getFirstKey();
  if (current === null) {
    return fallback;
  }

  const key =
    direction === "next"
      ? state.getKeyAfter(current) ?? fallback
      : state.getKeyBefore(current) ?? state.getLastKey();

  return key;
}

export function useSelect<T extends ListBoxItem>(
  options: UseSelectOptions,
  state: UseSelectStateResult<T>,
  triggerRef: MaybeReactive<HTMLElement | null | undefined>
): UseSelectResult<T> {
  const isDisabled = computed(() => resolveBoolean(options.isDisabled));
  const valueId = useId(undefined, "v-aria-select-value");
  const domProps = filterDOMProps(options, { labelable: true });

  const { labelProps, fieldProps, descriptionProps, errorMessageProps } = useField({
    id: options.id,
    label: options.label,
    labelElementType: "span",
    description: options.description,
    errorMessage: options.errorMessage,
    isInvalid: options.isInvalid,
    validationState: options.validationState,
    "aria-label": options["aria-label"],
    "aria-labelledby": options["aria-labelledby"],
    "aria-describedby": options["aria-describedby"],
  });
  const isInvalid = computed(() => {
    if (resolveBoolean(options.isInvalid)) {
      return true;
    }

    if (options.validationState === undefined) {
      return false;
    }

    return toValue(options.validationState) === "invalid";
  });

  const focusTrigger = () => {
    const element = toValue(triggerRef);
    element?.focus();
  };

  const onKeydown = (event: KeyboardEvent) => {
    options.onKeydown?.(event);
    if (isDisabled.value) {
      return;
    }

    switch (event.key) {
      case "ArrowDown": {
        event.preventDefault();
        const key = nextKey(state, "next");
        if (key !== null) {
          state.setSelectedKey(key);
        }
        return;
      }
      case "ArrowUp": {
        event.preventDefault();
        const key = nextKey(state, "prev");
        if (key !== null) {
          state.setSelectedKey(key);
        }
        return;
      }
      case "Enter":
      case " ": {
        event.preventDefault();
        state.toggle("first");
        return;
      }
      case "Escape":
        state.close();
        return;
      default:
        return;
    }
  };

  const triggerProps = computed<Record<string, unknown>>(() =>
    mergeProps(domProps, fieldProps.value, {
      role: "button",
      "aria-haspopup": "listbox",
      "aria-expanded": state.isOpen.value,
      isDisabled: isDisabled.value || undefined,
      "aria-required": resolveBoolean(options.isRequired) || undefined,
      "aria-labelledby": [valueId.value, fieldProps.value["aria-labelledby"]]
        .filter(Boolean)
        .join(" "),
      onClick: () => {
        if (isDisabled.value) {
          return;
        }

        state.toggle("first");
        focusTrigger();
      },
      onKeydown,
      onKeyup: options.onKeyup,
      onFocus: (event: FocusEvent) => {
        if (state.isFocused.value) {
          return;
        }

        options.onFocus?.(event);
        options.onFocusChange?.(true);
        state.setFocused(true);
      },
      onBlur: (event: FocusEvent) => {
        if (state.isOpen.value) {
          return;
        }

        options.onBlur?.(event);
        options.onFocusChange?.(false);
        state.setFocused(false);
      },
    })
  );

  const menuProps = computed<Record<string, unknown>>(() => ({
    autoFocus: (state.focusStrategy.value ?? true) as FocusStrategy | true,
    shouldSelectOnPressUp: true,
    shouldFocusOnHover: true,
    disallowEmptySelection: true,
    selectionBehavior: "replace",
    "aria-labelledby": fieldProps.value["aria-labelledby"],
    onBlur: (event: FocusEvent) => {
      options.onBlur?.(event);
      options.onFocusChange?.(false);
      state.setFocused(false);
    },
  }));

  const hiddenSelectProps = computed<HiddenSelectProps<T>>(() => ({
    isDisabled: isDisabled.value,
    name: options.name === undefined ? undefined : toValue(options.name),
    form: options.form === undefined ? undefined : toValue(options.form),
    state,
  }));

  return {
    labelProps,
    triggerProps,
    valueProps: computed<Record<string, unknown>>(() => ({
      id: valueId.value,
    })),
    menuProps,
    descriptionProps,
    errorMessageProps,
    isInvalid,
    hiddenSelectProps,
  };
}
