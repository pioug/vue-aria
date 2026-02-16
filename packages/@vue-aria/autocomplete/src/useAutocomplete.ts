import { mergeProps, useId } from "@vue-aria/utils";
import { useComboBox, type AriaComboBoxOptions, type ComboBoxAria } from "@vue-aria/combobox";
import type { ComboBoxState } from "@vue-aria/combobox-state";
import type { Node } from "@vue-aria/collections";

export interface InputProps {
  value?: string;
  onChange?: (value: string) => void;
  [key: string]: unknown;
}

export interface CollectionOptions {
  shouldUseVirtualFocus?: boolean;
  disallowTypeAhead?: boolean;
  [key: string]: unknown;
}

export interface AriaAutocompleteProps<T> {
  filter?: (textValue: string, inputValue: string, node: Node<T>) => boolean;
  disableAutoFocusFirst?: boolean;
  disableVirtualFocus?: boolean;
  [key: string]: unknown;
}

export interface AriaAutocompleteOptions<T> extends AriaComboBoxOptions<T>, AriaAutocompleteProps<T> {
  inputRef: { current: HTMLInputElement | null };
  collectionRef: { current: HTMLElement | null };
}

export interface AutocompleteAria<T> {
  inputProps: InputProps;
  collectionProps: CollectionOptions;
  collectionRef: { current: HTMLElement | null };
  filter?: (nodeTextValue: string, node: Node<T>) => boolean;
}

export function useAutocomplete<T>(
  props: AriaAutocompleteOptions<T>,
  state: ComboBoxState<T>
): AutocompleteAria<T> {
  const {
    inputRef,
    collectionRef,
    filter,
    disableAutoFocusFirst: _disableAutoFocusFirst = false,
    disableVirtualFocus = false,
    ...comboboxProps
  } = props as Omit<
    AriaAutocompleteOptions<T>,
    "inputRef" | "collectionRef" | "filter" | "disableAutoFocusFirst" | "disableVirtualFocus"
  >;

  const shouldUseVirtualFocus = !disableVirtualFocus;

  const { inputProps, listBoxProps, ..._comboAria } =
    useComboBox(
      {
        ...(comboboxProps as AriaComboBoxOptions<T>),
        inputRef,
        popoverRef: collectionRef,
        listBoxRef: collectionRef,
      } as AriaComboBoxOptions<T>,
      state
    ) as ComboBoxAria<T>;

  const collectionId = useId();

  return {
    inputProps: mergeProps(inputProps, {
      "aria-controls": shouldUseVirtualFocus ? collectionId : undefined,
      "aria-autocomplete": shouldUseVirtualFocus ? "list" : undefined,
    }) as InputProps,
    collectionProps: {
      shouldUseVirtualFocus,
      disallowTypeAhead: shouldUseVirtualFocus,
      id: collectionId,
      role: "listbox",
      ...listBoxProps,
    },
    collectionRef,
    filter: filter
      ? (nodeTextValue: string, node: Node<T>) => filter(nodeTextValue, state.inputValue, node)
      : undefined,
  };
}
