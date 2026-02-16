import { useFilter } from "@vue-aria/i18n";
import { useResizeObserver } from "@vue-aria/utils";
import { useComboBoxState } from "@vue-stately/combobox";
import { ClearButton } from "@vue-spectrum/button";
import { Popover } from "@vue-spectrum/menu";
import { useListBoxLayout, ListBoxBase } from "@vue-spectrum/listbox";
import { TextFieldBase } from "@vue-spectrum/textfield";
import { ProgressCircle } from "@vue-spectrum/progress";
import { useProviderProps } from "@vue-spectrum/provider";
import { dimensionValue, useSlotProps } from "@vue-spectrum/utils";
import { computed, defineComponent, h, onMounted, ref, type PropType, type VNode } from "vue";
import {
  createSearchAutocompleteCollection,
  getCollectionSignature,
  getSearchAutocompleteDisabledKeys,
} from "./collection";
import { useSearchAutocomplete } from "./useSearchAutocomplete";
import type {
  SearchAutocompleteAlign,
  SearchAutocompleteCollectionNode,
  SearchAutocompleteDirection,
  SearchAutocompleteKey,
  SearchAutocompleteLoadingState,
  SearchAutocompleteMenuTrigger,
  SpectrumSearchAutocompleteNodeData,
  SpectrumSearchAutocompleteProps,
} from "./types";

const PLACEHOLDER_DEPRECATION_WARNING =
  "Placeholders are deprecated due to accessibility issues. Please use help text instead.";

function isRenderableNode(node: unknown): node is VNode {
  return (
    typeof node === "object" &&
    node != null &&
    "type" in node &&
    typeof (node as VNode).type !== "symbol"
  );
}

export const SearchAutocomplete = defineComponent({
  name: "SpectrumSearchAutocomplete",
  inheritAttrs: false,
  props: {
    id: String,
    label: String,
    description: String,
    errorMessage: {
      type: [String, Function] as PropType<SpectrumSearchAutocompleteProps["errorMessage"]>,
      required: false,
      default: undefined,
    },
    items: {
      type: Object as PropType<Iterable<SpectrumSearchAutocompleteNodeData> | undefined>,
      required: false,
      default: undefined,
    },
    defaultItems: {
      type: Object as PropType<Iterable<SpectrumSearchAutocompleteNodeData> | undefined>,
      required: false,
      default: undefined,
    },
    disabledKeys: {
      type: Object as PropType<Iterable<SearchAutocompleteKey> | undefined>,
      required: false,
      default: undefined,
    },
    inputValue: String,
    defaultInputValue: String,
    onInputChange: {
      type: Function as PropType<SpectrumSearchAutocompleteProps["onInputChange"]>,
      required: false,
    },
    onSubmit: {
      type: Function as PropType<SpectrumSearchAutocompleteProps["onSubmit"]>,
      required: false,
    },
    onOpenChange: {
      type: Function as PropType<SpectrumSearchAutocompleteProps["onOpenChange"]>,
      required: false,
    },
    onSelectionChange: {
      type: Function as PropType<SpectrumSearchAutocompleteProps["onSelectionChange"]>,
      required: false,
    },
    onFocus: {
      type: Function as PropType<SpectrumSearchAutocompleteProps["onFocus"]>,
      required: false,
    },
    onBlur: {
      type: Function as PropType<SpectrumSearchAutocompleteProps["onBlur"]>,
      required: false,
    },
    onKeyDown: {
      type: Function as PropType<SpectrumSearchAutocompleteProps["onKeyDown"]>,
      required: false,
    },
    onKeyUp: {
      type: Function as PropType<SpectrumSearchAutocompleteProps["onKeyUp"]>,
      required: false,
    },
    onClear: {
      type: Function as PropType<SpectrumSearchAutocompleteProps["onClear"]>,
      required: false,
    },
    onLoadMore: {
      type: Function as PropType<SpectrumSearchAutocompleteProps["onLoadMore"]>,
      required: false,
    },
    defaultOpen: {
      type: Boolean as PropType<boolean | undefined>,
      required: false,
      default: undefined,
    },
    isOpen: {
      type: Boolean as PropType<boolean | undefined>,
      required: false,
      default: undefined,
    },
    menuTrigger: {
      type: String as PropType<SearchAutocompleteMenuTrigger | undefined>,
      required: false,
      default: undefined,
    },
    shouldCloseOnBlur: {
      type: Boolean as PropType<boolean | undefined>,
      required: false,
      default: undefined,
    },
    isDisabled: {
      type: Boolean as PropType<boolean | undefined>,
      required: false,
      default: undefined,
    },
    isReadOnly: {
      type: Boolean as PropType<boolean | undefined>,
      required: false,
      default: undefined,
    },
    isRequired: {
      type: Boolean as PropType<boolean | undefined>,
      required: false,
      default: undefined,
    },
    isInvalid: {
      type: Boolean as PropType<boolean | undefined>,
      required: false,
      default: undefined,
    },
    validationState: {
      type: String as PropType<SpectrumSearchAutocompleteProps["validationState"]>,
      required: false,
      default: undefined,
    },
    validationBehavior: {
      type: String as PropType<SpectrumSearchAutocompleteProps["validationBehavior"]>,
      required: false,
      default: undefined,
    },
    validate: {
      type: Function as PropType<SpectrumSearchAutocompleteProps["validate"]>,
      required: false,
    },
    allowsCustomValue: {
      type: Boolean as PropType<boolean | undefined>,
      required: false,
      default: true,
    },
    maxHeight: {
      type: Number as PropType<SpectrumSearchAutocompleteProps["maxHeight"]>,
      required: false,
      default: undefined,
    },
    loadingState: {
      type: String as PropType<SearchAutocompleteLoadingState | undefined>,
      required: false,
      default: undefined,
    },
    name: String,
    form: String,
    formValue: {
      type: String as PropType<SpectrumSearchAutocompleteProps["formValue"]>,
      required: false,
      default: undefined,
    },
    autoFocus: {
      type: Boolean as PropType<boolean | undefined>,
      required: false,
      default: undefined,
    },
    ariaLabel: String,
    ariaLabelledby: String,
    ariaDescribedby: String,
    excludeFromTabOrder: {
      type: Boolean as PropType<boolean | undefined>,
      required: false,
      default: undefined,
    },
    placeholder: String,
    icon: {
      type: null as unknown as PropType<unknown>,
      required: false,
      default: undefined,
    },
    isQuiet: {
      type: Boolean as PropType<boolean | undefined>,
      required: false,
      default: undefined,
    },
    direction: {
      type: String as PropType<SearchAutocompleteDirection | undefined>,
      required: false,
      default: "bottom",
    },
    align: {
      type: String as PropType<SearchAutocompleteAlign | undefined>,
      required: false,
      default: "start",
    },
    menuWidth: {
      type: undefined as unknown as PropType<SpectrumSearchAutocompleteProps["menuWidth"]>,
      required: false,
      default: undefined,
    },
    shouldFlip: {
      type: Boolean as PropType<boolean | undefined>,
      required: false,
      default: true,
    },
    UNSAFE_className: {
      type: String,
      required: false,
      default: undefined,
    },
    UNSAFE_style: {
      type: Object as PropType<Record<string, unknown> | undefined>,
      required: false,
      default: undefined,
    },
  },
  setup(props, { attrs, slots, expose }) {
    const mergedProvider = useProviderProps({
      ...props,
      ...attrs,
      "aria-label": props.ariaLabel,
      "aria-labelledby": props.ariaLabelledby,
      "aria-describedby": props.ariaDescribedby,
    } as Record<string, unknown>) as Record<string, unknown>;
    const merged = useSlotProps(mergedProvider as Record<string, unknown>) as SpectrumSearchAutocompleteProps &
      Record<string, unknown> & {
        onKeyDown?: SpectrumSearchAutocompleteProps["onKeyDown"];
      };

    const rootRef = ref<HTMLElement | null>(null);
    const inputRef = ref<HTMLInputElement | null>(null);
    const popoverRef = ref<HTMLElement | null>(null);
    const listBoxRef = ref<HTMLElement | null>(null);
    const menuWidth = ref(0);
    const { contains } = useFilter({ sensitivity: "base" });

    const itemCollectionNodes = computed(() => {
      const providedItems = merged.items ?? merged.defaultItems;
      return providedItems != null ? createSearchAutocompleteCollection(providedItems, []) : undefined;
    });
    const slotCollectionNodes = ref<SearchAutocompleteCollectionNode[]>(
      createSearchAutocompleteCollection(undefined, [])
    );
    const slotCollectionSignature = ref("");

    const syncSlotCollectionNodes = () => {
      if (merged.items != null || merged.defaultItems != null) {
        return;
      }

      const slotChildren = (slots.default?.() ?? []).filter(isRenderableNode);
      const nextCollection = createSearchAutocompleteCollection(undefined, slotChildren);
      const nextSignature = getCollectionSignature(nextCollection);
      if (nextSignature === slotCollectionSignature.value) {
        return;
      }

      slotCollectionSignature.value = nextSignature;
      slotCollectionNodes.value = nextCollection;
    };

    const resolvedDisabledKeys = computed(
      () =>
        new Set<SearchAutocompleteKey>([
          ...getSearchAutocompleteDisabledKeys(itemCollectionNodes.value ?? slotCollectionNodes.value),
          ...(merged.disabledKeys ?? []),
        ])
    );

    const isAsync = computed(() => merged.loadingState != null);
    const formValueMode = computed(() =>
      merged.allowsCustomValue ? "text" : (merged.formValue ?? "text")
    );
    const state = useComboBoxState({
      get items() {
        return itemCollectionNodes.value as any;
      },
      get defaultItems() {
        return merged.items == null && merged.defaultItems == null
          ? slotCollectionNodes.value as any
          : undefined;
      },
      get disabledKeys() {
        return resolvedDisabledKeys.value;
      },
      get inputValue() {
        return merged.inputValue;
      },
      get defaultInputValue() {
        return merged.defaultInputValue;
      },
      onInputChange: merged.onInputChange,
      onSelectionChange: (key) => {
        merged.onSelectionChange?.(key as SearchAutocompleteKey | null);
        if (key != null) {
          merged.onSubmit?.(null, key);
        }
      },
      get isOpen() {
        return merged.isOpen;
      },
      get defaultOpen() {
        return merged.defaultOpen;
      },
      onOpenChange: merged.onOpenChange,
      defaultFilter: contains,
      get menuTrigger() {
        return merged.menuTrigger ?? "input";
      },
      get allowsEmptyCollection() {
        return isAsync.value;
      },
      get allowsCustomValue() {
        return merged.allowsCustomValue;
      },
      get shouldCloseOnBlur() {
        return merged.shouldCloseOnBlur;
      },
      get isReadOnly() {
        return merged.isReadOnly;
      },
      get isDisabled() {
        return merged.isDisabled;
      },
      get isRequired() {
        return merged.isRequired;
      },
      get isInvalid() {
        return merged.isInvalid;
      },
      get validationState() {
        return merged.validationState;
      },
      get validationBehavior() {
        return merged.validationBehavior;
      },
      get name() {
        return formValueMode.value === "text" ? merged.name : undefined;
      },
      get validate() {
        return merged.validate
          ? (value: { inputValue: string }) => merged.validate?.(value.inputValue)
          : undefined;
      },
    } as any);

    const layout = useListBoxLayout();
    const searchAutocomplete = useSearchAutocomplete(
      {
        ...(merged as Record<string, unknown>),
        layoutDelegate: layout,
        menuTrigger: merged.menuTrigger ?? "input",
        name: formValueMode.value === "text" ? merged.name : undefined,
        form: formValueMode.value === "text" ? merged.form : undefined,
        popoverRef: {
          get current() {
            return popoverRef.value;
          },
          set current(value: HTMLElement | null) {
            popoverRef.value = value;
          },
        },
        listBoxRef: {
          get current() {
            return listBoxRef.value;
          },
          set current(value: HTMLElement | null) {
            listBoxRef.value = value;
          },
        },
        inputRef,
      } as unknown as any,
      state as any
    );

    const updateMenuWidth = () => {
      if (inputRef.value) {
        menuWidth.value = inputRef.value.offsetWidth;
      }
    };

    useResizeObserver({
      ref: inputRef,
      onResize: updateMenuWidth,
    });

    onMounted(() => {
      if (merged.autoFocus) {
        inputRef.value?.focus();
      }

      if (merged.placeholder && process.env.NODE_ENV !== "production") {
        console.warn(PLACEHOLDER_DEPRECATION_WARNING);
      }
    });

    const syncControlledInputValue = (event: Event) => {
      if (merged.inputValue === undefined) {
        return;
      }

      const target = event.target as HTMLInputElement | null;
      if (!target) {
        return;
      }

      if (target.value !== state.inputValue) {
        target.value = state.inputValue;
      }
    };

    const icon = computed(() => {
      if (merged.icon === "") {
        return null;
      }

      if (merged.icon !== undefined) {
        return merged.icon as any;
      }

      return h("span", {
        "data-testid": "searchicon",
        class: "spectrum-Search-icon",
        "aria-hidden": "true",
      });
    });

    const shouldShowInputLoadingIndicator = computed(() => {
      if (!merged.loadingState) {
        return false;
      }

      return (
        state.isOpen ||
        merged.menuTrigger === "manual" ||
        merged.loadingState === "loading"
      );
    });

    const loadingIndicator = h(ProgressCircle as any, {
      "aria-label": "Loading…",
      size: "S",
      isIndeterminate: true,
      UNSAFE_className:
        "spectrum-Textfield-circleLoader spectrum-InputGroup-input-circleLoader spectrum-Search-circleLoader",
    });

    const listBoxInput = computed(() => ({
      ...searchAutocomplete.inputProps,
      ref: inputRef,
      id: merged.id ?? (searchAutocomplete.inputProps.id as string | undefined),
      value: state.inputValue,
      name: formValueMode.value === "text" ? merged.name : undefined,
      form: formValueMode.value === "text" ? merged.form : undefined,
      tabIndex: merged.excludeFromTabOrder ? -1 : searchAutocomplete.inputProps.tabIndex,
      onChange: (event: Event) => {
        (searchAutocomplete.inputProps.onChange as ((event: Event) => void) | undefined)?.(event);
        syncControlledInputValue(event);
      },
    }));

    const searchLabel = computed(() =>
      [
        "spectrum-Search",
        "spectrum-Textfield",
        merged.isDisabled ? "is-disabled" : null,
        merged.isQuiet ? "is-quiet" : null,
        searchAutocomplete.isInvalid && !merged.isDisabled ? "spectrum-Search--invalid" : null,
        merged.validationState === "valid" && !merged.isDisabled ? "spectrum-Search--valid" : null,
        merged.UNSAFE_className,
      ]
        .filter(Boolean)
        .join(" ")
    );

    const listSize = computed(() =>
      Number((state.collection as { size?: number } | null)?.size ?? 0)
    );
    const showListBox = computed(() => state.isOpen && (listSize.value > 0 || merged.loadingState != null));
    const wrapperChildren = computed(() => {
      const children: unknown[] = [];
      if (shouldShowInputLoadingIndicator.value) {
        children.push(loadingIndicator);
      }

      if (state.inputValue !== "" && !merged.isReadOnly) {
        children.push(
          h(ClearButton as any, {
            ...(searchAutocomplete.clearButtonProps as Record<string, unknown>),
            UNSAFE_className: "spectrum-ClearButton",
            isDisabled: Boolean(
              merged.isDisabled || (searchAutocomplete.clearButtonProps.isDisabled as boolean | undefined)
            ),
          })
        );
      }

      return children;
    });

    const popoverStyle = computed(() => {
      const width =
        merged.menuWidth != null ? dimensionValue(merged.menuWidth as any) :
        merged.isQuiet ? undefined : menuWidth.value;
      const minWidth = merged.isQuiet
        ? `calc(${menuWidth.value}px + calc(2 * var(--spectrum-dropdown-quiet-offset)))`
        : width;

      return {
        width,
        minWidth,
      };
    });

    const popoverClassName = computed(() =>
      ["spectrum-InputGroup-popover", merged.isQuiet ? "spectrum-InputGroup-popover--quiet" : null]
        .filter(Boolean)
        .join(" ")
    );

    expose({
      focus: () => inputRef.value?.focus(),
      blur: () => inputRef.value?.blur(),
      getInputElement: () => inputRef.value,
      UNSAFE_getDOMNode: () => rootRef.value,
    });

    return () => {
      syncSlotCollectionNodes();
      return h("div", { ref: rootRef }, [
        h(
          TextFieldBase as any,
          {
            ...merged,
            label: merged.label,
            description: merged.description,
            errorMessage:
              typeof merged.errorMessage === "string"
                ? merged.errorMessage
                : searchAutocomplete.validationErrors.join(", "),
            isDisabled: Boolean(merged.isDisabled),
            isQuiet: merged.isQuiet,
            validationState:
              merged.validationState || (searchAutocomplete.isInvalid ? "invalid" : undefined),
            isInvalid: searchAutocomplete.isInvalid,
            validationErrors: searchAutocomplete.validationErrors,
            icon: icon.value,
            UNSAFE_className: searchLabel.value,
            UNSAFE_style: merged.UNSAFE_style,
            inputClassName: "spectrum-Search-input",
            inputProps: {
              ...listBoxInput.value,
            },
            labelProps: searchAutocomplete.labelProps,
            descriptionProps: searchAutocomplete.descriptionProps,
            errorMessageProps: searchAutocomplete.errorMessageProps,
            wrapperChildren: wrapperChildren.value,
          } as unknown
        ),
        showListBox.value
          ? h(
              Popover,
              {
                state,
                UNSAFE_style: popoverStyle.value,
                UNSAFE_className: popoverClassName.value,
                ref: popoverRef,
                triggerRef: {
                  current: inputRef.value,
                },
                placement: `${merged.direction ?? "bottom"} ${merged.align ?? "start"}`,
                hideArrow: true,
                isNonModal: true,
                shouldFlip: merged.shouldFlip ?? true,
              },
              {
                default: () =>
                  h(ListBoxBase as any, {
                    ...(searchAutocomplete.listBoxProps as Record<string, unknown>),
                    id: searchAutocomplete.listBoxProps.id,
                    ariaLabel: searchAutocomplete.listBoxProps["aria-label"],
                    ariaLabelledby: searchAutocomplete.listBoxProps["aria-labelledby"],
                    autoFocus: (state.focusStrategy ?? true) as boolean | "first" | "last" | undefined,
                    shouldUseVirtualFocus: searchAutocomplete.listBoxProps["shouldUseVirtualFocus"] as
                      | boolean
                      | undefined,
                    shouldSelectOnPressUp: searchAutocomplete.listBoxProps["shouldSelectOnPressUp"] as
                      | boolean
                      | undefined,
                    shouldFocusOnHover: true,
                    onBlur: searchAutocomplete.listBoxProps.onBlur as
                      | ((event: FocusEvent) => void)
                      | undefined,
                    onFocus: searchAutocomplete.listBoxProps.onFocus as
                      | ((event: FocusEvent) => void)
                      | undefined,
                    onFocusChange: searchAutocomplete.listBoxProps.onFocusChange as
                      | ((isFocused: boolean) => void)
                      | undefined,
                    onAction: searchAutocomplete.listBoxProps.onAction as
                      | ((key: SearchAutocompleteKey) => void)
                      | undefined,
                    maxHeight: merged.maxHeight,
                    onLoadMore: merged.onLoadMore,
                    isLoading:
                      merged.loadingState === "loading" || merged.loadingState === "loadingMore",
                    showLoadingSpinner: merged.loadingState === "loadingMore",
                    renderEmptyState:
                      merged.loadingState != null
                        ? () =>
                            merged.loadingState === "loading"
                              ? h("span", "Loading…")
                              : h("span", "No results")
                        : undefined,
                    disallowEmptySelection: true,
                    shouldFocusOnHover: true,
                    state,
                    ref: (value: unknown) => {
                      if (value instanceof HTMLElement || value === null) {
                        listBoxRef.value = value;
                      }
                    },
                    layout,
                  })
              }
            )
          : null,
        formValueMode.value === "key" && merged.name
          ? h("input", {
              type: "hidden",
              name: merged.name,
              form: merged.form,
              value: state.selectedKey == null ? "" : String(state.selectedKey),
            })
          : null,
      ]);
    };
  },
});

export type { SearchAutocompleteCollectionNode };
