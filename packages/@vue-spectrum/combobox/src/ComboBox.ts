import { useComboBox } from "@vue-aria/combobox";
import { useComboBoxState } from "@vue-aria/combobox-state";
import { getItemId } from "@vue-aria/listbox";
import { defineComponent, h, onMounted, ref, watch, type PropType, type VNode } from "vue";
import { ListBoxBase } from "@vue-spectrum/listbox";
import { createComboBoxCollection, getComboBoxDisabledKeys } from "./collection";
import type { ComboBoxKey, SpectrumComboBoxNodeData, SpectrumComboBoxProps } from "./types";

function isRenderableNode(node: VNode): boolean {
  return typeof node.type !== "symbol";
}

function resolveElement(value: unknown): HTMLElement | null {
  if (value instanceof HTMLElement) {
    return value;
  }

  if (
    value
    && typeof value === "object"
    && "UNSAFE_getDOMNode" in value
    && typeof (value as { UNSAFE_getDOMNode?: unknown }).UNSAFE_getDOMNode === "function"
  ) {
    const element = (value as { UNSAFE_getDOMNode: () => unknown }).UNSAFE_getDOMNode();
    return element instanceof HTMLElement ? element : null;
  }

  if (value && typeof value === "object" && "$el" in value) {
    const element = (value as { $el?: unknown }).$el;
    return element instanceof HTMLElement ? element : null;
  }

  return null;
}

const PLACEHOLDER_DEPRECATION_WARNING =
  "Placeholders are deprecated due to accessibility issues. Please use help text instead. See the docs for details: https://react-spectrum.adobe.com/react-spectrum/ComboBox.html#help-text";

/**
 * ComboBox combines a text input with listbox suggestions.
 */
export const ComboBox = defineComponent({
  name: "SpectrumComboBox",
  inheritAttrs: false,
  props: {
    id: String,
    label: String,
    description: String,
    errorMessage: String,
    items: {
      type: Array as PropType<Array<SpectrumComboBoxNodeData>>,
      required: false,
      default: undefined,
    },
    selectedKey: {
      type: [String, Number] as PropType<ComboBoxKey | null | undefined>,
      required: false,
      default: undefined,
    },
    defaultSelectedKey: {
      type: [String, Number] as PropType<ComboBoxKey | null | undefined>,
      required: false,
      default: undefined,
    },
    onSelectionChange: {
      type: Function as PropType<SpectrumComboBoxProps["onSelectionChange"]>,
      required: false,
    },
    inputValue: {
      type: String,
      required: false,
      default: undefined,
    },
    defaultInputValue: {
      type: String,
      required: false,
      default: undefined,
    },
    onInputChange: {
      type: Function as PropType<SpectrumComboBoxProps["onInputChange"]>,
      required: false,
    },
    isOpen: {
      type: Boolean,
      required: false,
      default: undefined,
    },
    defaultOpen: {
      type: Boolean,
      required: false,
      default: undefined,
    },
    onOpenChange: {
      type: Function as PropType<SpectrumComboBoxProps["onOpenChange"]>,
      required: false,
    },
    defaultFilter: {
      type: Function as PropType<SpectrumComboBoxProps["defaultFilter"]>,
      required: false,
      default: undefined,
    },
    menuTrigger: {
      type: String as PropType<SpectrumComboBoxProps["menuTrigger"]>,
      required: false,
      default: undefined,
    },
    allowsEmptyCollection: {
      type: Boolean as PropType<SpectrumComboBoxProps["allowsEmptyCollection"]>,
      required: false,
      default: undefined,
    },
    allowsCustomValue: {
      type: Boolean as PropType<SpectrumComboBoxProps["allowsCustomValue"]>,
      required: false,
      default: undefined,
    },
    shouldCloseOnBlur: {
      type: Boolean as PropType<SpectrumComboBoxProps["shouldCloseOnBlur"]>,
      required: false,
      default: undefined,
    },
    maxHeight: {
      type: Number as PropType<SpectrumComboBoxProps["maxHeight"]>,
      required: false,
      default: undefined,
    },
    onLoadMore: {
      type: Function as PropType<SpectrumComboBoxProps["onLoadMore"]>,
      required: false,
    },
    loadingState: {
      type: String as PropType<SpectrumComboBoxProps["loadingState"]>,
      required: false,
      default: undefined,
    },
    isDisabled: {
      type: Boolean as PropType<SpectrumComboBoxProps["isDisabled"]>,
      required: false,
      default: undefined,
    },
    isReadOnly: {
      type: Boolean as PropType<SpectrumComboBoxProps["isReadOnly"]>,
      required: false,
      default: undefined,
    },
    isRequired: {
      type: Boolean as PropType<SpectrumComboBoxProps["isRequired"]>,
      required: false,
      default: undefined,
    },
    isInvalid: {
      type: Boolean as PropType<SpectrumComboBoxProps["isInvalid"]>,
      required: false,
      default: undefined,
    },
    validationState: {
      type: String as PropType<SpectrumComboBoxProps["validationState"]>,
      required: false,
      default: undefined,
    },
    placeholder: {
      type: String,
      required: false,
      default: undefined,
    },
    name: String,
    form: String,
    formValue: {
      type: String as PropType<SpectrumComboBoxProps["formValue"]>,
      required: false,
      default: undefined,
    },
    autoFocus: {
      type: Boolean as PropType<SpectrumComboBoxProps["autoFocus"]>,
      required: false,
      default: undefined,
    },
    ariaLabel: String,
    ariaLabelledby: String,
    ariaDescribedby: String,
    onFocus: {
      type: Function as PropType<SpectrumComboBoxProps["onFocus"]>,
      required: false,
    },
    onBlur: {
      type: Function as PropType<SpectrumComboBoxProps["onBlur"]>,
      required: false,
    },
    UNSAFE_className: String,
    UNSAFE_style: Object as PropType<Record<string, unknown> | undefined>,
  },
  setup(props, { attrs, slots, expose }) {
    const inputRef = ref<HTMLInputElement | null>(null);
    const buttonRef = ref<HTMLElement | null>(null);
    const popoverRef = ref<HTMLElement | null>(null);
    const listBoxRef = ref<HTMLElement | null>(null);

    const inputRefObject = {
      get current() {
        return inputRef.value;
      },
      set current(value: HTMLInputElement | null) {
        inputRef.value = value;
      },
    };
    const buttonRefObject = {
      get current() {
        return buttonRef.value;
      },
      set current(value: Element | null) {
        buttonRef.value = value as HTMLElement | null;
      },
    };
    const popoverRefObject = {
      get current() {
        return popoverRef.value;
      },
      set current(value: Element | null) {
        popoverRef.value = value as HTMLElement | null;
      },
    };
    const listBoxRefObject = {
      get current() {
        return listBoxRef.value;
      },
      set current(value: HTMLElement | null) {
        listBoxRef.value = value;
      },
    };

    const slotChildren = (slots.default?.() ?? []).filter((node): node is VNode => isRenderableNode(node));
    const collectionNodes = createComboBoxCollection(props.items, slotChildren);
    const disabledKeys = getComboBoxDisabledKeys(collectionNodes);

    const state = useComboBoxState<object>({
      items: collectionNodes as any,
      disabledKeys,
      defaultSelectedKey: props.selectedKey ?? props.defaultSelectedKey,
      onSelectionChange: props.onSelectionChange,
      get inputValue() {
        return props.inputValue;
      },
      get defaultInputValue() {
        return props.defaultInputValue;
      },
      onInputChange: props.onInputChange,
      get isOpen() {
        return props.isOpen;
      },
      get defaultOpen() {
        return props.defaultOpen;
      },
      onOpenChange: props.onOpenChange,
      defaultFilter: props.defaultFilter,
      get menuTrigger() {
        return props.menuTrigger;
      },
      get allowsEmptyCollection() {
        return props.allowsEmptyCollection || props.loadingState != null;
      },
      get allowsCustomValue() {
        return props.allowsCustomValue;
      },
      get shouldCloseOnBlur() {
        return props.shouldCloseOnBlur;
      },
      get isReadOnly() {
        return props.isReadOnly;
      },
      get isDisabled() {
        return props.isDisabled;
      },
      get isRequired() {
        return props.isRequired;
      },
      get isInvalid() {
        return props.isInvalid;
      },
      get validationState() {
        return props.validationState;
      },
    } as any);

    watch(
      () => [props.selectedKey, state.selectedKey] as const,
      ([selectedKey, currentSelectedKey]) => {
        if (selectedKey === undefined) {
          return;
        }

        if (currentSelectedKey !== selectedKey) {
          state.setSelectedKey(selectedKey ?? null);
        }
      },
      { immediate: true }
    );

    const {
      labelProps,
      inputProps,
      listBoxProps,
      buttonProps,
      descriptionProps,
      errorMessageProps,
      isInvalid,
      validationErrors,
    } = useComboBox(
      {
        inputRef: inputRefObject,
        listBoxRef: listBoxRefObject,
        popoverRef: popoverRefObject,
        buttonRef: buttonRefObject,
        label: props.label,
        name: (props.allowsCustomValue ? "text" : (props.formValue ?? "text")) === "text" ? props.name : undefined,
        form:
          (props.allowsCustomValue ? "text" : (props.formValue ?? "text")) === "text"
            ? props.form
            : undefined,
        isDisabled: props.isDisabled,
        isReadOnly: props.isReadOnly,
        allowsCustomValue: props.allowsCustomValue,
        onFocus: props.onFocus,
        onBlur: props.onBlur,
        "aria-label": props.ariaLabel,
        "aria-labelledby": props.ariaLabelledby,
        "aria-describedby": props.ariaDescribedby,
      },
      state as any
    );

    onMounted(() => {
      if (props.autoFocus) {
        inputRef.value?.focus();
      }

      if (props.placeholder && process.env.NODE_ENV !== "production") {
        console.warn(PLACEHOLDER_DEPRECATION_WARNING);
      }
    });

    expose({
      focus: () => inputRef.value?.focus(),
      blur: () => inputRef.value?.blur(),
      getInputElement: () => inputRef.value,
      UNSAFE_getDOMNode: () => inputRef.value,
    });

    return () => {
      const attrsRecord = attrs as Record<string, unknown>;
      const resolvedErrorMessage = props.errorMessage ?? validationErrors.join(", ");
      const focusedKey = state.selectionManager.focusedKey as ComboBoxKey | null;
      const activeDescendant =
        focusedKey != null ? getItemId(state as any, focusedKey) : undefined;

      return h(
        "div",
        {
          ...attrsRecord,
          class: [
            attrsRecord.class,
            "spectrum-ComboBox",
            {
              "is-invalid": isInvalid && !props.isDisabled,
              "is-disabled": props.isDisabled,
            },
            props.UNSAFE_className,
          ],
          style: [attrsRecord.style, props.UNSAFE_style],
        },
        [
          props.label
            ? h(
                "label",
                {
                  ...labelProps,
                  class: "spectrum-FieldLabel",
                },
                props.label
              )
            : null,
          h(
            "div",
            {
              class: [
                "spectrum-Textfield",
                "spectrum-ComboBox-textfield",
                {
                  "is-invalid": isInvalid && !props.isDisabled,
                  "is-disabled": props.isDisabled,
                },
              ],
            },
            [
              h("input", {
                ...inputProps,
                id: props.id ?? (inputProps.id as string | undefined),
                ref: inputRef,
                class: "spectrum-Textfield-input",
                value: state.inputValue,
                disabled: props.isDisabled || undefined,
                readonly: props.isReadOnly || undefined,
                placeholder: props.placeholder,
                "aria-invalid": isInvalid && !props.isDisabled ? "true" : undefined,
                "aria-controls": state.isOpen ? (listBoxProps.id as string | undefined) : undefined,
                "aria-activedescendant": activeDescendant,
              }),
              h(
                "button",
                {
                  ...buttonProps,
                  ref: buttonRef,
                  type: "button",
                  class: "spectrum-FieldButton",
                  disabled: props.isDisabled || props.isReadOnly || undefined,
                  onClick: (event: MouseEvent) => {
                    (buttonProps.onClick as ((event: MouseEvent) => void) | undefined)?.(event);
                    if (!props.isDisabled && !props.isReadOnly) {
                      state.toggle(null, "manual");
                    }
                  },
                },
                "▾"
              ),
            ]
          ),
          props.name && (props.allowsCustomValue ? "text" : (props.formValue ?? "text")) === "key"
            ? h("input", {
                type: "hidden",
                name: props.name,
                form: props.form,
                value: state.selectedKey == null ? "" : String(state.selectedKey),
              })
            : null,
          state.isOpen && (collectionNodes.length > 0 || props.loadingState === "loading" || props.loadingState === "loadingMore")
            ? h(
                "div",
                {
                  ref: popoverRef,
                  class: "spectrum-Popover spectrum-ComboBox-popover",
                  style: {
                    position: "absolute",
                    zIndex: 100000,
                  },
                },
                [
                  h(ListBoxBase as any, {
                    ...(listBoxProps as Record<string, unknown>),
                    id: listBoxProps.id,
                    ariaLabel: listBoxProps["aria-label"],
                    ariaLabelledby: listBoxProps["aria-labelledby"],
                    autoFocus: (state.focusStrategy ?? true) as boolean | "first" | "last" | undefined,
                    shouldUseVirtualFocus: listBoxProps.shouldUseVirtualFocus as boolean | undefined,
                    shouldSelectOnPressUp: listBoxProps.shouldSelectOnPressUp as boolean | undefined,
                    shouldFocusOnHover: listBoxProps.shouldFocusOnHover as boolean | undefined,
                    onBlur: listBoxProps.onBlur as ((event: FocusEvent) => void) | undefined,
                    onFocus: listBoxProps.onFocus as ((event: FocusEvent) => void) | undefined,
                    onFocusChange: listBoxProps.onFocusChange as ((isFocused: boolean) => void) | undefined,
                    onAction: listBoxProps.onAction as ((key: ComboBoxKey) => void) | undefined,
                    maxHeight: props.maxHeight,
                    onLoadMore: props.onLoadMore,
                    isLoading: props.loadingState === "loading" || props.loadingState === "loadingMore",
                    state,
                    ref: (value: unknown) => {
                      listBoxRef.value = resolveElement(value);
                    },
                  }),
                ]
              )
            : null,
          resolvedErrorMessage && isInvalid
            ? h(
                "div",
                {
                  ...errorMessageProps,
                  class: "spectrum-HelpText is-invalid",
                },
                resolvedErrorMessage
              )
            : props.description
              ? h(
                  "div",
                  {
                    ...descriptionProps,
                    class: "spectrum-HelpText",
                  },
                  props.description
                )
              : null,
        ]
      );
    };
  },
});
