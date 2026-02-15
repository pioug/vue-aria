import { HiddenSelect, useSelect } from "@vue-aria/select";
import { ListCollection } from "@vue-aria/list-state";
import { useId } from "@vue-aria/utils";
import { computed, defineComponent, h, nextTick, onMounted, ref, type PropType, type VNode } from "vue";
import { ListBoxBase } from "@vue-spectrum/listbox";
import { Popover } from "@vue-spectrum/menu";
import { createPickerCollection, getPickerDisabledKeys } from "./collection";
import { usePickerState } from "./state";
import type { PickerKey, SpectrumPickerNodeData, SpectrumPickerProps } from "./types";

function isRenderableNode(node: VNode): boolean {
  return typeof node.type !== "symbol";
}

/**
 * Pickers allow choosing one option from a collapsible listbox.
 */
export const Picker = defineComponent({
  name: "SpectrumPicker",
  inheritAttrs: false,
  props: {
    id: String,
    label: String,
    ariaLabel: String,
    ariaLabelledby: String,
    items: {
      type: Array as PropType<Array<SpectrumPickerNodeData>>,
      required: false,
      default: undefined,
    },
    selectedKey: {
      type: [String, Number] as PropType<PickerKey | null | undefined>,
      required: false,
      default: undefined,
    },
    defaultSelectedKey: {
      type: [String, Number] as PropType<PickerKey | null | undefined>,
      required: false,
      default: undefined,
    },
    onSelectionChange: {
      type: Function as PropType<SpectrumPickerProps["onSelectionChange"]>,
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
      type: Function as PropType<SpectrumPickerProps["onOpenChange"]>,
      required: false,
    },
    isDisabled: {
      type: Boolean,
      required: false,
      default: undefined,
    },
    isLoading: {
      type: Boolean,
      required: false,
      default: undefined,
    },
    isRequired: {
      type: Boolean,
      required: false,
      default: undefined,
    },
    isInvalid: {
      type: Boolean,
      required: false,
      default: undefined,
    },
    validationState: {
      type: String as PropType<SpectrumPickerProps["validationState"]>,
      required: false,
      default: undefined,
    },
    placeholder: {
      type: String,
      required: false,
      default: "Select…",
    },
    autoComplete: String,
    name: String,
    form: String,
    autoFocus: {
      type: Boolean,
      required: false,
      default: undefined,
    },
    onFocus: {
      type: Function as PropType<SpectrumPickerProps["onFocus"]>,
      required: false,
    },
    onBlur: {
      type: Function as PropType<SpectrumPickerProps["onBlur"]>,
      required: false,
    },
    UNSAFE_className: String,
    UNSAFE_style: Object as PropType<Record<string, unknown> | undefined>,
  },
  setup(props, { attrs, slots, expose }) {
    const triggerRef = ref<HTMLElement | null>(null);
    const triggerRefObject = {
      get current() {
        return triggerRef.value;
      },
      set current(value: HTMLElement | null) {
        triggerRef.value = value;
      },
    };

    const slotChildren = (slots.default?.() ?? []).filter((node): node is VNode => isRenderableNode(node));
    const collectionNodes = createPickerCollection(props.items, slotChildren);
    const collection = new ListCollection(collectionNodes as any);
    const disabledKeys = getPickerDisabledKeys(collectionNodes);
    const state = usePickerState(props as SpectrumPickerProps, collection as any, disabledKeys);

    const {
      labelProps,
      triggerProps,
      valueProps,
      menuProps,
      hiddenSelectProps,
      descriptionProps,
      errorMessageProps,
      isInvalid,
      validationErrors,
    } = useSelect(
      {
        label: props.label,
        name: props.name,
        form: props.form,
        autoComplete: props.autoComplete,
        isDisabled: props.isDisabled,
        isRequired: props.isRequired,
        onFocus: props.onFocus,
        onBlur: props.onBlur,
        "aria-label": props.ariaLabel,
        "aria-labelledby": props.ariaLabelledby,
      },
      state as any,
      triggerRefObject
    );
    const loadingId = useId();
    const shouldShowTriggerSpinner = computed(() => Boolean(props.isLoading) && collectionNodes.length === 0);
    const triggerAriaDescribedby = computed(() => {
      const ids: string[] = [];
      const existingDescription = triggerProps["aria-describedby"];
      if (typeof existingDescription === "string" && existingDescription.length > 0) {
        ids.push(existingDescription);
      }

      if (shouldShowTriggerSpinner.value) {
        ids.push(loadingId);
      }

      return ids.length > 0 ? ids.join(" ") : undefined;
    });

    const selectedText = computed(() => {
      const selectedItem = state.selectedItem;
      if (selectedItem?.rendered != null) {
        if (typeof selectedItem.rendered === "string" || typeof selectedItem.rendered === "number") {
          return String(selectedItem.rendered);
        }

        return selectedItem.textValue;
      }

      return props.placeholder ?? "Select…";
    });

    onMounted(() => {
      if (!props.autoFocus) {
        return;
      }

      void nextTick(() => {
        triggerRef.value?.focus();
      });
    });

    expose({
      focus: () => triggerRef.value?.focus(),
      UNSAFE_getDOMNode: () => triggerRef.value,
    });

    return () => {
      const attrsRecord = attrs as Record<string, unknown>;
      const onTriggerClick = (event: MouseEvent) => {
        (triggerProps.onClick as ((event: MouseEvent) => void) | undefined)?.(event);
        if (!props.isDisabled) {
          state.toggle();
        }
      };

      return h(
        "div",
        {
          ...attrsRecord,
          class: [
            attrsRecord.class,
            "spectrum-Dropdown",
            {
              "is-invalid": isInvalid && !props.isDisabled,
              "is-disabled": props.isDisabled,
            },
            props.UNSAFE_className,
          ],
          style: [attrsRecord.style, props.UNSAFE_style],
        },
        [
          h(HiddenSelect as any, {
            ...hiddenSelectProps,
            autoComplete: props.autoComplete,
          }),
          props.label
            ? h(
                "span",
                {
                  ...labelProps,
                  class: "spectrum-FieldLabel",
                },
                props.label
              )
            : null,
          h(
            "button",
            {
              ...triggerProps,
              id: props.id ?? (triggerProps.id as string | undefined),
              "aria-expanded": state.isOpen ? "true" : "false",
              "aria-controls": state.isOpen ? (menuProps.id as string | undefined) : undefined,
              "aria-describedby": triggerAriaDescribedby.value,
              ref: triggerRef,
              type: "button",
              class: "spectrum-Dropdown-trigger",
              disabled: props.isDisabled || undefined,
              onClick: onTriggerClick,
              onKeydown: (triggerProps.onKeyDown ??
                triggerProps.onKeydown) as ((event: KeyboardEvent) => void) | undefined,
              onKeyDown: (triggerProps.onKeyDown ??
                triggerProps.onKeydown) as ((event: KeyboardEvent) => void) | undefined,
            },
            [
              h(
                "span",
                {
                  ...valueProps,
                  class: ["spectrum-Dropdown-label", { "is-placeholder": !state.selectedItem }],
                },
                selectedText.value
              ),
              h("span", {
                class: "spectrum-Dropdown-icon",
                "aria-hidden": "true",
              }),
              shouldShowTriggerSpinner.value
                ? h("span", {
                    id: loadingId,
                    role: "progressbar",
                    "aria-label": "Loading…",
                  })
                : null,
            ]
          ),
          collectionNodes.length > 0
            ? h(
                Popover as any,
                {
                  state,
                  triggerRef: triggerRefObject,
                  placement: "bottom start",
                  shouldFlip: true,
                  hideArrow: true,
                  shouldContainFocus: true,
                },
                {
                  default: () => [
                    h(ListBoxBase as any, {
                      id: menuProps.id,
                      ariaLabel: menuProps["aria-label"],
                      ariaLabelledby: menuProps["aria-labelledby"],
                      autoFocus: (state.focusStrategy || true) as boolean | "first" | "last",
                      shouldUseVirtualFocus: menuProps.shouldUseVirtualFocus as boolean | undefined,
                      shouldSelectOnPressUp: menuProps.shouldSelectOnPressUp as boolean | undefined,
                      shouldFocusOnHover: menuProps.shouldFocusOnHover as boolean | undefined,
                      onBlur: menuProps.onBlur as ((event: FocusEvent) => void) | undefined,
                      onFocus: menuProps.onFocus as ((event: FocusEvent) => void) | undefined,
                      onFocusChange: menuProps.onFocusChange as ((isFocused: boolean) => void) | undefined,
                      onAction: (key: PickerKey) => {
                        (menuProps.onAction as ((key: PickerKey) => void) | undefined)?.(key);
                        state.close();
                      },
                      isLoading: props.isLoading,
                      state,
                    }),
                  ],
                }
              )
            : null,
          validationErrors.length > 0
            ? h(
                "div",
                {
                  ...errorMessageProps,
                  class: "spectrum-HelpText is-invalid",
                },
                validationErrors.join(", ")
              )
            : null,
          h("div", {
            ...descriptionProps,
            style: { display: "none" },
          }),
        ]
      );
    };
  },
});
