import type { CompletionMode, FilterFn, MenuTrigger, MenuTriggerAction } from "@vue-aria/combobox-state";
import type { Key } from "@vue-aria/types";
import type { PropType, VNode } from "vue";

export interface SpectrumSearchAutocompleteItemData {
  key: Key;
  label: string;
  textValue?: string | undefined;
  isDisabled?: boolean | undefined;
  "aria-label"?: string | undefined;
}

export interface SpectrumSearchAutocompleteItemProps {
  id?: Key | undefined;
  textValue?: string | undefined;
  isDisabled?: boolean | undefined;
  "aria-label"?: string | undefined;
}

export interface SpectrumSearchAutocompleteSectionProps {
  id?: Key | undefined;
  title?: string | undefined;
  "aria-label"?: string | undefined;
}

export type SpectrumSearchAutocompleteLoadingState =
  | "idle"
  | "loading"
  | "loadingMore"
  | "filtering";

export interface SpectrumSearchAutocompleteErrorMessageContext {
  isInvalid: boolean;
  validationErrors: string[];
  validationDetails: unknown;
}

export interface SpectrumSearchAutocompleteProps {
  id?: string | undefined;
  name?: string | undefined;
  form?: string | undefined;
  label?: string | undefined;
  description?: string | undefined;
  errorMessage?:
    | string
    | ((
        context: SpectrumSearchAutocompleteErrorMessageContext
      ) => string | null | undefined)
    | undefined;
  items?: SpectrumSearchAutocompleteItemData[] | undefined;
  defaultItems?: SpectrumSearchAutocompleteItemData[] | undefined;
  disabledKeys?: Iterable<Key> | undefined;
  selectedKey?: Key | null | undefined;
  defaultSelectedKey?: Key | null | undefined;
  onSelectionChange?: ((key: Key | null) => void) | undefined;
  inputValue?: string | undefined;
  defaultInputValue?: string | undefined;
  onInputChange?: ((value: string) => void) | undefined;
  isOpen?: boolean | undefined;
  defaultOpen?: boolean | undefined;
  onOpenChange?: ((isOpen: boolean, trigger?: MenuTriggerAction) => void) | undefined;
  defaultFilter?: FilterFn | undefined;
  completionMode?: CompletionMode | undefined;
  menuTrigger?: MenuTrigger | undefined;
  allowsEmptyCollection?: boolean | undefined;
  allowsCustomValue?: boolean | undefined;
  shouldCloseOnBlur?: boolean | undefined;
  isDisabled?: boolean | undefined;
  isReadOnly?: boolean | undefined;
  isRequired?: boolean | undefined;
  isInvalid?: boolean | undefined;
  validationState?: "valid" | "invalid" | undefined;
  validationBehavior?: "aria" | "native" | undefined;
  validate?:
    | ((value: string) => string | string[] | boolean | null | undefined)
    | undefined;
  loadingState?: SpectrumSearchAutocompleteLoadingState | undefined;
  onLoadMore?: (() => void) | undefined;
  ariaLabel?: string | undefined;
  ariaLabelledby?: string | undefined;
  ariaDescribedby?: string | undefined;
  "aria-label"?: string | undefined;
  "aria-labelledby"?: string | undefined;
  "aria-describedby"?: string | undefined;
  placeholder?: string | undefined;
  autoFocus?: boolean | undefined;
  onFocus?: ((event: FocusEvent) => void) | undefined;
  onBlur?: ((event: FocusEvent) => void) | undefined;
  onKeydown?: ((event: KeyboardEvent) => void) | undefined;
  onSubmit?: ((value: string, key: Key | null) => void) | undefined;
  onClear?: (() => void) | undefined;
  icon?: VNode | "" | null | undefined;
  slot?: string | undefined;
  isHidden?: boolean | undefined;
  UNSAFE_className?: string | undefined;
  UNSAFE_style?: Record<string, string | number> | undefined;
}

export const searchAutocompletePropOptions = {
  id: {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  name: {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  form: {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  label: {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  description: {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  errorMessage: {
    type: [String, Function] as PropType<
      | string
      | ((
          context: SpectrumSearchAutocompleteErrorMessageContext
        ) => string | null | undefined)
      | undefined
    >,
    default: undefined,
  },
  items: {
    type: Array as PropType<SpectrumSearchAutocompleteItemData[] | undefined>,
    default: undefined,
  },
  defaultItems: {
    type: Array as PropType<SpectrumSearchAutocompleteItemData[] | undefined>,
    default: undefined,
  },
  disabledKeys: {
    type: null as unknown as PropType<Iterable<Key> | undefined>,
    default: undefined,
  },
  selectedKey: {
    type: [String, Number] as PropType<Key | null | undefined>,
    default: undefined,
  },
  defaultSelectedKey: {
    type: [String, Number] as PropType<Key | null | undefined>,
    default: undefined,
  },
  onSelectionChange: {
    type: Function as PropType<((key: Key | null) => void) | undefined>,
    default: undefined,
  },
  inputValue: {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  defaultInputValue: {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  onInputChange: {
    type: Function as PropType<((value: string) => void) | undefined>,
    default: undefined,
  },
  isOpen: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined,
  },
  defaultOpen: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined,
  },
  onOpenChange: {
    type: Function as PropType<
      ((isOpen: boolean, trigger?: MenuTriggerAction) => void) | undefined
    >,
    default: undefined,
  },
  defaultFilter: {
    type: Function as PropType<FilterFn | undefined>,
    default: undefined,
  },
  completionMode: {
    type: String as PropType<CompletionMode | undefined>,
    default: undefined,
  },
  menuTrigger: {
    type: String as PropType<MenuTrigger | undefined>,
    default: undefined,
  },
  allowsEmptyCollection: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined,
  },
  allowsCustomValue: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined,
  },
  shouldCloseOnBlur: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined,
  },
  isDisabled: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined,
  },
  isReadOnly: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined,
  },
  isRequired: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined,
  },
  isInvalid: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined,
  },
  validationState: {
    type: String as PropType<"valid" | "invalid" | undefined>,
    default: undefined,
  },
  validationBehavior: {
    type: String as PropType<"aria" | "native" | undefined>,
    default: undefined,
  },
  validate: {
    type: Function as PropType<
      ((value: string) => string | string[] | boolean | null | undefined) | undefined
    >,
    default: undefined,
  },
  loadingState: {
    type: String as PropType<SpectrumSearchAutocompleteLoadingState | undefined>,
    default: undefined,
  },
  onLoadMore: {
    type: Function as PropType<(() => void) | undefined>,
    default: undefined,
  },
  ariaLabel: {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  ariaLabelledby: {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  ariaDescribedby: {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  "aria-label": {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  "aria-labelledby": {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  "aria-describedby": {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  placeholder: {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  autoFocus: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined,
  },
  onFocus: {
    type: Function as PropType<((event: FocusEvent) => void) | undefined>,
    default: undefined,
  },
  onBlur: {
    type: Function as PropType<((event: FocusEvent) => void) | undefined>,
    default: undefined,
  },
  onKeydown: {
    type: Function as PropType<((event: KeyboardEvent) => void) | undefined>,
    default: undefined,
  },
  onSubmit: {
    type: Function as PropType<((value: string, key: Key | null) => void) | undefined>,
    default: undefined,
  },
  onClear: {
    type: Function as PropType<(() => void) | undefined>,
    default: undefined,
  },
  icon: {
    type: null as unknown as PropType<VNode | "" | null | undefined>,
    default: undefined,
  },
  slot: {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  isHidden: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined,
  },
  UNSAFE_className: {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  UNSAFE_style: {
    type: Object as PropType<Record<string, string | number> | undefined>,
    default: undefined,
  },
} as const;
