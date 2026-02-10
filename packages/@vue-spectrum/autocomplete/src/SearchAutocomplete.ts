import {
  computed,
  defineComponent,
  h,
  ref,
  type PropType,
} from "vue";
import { useComboBox } from "@vue-aria/combobox";
import {
  useComboBoxState,
  type FilterFn,
  type FocusStrategy,
  type MenuTriggerAction,
} from "@vue-aria/combobox-state";
import { useOption } from "@vue-aria/listbox";
import { filterDOMProps, mergeProps } from "@vue-aria/utils";
import type { Key } from "@vue-aria/types";
import { ClearButton } from "@vue-spectrum/button";
import { ProgressCircle } from "@vue-spectrum/progress";
import {
  classNames,
  useStyleProps,
  type ClassValue,
} from "@vue-spectrum/utils";
import {
  searchAutocompletePropOptions,
  type SpectrumSearchAutocompleteItemData,
} from "./types";

interface NormalizedSearchAutocompleteItem {
  key: Key;
  textValue?: string | undefined;
  label: string;
  isDisabled?: boolean | undefined;
  "aria-label"?: string | undefined;
}

const DEFAULT_FILTER: FilterFn = (textValue, inputValue) =>
  textValue.toLowerCase().includes(inputValue.toLowerCase());

const SearchAutocompleteOption = defineComponent({
  name: "SearchAutocompleteOption",
  props: {
    item: {
      type: Object as PropType<NormalizedSearchAutocompleteItem>,
      required: true,
    },
    state: {
      type: Object as PropType<
        ReturnType<typeof useComboBoxState<NormalizedSearchAutocompleteItem>>
      >,
      required: true,
    },
  },
  setup(props) {
    const optionRef = ref<HTMLElement | null>(null);

    const option = useOption(
      {
        key: props.item.key,
        isDisabled: props.item.isDisabled,
        "aria-label": props.item["aria-label"],
        shouldFocusOnHover: true,
        shouldSelectOnPressUp: true,
      },
      props.state,
      optionRef
    );

    const toVueOptionProps = (
      optionProps: Record<string, unknown>
    ): Record<string, unknown> => {
      const mapped = { ...optionProps };
      if ("onMouseDown" in mapped) {
        mapped.onMousedown = mapped.onMouseDown;
        delete mapped.onMouseDown;
      }
      if ("onMouseUp" in mapped) {
        mapped.onMouseup = mapped.onMouseUp;
        delete mapped.onMouseUp;
      }
      if ("onMouseEnter" in mapped) {
        mapped.onMouseenter = mapped.onMouseEnter;
        delete mapped.onMouseEnter;
      }
      if ("onMouseLeave" in mapped) {
        mapped.onMouseleave = mapped.onMouseLeave;
        delete mapped.onMouseLeave;
      }
      return mapped;
    };

    return () => {
      const optionProps = toVueOptionProps(
        option.optionProps.value as Record<string, unknown>
      );

      return h(
        "div",
        mergeProps(optionProps, {
          ref: (value: unknown) => {
            optionRef.value = value as HTMLElement | null;
          },
          class: classNames("spectrum-Menu-item", {
            "is-focused": option.isFocused.value,
            "is-selected": option.isSelected.value,
            "is-disabled": option.isDisabled.value,
          }),
        }),
        [
          h(
            "span",
            mergeProps(option.labelProps.value, {
              class: classNames("spectrum-Menu-itemLabel"),
            }),
            props.item.label
          ),
        ]
      );
    };
  },
});

export const SearchAutocomplete = defineComponent({
  name: "SearchAutocomplete",
  inheritAttrs: false,
  props: {
    ...searchAutocompletePropOptions,
  },
  setup(props, { attrs, expose }) {
    const rootRef = ref<HTMLElement | null>(null);
    const inputRef = ref<HTMLInputElement | null>(null);
    const popoverRef = ref<HTMLElement | null>(null);
    const listBoxRef = ref<HTMLElement | null>(null);
    const loadMoreRequested = ref(false);

    const normalizedItems = computed<NormalizedSearchAutocompleteItem[]>(() =>
      (props.items ?? props.defaultItems ?? []).map(
        (item: SpectrumSearchAutocompleteItemData) => ({
          key: item.key,
          label: item.label,
          textValue: item.textValue ?? item.label,
          isDisabled: item.isDisabled,
          "aria-label": item["aria-label"],
        })
      )
    );

    const isAsync = computed(() => props.loadingState !== undefined);

    const state = useComboBoxState<NormalizedSearchAutocompleteItem>({
      collection: normalizedItems,
      selectedKey: props.selectedKey,
      defaultSelectedKey: props.defaultSelectedKey,
      onSelectionChange: (key) => {
        props.onSelectionChange?.(key);
        if (key !== null) {
          const selectedItem = normalizedItems.value.find((item) => item.key === key);
          props.onSubmit?.(selectedItem?.label ?? "", key);
        }
      },
      inputValue: props.inputValue,
      defaultInputValue: props.defaultInputValue,
      onInputChange: props.onInputChange,
      isOpen: props.isOpen,
      defaultOpen: props.defaultOpen,
      onOpenChange: props.onOpenChange,
      defaultFilter: props.defaultFilter ?? DEFAULT_FILTER,
      completionMode: props.completionMode,
      menuTrigger: props.menuTrigger ?? "input",
      allowsEmptyCollection: computed(
        () => props.allowsEmptyCollection ?? isAsync.value
      ),
      allowsCustomValue: computed(() => props.allowsCustomValue ?? true),
      shouldCloseOnBlur: props.shouldCloseOnBlur,
      isReadOnly: props.isReadOnly,
    });

    const submitCurrentValue = (key: Key | null = state.selectedKey.value) => {
      let value = state.inputValue.value;
      if (key !== null) {
        const selectedItem = normalizedItems.value.find((item) => item.key === key);
        if (selectedItem) {
          value = selectedItem.label;
        }
      }

      props.onSubmit?.(value, key);
    };

    const {
      labelProps,
      inputProps,
      listBoxProps,
      descriptionProps,
      errorMessageProps,
    } = useComboBox(
      {
        id: props.id,
        label: props.label,
        description: props.description,
        errorMessage: props.errorMessage,
        isDisabled: props.isDisabled,
        isReadOnly: props.isReadOnly,
        isRequired: props.isRequired,
        inputRef,
        popoverRef,
        listBoxRef,
        "aria-label": props["aria-label"] ?? props.ariaLabel,
        "aria-labelledby": props["aria-labelledby"] ?? props.ariaLabelledby,
        "aria-describedby": props["aria-describedby"] ?? props.ariaDescribedby,
        onFocus: props.onFocus,
        onBlur: props.onBlur,
        onKeydown: (event) => {
          if (event.key === "Escape" && !props.isDisabled && !props.isReadOnly) {
            if (state.inputValue.value.length > 0) {
              state.setSelectedKey(null);
              state.setInputValue("");
              props.onClear?.();
            }
          }

          if (event.key === "Enter") {
            const focusedKey = state.isOpen.value ? state.focusedKey.value : null;
            if (focusedKey !== null && focusedKey !== state.selectedKey.value) {
              return;
            }

            submitCurrentValue(focusedKey ?? state.selectedKey.value);
          }

          props.onKeydown?.(event);
        },
      },
      state
    );

    const clearSearch = () => {
      if (props.isDisabled || props.isReadOnly) {
        return;
      }

      state.setSelectedKey(null);
      state.setInputValue("");
      state.close();
      props.onClear?.();
      inputRef.value?.focus();
    };

    const onListBoxScroll = (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (!target || !props.onLoadMore || isLoadingList.value) {
        loadMoreRequested.value = false;
        return;
      }

      const distance = target.scrollHeight - target.scrollTop - target.clientHeight;
      if (distance > 4) {
        loadMoreRequested.value = false;
        return;
      }

      if (loadMoreRequested.value) {
        return;
      }

      loadMoreRequested.value = true;
      props.onLoadMore();
    };

    const isLoadingInput = computed(
      () => props.loadingState === "loading" || props.loadingState === "filtering"
    );
    const isLoadingList = computed(
      () => props.loadingState === "loading" || props.loadingState === "loadingMore"
    );

    const shouldShowClearButton = computed(() => {
      if (props.isReadOnly) {
        return false;
      }

      return state.inputValue.value.length > 0 || props.loadingState === "filtering";
    });

    const shouldShowList = computed(
      () =>
        state.isOpen.value &&
        (state.collection.value.length > 0 ||
          Boolean(props.allowsEmptyCollection ?? isAsync.value) ||
          isLoadingList.value)
    );

    const resolvedIcon = computed(() => {
      if (props.icon === "" || props.icon === null) {
        return null;
      }

      if (props.icon !== undefined) {
        return props.icon;
      }

      return h("span", {
        "data-testid": "searchicon",
        class: classNames("react-spectrum-SearchAutocomplete-icon"),
        "aria-hidden": "true",
      });
    });

    expose({
      UNSAFE_getDOMNode: () => rootRef.value,
      focus: () => {
        inputRef.value?.focus();
      },
      blur: () => {
        inputRef.value?.blur();
      },
      open: (focusStrategy: FocusStrategy = null, trigger: MenuTriggerAction = "manual") => {
        state.open(focusStrategy, trigger);
      },
      close: () => {
        state.close();
      },
    });

    return () => {
      const domProps = filterDOMProps(attrs as Record<string, unknown>, {
        labelable: true,
      });
      const { styleProps } = useStyleProps({
        isHidden: props.isHidden,
        UNSAFE_className: props.UNSAFE_className,
        UNSAFE_style: props.UNSAFE_style,
      });

      const renderedList = state.collection.value.map((item) =>
        h(SearchAutocompleteOption, {
          key: String(item.key),
          item,
          state,
        })
      );

      if (state.collection.value.length === 0 && !isLoadingList.value && isAsync.value) {
        renderedList.push(
          h(
            "div",
            {
              class: classNames("spectrum-Menu-item", "is-empty"),
            },
            "No results"
          )
        );
      }

      if (isLoadingList.value) {
        renderedList.push(
          h(
            "div",
            {
              role: "option",
              class: classNames("spectrum-Menu-item", "is-loading"),
            },
            [
              h(ProgressCircle, {
                isIndeterminate: true,
                size: "S",
                "aria-label":
                  props.loadingState === "loadingMore"
                    ? "Loading more"
                    : "Loading",
              }),
            ]
          )
        );
      }

      const clearButton = shouldShowClearButton.value
        ? h(ClearButton as any, {
            "aria-label": "Clear search",
            onPress: clearSearch,
            preventFocus: true,
            isDisabled: Boolean(props.isDisabled),
            UNSAFE_className: classNames("spectrum-ClearButton"),
          })
        : null;

      const loadingIndicator = isLoadingInput.value
        ? h(ProgressCircle, {
            isIndeterminate: true,
            size: "S",
            "aria-label": "Loading",
          })
        : null;

      return h(
        "div",
        mergeProps(domProps, {
          ref: (value: unknown) => {
            rootRef.value = value as HTMLElement | null;
          },
          class: classNames(
            "react-spectrum-SearchAutocomplete",
            {
              "is-open": state.isOpen.value,
              "is-disabled": Boolean(props.isDisabled),
              "is-readOnly": Boolean(props.isReadOnly),
            },
            styleProps.class as ClassValue | undefined,
            domProps.class as ClassValue | undefined
          ),
          style: styleProps.style,
          hidden: styleProps.hidden,
        }),
        [
          props.label
            ? h(
                "label",
                mergeProps(labelProps.value, {
                  class: classNames("spectrum-FieldLabel"),
                }),
                props.label
              )
            : null,
          h("div", { class: classNames("react-spectrum-SearchAutocomplete-field") }, [
            resolvedIcon.value,
            h(
              "input",
              mergeProps(inputProps.value, {
                ref: (value: unknown) => {
                  inputRef.value = value as HTMLInputElement | null;
                },
                placeholder: props.placeholder,
                disabled: props.isDisabled,
                readonly: props.isReadOnly,
                required: props.isRequired,
                autofocus: props.autoFocus,
                type: "search",
                autocorrect: "off",
                autocomplete: "off",
                spellcheck: false,
                class: classNames(
                  "spectrum-Search-input",
                  "react-spectrum-SearchAutocomplete-input"
                ),
              })
            ),
            loadingIndicator,
            clearButton,
          ]),
          props.description
            ? h(
                "div",
                mergeProps(descriptionProps.value, {
                  class: classNames("spectrum-FieldDescription"),
                }),
                props.description
              )
            : null,
          props.errorMessage
            ? h(
                "div",
                mergeProps(errorMessageProps.value, {
                  class: classNames("spectrum-FieldError"),
                }),
                props.errorMessage
              )
            : null,
          shouldShowList.value
            ? h(
                "div",
                {
                  ref: (value: unknown) => {
                    popoverRef.value = value as HTMLElement | null;
                  },
                  class: classNames("react-spectrum-SearchAutocomplete-popover"),
                },
                [
                  h(
                    "div",
                    mergeProps(listBoxProps.value, {
                      ref: (value: unknown) => {
                        listBoxRef.value = value as HTMLElement | null;
                      },
                      "aria-label":
                        (listBoxProps.value["aria-label"] as string | undefined) ??
                        "Suggestions",
                      class: classNames(
                        "spectrum-Menu",
                        "react-spectrum-SearchAutocomplete-listBox"
                      ),
                      onScroll: onListBoxScroll,
                    }),
                    renderedList
                  ),
                ]
              )
            : null,
        ]
      );
    };
  },
});
