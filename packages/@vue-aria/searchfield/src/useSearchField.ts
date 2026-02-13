import type { SearchFieldState } from "@vue-aria/searchfield-state";
import { chain } from "@vue-aria/utils";
import { useLocalizedStringFormatter } from "@vue-aria/i18n";
import { useTextField } from "@vue-aria/textfield";

const intlMessages = {
  "en-US": {
    "Clear search": "Clear search",
  },
};

export interface AriaSearchFieldProps {
  isDisabled?: boolean;
  isReadOnly?: boolean;
  onSubmit?: (value: string) => void;
  onClear?: () => void;
  onKeydown?: (event: KeyboardEvent) => void;
  type?: string;
  "aria-label"?: string;
  [key: string]: unknown;
}

export interface SearchFieldAria {
  labelProps: Record<string, unknown>;
  inputProps: Record<string, unknown>;
  clearButtonProps: Record<string, unknown>;
  descriptionProps: Record<string, unknown>;
  errorMessageProps: Record<string, unknown>;
  isInvalid: boolean;
  validationErrors: string[];
  validationDetails?: ValidityState | null;
}

export function useSearchField(
  props: AriaSearchFieldProps,
  state: SearchFieldState,
  inputRef: { current: HTMLInputElement | null }
): SearchFieldAria {
  const stringFormatter = useLocalizedStringFormatter(intlMessages as any, "@react-aria/searchfield");
  const { isDisabled, isReadOnly, onSubmit, onClear, type = "search" } = props;

  const onKeydown = (event: KeyboardEvent & { continuePropagation?: () => void }) => {
    const key = event.key;

    if (key === "Enter" && (isDisabled || isReadOnly)) {
      event.preventDefault();
    }

    if (isDisabled || isReadOnly) {
      return;
    }

    if (key === "Enter" && onSubmit) {
      event.preventDefault();
      onSubmit(state.value);
    }

    if (key === "Escape") {
      if (state.value === "" && (!inputRef.current || inputRef.current.value === "")) {
        event.continuePropagation?.();
      } else {
        event.preventDefault();
        state.setValue("");
        onClear?.();
      }
    }
  };

  const onClearButtonClick = () => {
    state.setValue("");
    onClear?.();
  };

  const onPressStart = () => {
    inputRef.current?.focus();
  };

  const {
    labelProps,
    inputProps,
    descriptionProps,
    errorMessageProps,
    ...validation
  } = useTextField(
    {
      ...props,
      value: state.value,
      onChange: state.setValue,
      onKeydown: !isReadOnly ? chain(onKeydown, props.onKeydown as any) : props.onKeydown,
      onKeyDown: !isReadOnly ? chain(onKeydown, props.onKeydown as any) : props.onKeydown,
      type,
    },
    inputRef
  );

  return {
    labelProps,
    inputProps: {
      ...inputProps,
      defaultValue: undefined,
    },
    clearButtonProps: {
      "aria-label": stringFormatter.format("Clear search"),
      excludeFromTabOrder: true,
      preventFocusOnPress: true,
      isDisabled: isDisabled || isReadOnly,
      onPress: onClearButtonClick,
      onPressStart,
    },
    descriptionProps,
    errorMessageProps,
    ...validation,
  };
}
