import { computed, ref, toValue } from "vue";
import { useLocalizedStringFormatter } from "@vue-aria/i18n";
import { useTextField, type UseTextFieldOptions } from "@vue-aria/textfield";
import type { MaybeReactive, ReadonlyRef } from "@vue-aria/types";

export interface UseSearchFieldOptions
  extends Omit<UseTextFieldOptions, "type" | "onChange"> {
  type?: MaybeReactive<"search" | "text" | undefined>;
  value?: MaybeReactive<string | undefined>;
  defaultValue?: MaybeReactive<string | undefined>;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  onClear?: () => void;
  inputRef?: MaybeReactive<HTMLInputElement | null | undefined>;
}

export interface UseSearchFieldResult {
  labelProps: ReadonlyRef<Record<string, unknown>>;
  inputProps: ReadonlyRef<Record<string, unknown>>;
  descriptionProps: ReadonlyRef<Record<string, unknown>>;
  errorMessageProps: ReadonlyRef<Record<string, unknown>>;
  clearButtonProps: ReadonlyRef<Record<string, unknown>>;
  isInvalid: ReadonlyRef<boolean>;
}

const messages = {
  "en-US": {
    "Clear search": "Clear search",
  },
  "fr-FR": {
    "Clear search": "Effacer la recherche",
  },
} as const;

export function useSearchField(
  options: UseSearchFieldOptions = {}
): UseSearchFieldResult {
  const strings = useLocalizedStringFormatter(messages, "@vue-aria/searchfield");
  const uncontrolledValue = ref(
    options.defaultValue === undefined
      ? ""
      : (toValue(options.defaultValue) ?? "")
  );

  const value = computed<string>(() => {
    if (options.value !== undefined) {
      return toValue(options.value) ?? "";
    }
    return uncontrolledValue.value;
  });

  const setValue = (nextValue: string) => {
    if (options.value === undefined) {
      uncontrolledValue.value = nextValue;
    }
    options.onChange?.(nextValue);
  };

  const isDisabled = () =>
    options.isDisabled === undefined ? false : Boolean(toValue(options.isDisabled));
  const isReadOnly = () =>
    options.isReadOnly === undefined ? false : Boolean(toValue(options.isReadOnly));

  const onKeydown = (event: KeyboardEvent) => {
    const key = event.key;

    if (key === "Enter" && (isDisabled() || isReadOnly())) {
      event.preventDefault();
    }

    if (!isDisabled() && !isReadOnly()) {
      if (key === "Enter" && options.onSubmit) {
        event.preventDefault();
        options.onSubmit(value.value);
      }

      if (key === "Escape") {
        const target = event.target as HTMLInputElement | null;
        const liveValue = target?.value ?? "";
        if (value.value !== "" || liveValue !== "") {
          event.preventDefault();
          setValue("");
          options.onClear?.();
        }
      }
    }

    options.onKeydown?.(event);
  };

  const {
    labelProps,
    inputProps: baseInputProps,
    descriptionProps,
    errorMessageProps,
    isInvalid,
  } = useTextField({
    ...options,
    type: options.type === undefined ? "search" : toValue(options.type),
    value,
    onChange: setValue,
    onKeydown,
  });

  const clearButtonProps = computed<Record<string, unknown>>(() => ({
    "aria-label": strings.value.format("Clear search"),
    excludeFromTabOrder: true,
    preventFocusOnPress: true,
    isDisabled: isDisabled() || isReadOnly(),
    onPress: () => {
      setValue("");
      options.onClear?.();
    },
    onPressStart: () => {
      const target = options.inputRef === undefined ? undefined : toValue(options.inputRef);
      target?.focus();
    },
  }));

  const inputProps = computed<Record<string, unknown>>(() => ({
    ...baseInputProps.value,
    defaultValue: undefined,
  }));

  return {
    labelProps,
    inputProps,
    descriptionProps,
    errorMessageProps,
    clearButtonProps,
    isInvalid,
  };
}
