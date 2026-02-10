import {
  computed,
  defineComponent,
  h,
  ref,
  toValue,
  type PropType,
} from "vue";
import { useComboBox } from "@vue-aria/combobox";
import {
  useComboBoxState,
  type CompletionMode,
  type FilterFn,
  type FocusStrategy,
  type MenuTrigger,
  type MenuTriggerAction,
} from "@vue-aria/combobox-state";
import { useOption } from "@vue-aria/listbox";
import { filterDOMProps, mergeProps } from "@vue-aria/utils";
import type { Key } from "@vue-aria/types";
import { ProgressCircle } from "@vue-spectrum/progress";
import {
  classNames,
  useStyleProps,
  type ClassValue,
} from "@vue-spectrum/utils";
import type { SpectrumComboBoxItemData } from "./types";

export interface SpectrumComboBoxProps {
  id?: string | undefined;
  label?: string | undefined;
  description?: string | undefined;
  errorMessage?: string | undefined;
  items?: SpectrumComboBoxItemData[] | undefined;
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
  loadingState?: "idle" | "loading" | "loadingMore" | "filtering" | undefined;
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
  slot?: string | undefined;
  isHidden?: boolean | undefined;
  UNSAFE_className?: string | undefined;
  UNSAFE_style?: Record<string, string | number> | undefined;
}

interface NormalizedComboBoxItem {
  key: Key;
  textValue?: string | undefined;
  label: string;
  isDisabled?: boolean | undefined;
  "aria-label"?: string | undefined;
}

const DEFAULT_FILTER: FilterFn = (textValue, inputValue) =>
  textValue.toLowerCase().includes(inputValue.toLowerCase());

const ComboBoxOption = defineComponent({
  name: "ComboBoxOption",
  props: {
    item: {
      type: Object as PropType<NormalizedComboBoxItem>,
      required: true,
    },
    state: {
      type: Object as PropType<ReturnType<typeof useComboBoxState<NormalizedComboBoxItem>>>,
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

export const ComboBox = defineComponent({
  name: "ComboBox",
  inheritAttrs: false,
  props: {
    id: {
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
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    items: {
      type: Array as PropType<SpectrumComboBoxItemData[] | undefined>,
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
    loadingState: {
      type: String as PropType<"idle" | "loading" | "loadingMore" | "filtering" | undefined>,
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
  },
  setup(props, { attrs, expose }) {
    const rootRef = ref<HTMLElement | null>(null);
    const inputRef = ref<HTMLInputElement | null>(null);
    const popoverRef = ref<HTMLElement | null>(null);
    const listBoxRef = ref<HTMLElement | null>(null);
    const buttonRef = ref<HTMLButtonElement | null>(null);
    const loadMoreRequested = ref(false);

    const normalizedItems = computed<NormalizedComboBoxItem[]>(() =>
      (props.items ?? []).map((item) => ({
        key: item.key,
        label: item.label,
        textValue: item.textValue ?? item.label,
        isDisabled: item.isDisabled,
        "aria-label": item["aria-label"],
      }))
    );

    const state = useComboBoxState<NormalizedComboBoxItem>({
      collection: normalizedItems,
      selectedKey: props.selectedKey,
      defaultSelectedKey: props.defaultSelectedKey,
      onSelectionChange: props.onSelectionChange,
      inputValue: props.inputValue,
      defaultInputValue: props.defaultInputValue,
      onInputChange: props.onInputChange,
      isOpen: props.isOpen,
      defaultOpen: props.defaultOpen,
      onOpenChange: props.onOpenChange,
      defaultFilter: props.defaultFilter ?? DEFAULT_FILTER,
      completionMode: props.completionMode,
      menuTrigger: props.menuTrigger,
      allowsEmptyCollection: props.allowsEmptyCollection,
      allowsCustomValue: props.allowsCustomValue,
      shouldCloseOnBlur: props.shouldCloseOnBlur,
      isReadOnly: props.isReadOnly,
    });

    const {
      labelProps,
      inputProps,
      listBoxProps,
      buttonProps,
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
        buttonRef,
        "aria-label": props["aria-label"] ?? props.ariaLabel,
        "aria-labelledby": props["aria-labelledby"] ?? props.ariaLabelledby,
        "aria-describedby": props["aria-describedby"] ?? props.ariaDescribedby,
        onFocus: props.onFocus,
        onBlur: props.onBlur,
        onKeydown: props.onKeydown,
      },
      state
    );

    const isLoading = computed(
      () => props.loadingState === "loading" || props.loadingState === "loadingMore"
    );

    const resolvedButtonDisabled = computed(() => {
      const value = (buttonProps.value.isDisabled as boolean | undefined) ?? false;
      return Boolean(value);
    });

    const onButtonPressStart = (
      buttonProps.value.onPressStart as
        | ((event: { pointerType: string }) => void)
        | undefined
    );
    const onButtonPress = (
      buttonProps.value.onPress as
        | ((event: { pointerType: string }) => void)
        | undefined
    );

    const resolvePointerType = (event: Event): string => {
      if (event instanceof PointerEvent) {
        return event.pointerType;
      }

      if (event instanceof KeyboardEvent) {
        return "keyboard";
      }

      return "mouse";
    };

    const onButtonMousedown = (event: MouseEvent) => {
      if (resolvedButtonDisabled.value) {
        return;
      }

      event.preventDefault();
      onButtonPressStart?.({
        pointerType: resolvePointerType(event),
      });
    };

    const onButtonClick = (event: MouseEvent) => {
      if (resolvedButtonDisabled.value) {
        return;
      }

      onButtonPress?.({
        pointerType: resolvePointerType(event),
      });
    };

    const onListBoxScroll = (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (!target || !props.onLoadMore || isLoading.value) {
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

    expose({
      UNSAFE_getDOMNode: () => rootRef.value,
      focus: () => {
        inputRef.value?.focus();
      },
      blur: () => {
        inputRef.value?.blur();
      },
      toggle: (focusStrategy: FocusStrategy = null, trigger: MenuTriggerAction = "manual") => {
        state.toggle(focusStrategy, trigger);
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
        h(ComboBoxOption, {
          key: String(item.key),
          item,
          state,
        })
      );

      if (isLoading.value) {
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

      const shouldShowList =
        state.isOpen.value &&
        (state.collection.value.length > 0 || Boolean(props.allowsEmptyCollection) || isLoading.value);

      return h(
        "div",
        mergeProps(domProps, {
          ref: (value: unknown) => {
            rootRef.value = value as HTMLElement | null;
          },
          class: classNames(
            "react-spectrum-ComboBox",
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
            ? h("label", mergeProps(labelProps.value, {
              class: classNames("spectrum-FieldLabel"),
            }), props.label)
            : null,
          h("div", { class: classNames("react-spectrum-ComboBox-field") }, [
            h("input", mergeProps(inputProps.value, {
              ref: (value: unknown) => {
                inputRef.value = value as HTMLInputElement | null;
              },
              placeholder: props.placeholder,
              disabled: props.isDisabled,
              readonly: props.isReadOnly,
              required: props.isRequired,
              autofocus: props.autoFocus,
              class: classNames("react-spectrum-ComboBox-input"),
            })),
            h("button", {
              id: buttonProps.value.id as string | undefined,
              ref: (value: unknown) => {
                buttonRef.value = value as HTMLButtonElement | null;
              },
              type: "button",
              tabindex: (buttonProps.value.tabIndex as number | undefined) ?? -1,
              disabled: resolvedButtonDisabled.value,
              "aria-haspopup": buttonProps.value["aria-haspopup"] as string | undefined,
              "aria-expanded": buttonProps.value["aria-expanded"] as boolean | undefined,
              "aria-controls": buttonProps.value["aria-controls"] as string | undefined,
              "aria-labelledby": buttonProps.value["aria-labelledby"] as string | undefined,
              "aria-label": buttonProps.value["aria-label"] as string | undefined,
              class: classNames("react-spectrum-ComboBox-button"),
              onMousedown: onButtonMousedown,
              onClick: onButtonClick,
            }, "▼"),
          ]),
          props.description
            ? h("div", mergeProps(descriptionProps.value, {
              class: classNames("spectrum-FieldDescription"),
            }), props.description)
            : null,
          props.errorMessage
            ? h("div", mergeProps(errorMessageProps.value, {
              class: classNames("spectrum-FieldError"),
            }), props.errorMessage)
            : null,
          shouldShowList
            ? h("div", {
              ref: (value: unknown) => {
                popoverRef.value = value as HTMLElement | null;
              },
              class: classNames("react-spectrum-ComboBox-popover"),
            }, [
              h("div", mergeProps(listBoxProps.value, {
                ref: (value: unknown) => {
                  listBoxRef.value = value as HTMLElement | null;
                },
                class: classNames("spectrum-Menu", "react-spectrum-ComboBox-listBox"),
                onScroll: onListBoxScroll,
              }), renderedList),
            ])
            : null,
        ]
      );
    };
  },
});
