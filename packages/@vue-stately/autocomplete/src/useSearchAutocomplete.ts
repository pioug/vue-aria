import { mergeProps } from "@vue-aria/utils";
import { useSearchField, type AriaSearchFieldProps } from "@vue-aria/searchfield";
import { useComboBox, type AriaComboBoxOptions, type ComboBoxAria } from "@vue-aria/combobox";
import type { ComboBoxState } from "@vue-stately/combobox";

export interface AriaSearchAutocompleteOptions<T> extends AriaSearchFieldProps {
  inputRef: { current: HTMLInputElement | null };
  popoverRef: { current: HTMLDivElement | null };
  listBoxRef: { current: HTMLElement | null };
  keyboardDelegate?: AriaComboBoxOptions<T>["keyboardDelegate"];
  layoutDelegate?: AriaComboBoxOptions<T>["layoutDelegate"];
  onSubmit?: (value: string, selectedKey: unknown) => void;
  onClear?: () => void;
  onKeyDown?: (event: KeyboardEvent) => void;
  onKeyUp?: (event: KeyboardEvent) => void;
  isInvalid?: boolean;
  validationState?: "valid" | "invalid";
  validationBehavior?: "aria" | "native";
  isRequired?: boolean;
  [key: string]: unknown;
}

export interface SearchAutocompleteAria {
  labelProps: Record<string, unknown>;
  inputProps: Record<string, unknown>;
  listBoxProps: Record<string, unknown>;
  clearButtonProps: Record<string, unknown>;
  descriptionProps: Record<string, unknown>;
  errorMessageProps: Record<string, unknown>;
  isInvalid: boolean;
  validationErrors: string[];
  validationDetails?: ValidityState | null;
}

export function useSearchAutocomplete<T>(
  props: AriaSearchAutocompleteOptions<T>,
  state: ComboBoxState<T>
): SearchAutocompleteAria {
  const {
    popoverRef,
    inputRef,
    listBoxRef,
    keyboardDelegate,
    layoutDelegate,
    onSubmit = () => {},
    onClear,
    onKeyDown,
    onKeyUp,
    isInvalid,
    validationState,
    validationBehavior,
    isRequired,
    ...otherProps
  } = props as Omit<
    AriaSearchAutocompleteOptions<T>,
    | "popoverRef"
    | "inputRef"
    | "listBoxRef"
    | "keyboardDelegate"
    | "layoutDelegate"
    | "onSubmit"
    | "onClear"
    | "onKeyDown"
    | "onKeyUp"
    | "isInvalid"
    | "validationState"
    | "validationBehavior"
    | "isRequired"
  >;

  const searchField = useSearchField(
    {
      ...otherProps,
      value: state.inputValue,
      onChange: state.setInputValue,
      onClear: () => {
        state.setInputValue("");
        onClear?.();
      },
      onSubmit: (value) => {
        if (state.selectionManager.focusedKey == null) {
          onSubmit(value, null);
        } else {
          onSubmit(value, state.selectionManager.focusedKey);
        }
      },
      onKeyDown,
      onKeyUp,
    },
    {
      value: state.inputValue,
      setValue: state.setInputValue,
    },
    inputRef
  );

  const {
    listBoxProps,
    labelProps,
    inputProps: comboInputProps,
    ...comboAria
  } = useComboBox(
    {
      ...(otherProps as AriaComboBoxOptions<T>),
      inputRef,
      popoverRef,
      listBoxRef,
      keyboardDelegate,
      layoutDelegate,
      onFocus: undefined,
      onFocusChange: undefined,
      onBlur: undefined,
      onKeyDown: undefined,
      onKeyUp: undefined,
      isInvalid,
      validationState,
      validationBehavior,
      isRequired,
      validate: undefined,
    } as AriaComboBoxOptions<T>,
    state
  ) as ComboBoxAria<T>;

  return {
    ...comboAria,
    labelProps,
    inputProps: mergeProps(searchField.inputProps, comboInputProps),
    listBoxProps,
    clearButtonProps: searchField.clearButtonProps,
    descriptionProps: searchField.descriptionProps,
    errorMessageProps: searchField.errorMessageProps,
    isInvalid: searchField.isInvalid,
    validationErrors: searchField.validationErrors,
    validationDetails: searchField.validationDetails,
  };
}
