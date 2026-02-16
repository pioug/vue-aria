import { HiddenSelect, useSelect } from "@vue-aria/select";
import { ListCollection } from "@vue-stately/list";
import { useId } from "@vue-aria/utils";
import {
  computed,
  defineComponent,
  h,
  nextTick,
  onMounted,
  ref,
  shallowRef,
  type PropType,
  type VNode,
} from "vue";
import { ListBoxBase } from "@vue-spectrum/listbox";
import { Popover } from "@vue-spectrum/menu";
import { createPickerCollection, getPickerDisabledKeys } from "./collection";
import { usePickerState } from "./state";
import type { PickerKey, SpectrumPickerNodeData, SpectrumPickerProps } from "./types";

function isRenderableNode(node: VNode): boolean {
  return typeof node.type !== "symbol";
}

function getCollectionSignature(nodes: Array<any>): string {
  const parts: string[] = [];
  const visit = (items: Array<any>) => {
    for (const item of items) {
      parts.push(`${String(item.key)}:${item.type}:${item.textValue ?? ""}`);
      if (Array.isArray(item.childNodes) && item.childNodes.length > 0) {
        visit(item.childNodes as Array<any>);
      }
    }
  };

  visit(nodes);
  return parts.join("|");
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
    description: String,
    errorMessage: {
      type: [String, Function] as PropType<SpectrumPickerProps["errorMessage"]>,
      required: false,
      default: undefined,
    },
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
    maxHeight: {
      type: Number as () => number | undefined,
      required: false,
      default: undefined,
    },
    onLoadMore: {
      type: Function as PropType<SpectrumPickerProps["onLoadMore"]>,
      required: false,
    },
    isRequired: {
      type: Boolean,
      required: false,
      default: undefined,
    },
    necessityIndicator: {
      type: String as PropType<SpectrumPickerProps["necessityIndicator"]>,
      required: false,
      default: undefined,
    },
    isInvalid: {
      type: Boolean,
      required: false,
      default: undefined,
    },
    validationBehavior: {
      type: String as PropType<SpectrumPickerProps["validationBehavior"]>,
      required: false,
      default: undefined,
    },
    validationState: {
      type: String as PropType<SpectrumPickerProps["validationState"]>,
      required: false,
      default: undefined,
    },
    validate: {
      type: Function as PropType<SpectrumPickerProps["validate"]>,
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
    const openedFromPressStart = ref(false);
    const pendingTouchOpen = ref(false);
    const triggerRefObject = {
      get current() {
        return triggerRef.value;
      },
      set current(value: HTMLElement | null) {
        triggerRef.value = value;
      },
    };

    const collectionNodes = shallowRef(createPickerCollection(props.items, []));
    const collectionNodesSignature = ref(getCollectionSignature(collectionNodes.value as any[]));
    const collection = shallowRef(new ListCollection(collectionNodes.value as any));
    const disabledKeys = computed(() => getPickerDisabledKeys(collectionNodes.value));
    const state = usePickerState(
      props as SpectrumPickerProps,
      () => collection.value as any,
      () => disabledKeys.value
    );

    const {
      labelProps,
      triggerProps,
      valueProps,
      menuProps,
      hiddenSelectProps,
      descriptionProps,
      errorMessageProps,
    } = useSelect(
      {
        label: props.label,
        description: props.description,
        name: props.name,
        form: props.form,
        autoComplete: props.autoComplete,
        isDisabled: props.isDisabled,
        isRequired: props.isRequired,
        validationBehavior: props.validationBehavior,
        errorMessage:
          typeof props.errorMessage === "string" ? props.errorMessage : undefined,
        onFocus: props.onFocus,
        onBlur: props.onBlur,
        "aria-label": props.ariaLabel,
        "aria-labelledby": props.ariaLabelledby,
      },
      state as any,
      triggerRefObject
    );
    const loadingId = useId();
    const descriptionId = useId();
    const errorMessageId = useId();
    const isInvalid = computed(() => state.displayValidation.isInvalid);
    const validationErrors = computed(() => state.displayValidation.validationErrors);
    const shouldShowTriggerSpinner = computed(() => Boolean(props.isLoading) && collectionNodes.value.length === 0);
    const triggerAriaDescribedby = computed(() => {
      const ids: string[] = [];
      const externalDescription = attrs["aria-describedby"];
      if (typeof externalDescription === "string" && externalDescription.length > 0) {
        ids.push(externalDescription);
      }

      if (shouldShowTriggerSpinner.value) {
        ids.push(loadingId);
      }

      if (props.description) {
        ids.push(descriptionId);
      }

      if (validationErrors.value.length > 0) {
        ids.push(errorMessageId);
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
      const slotChildren = (slots.default?.() ?? []).filter((node): node is VNode => isRenderableNode(node));
      const nextCollectionNodes = createPickerCollection(props.items, slotChildren);
      const nextCollectionSignature = getCollectionSignature(nextCollectionNodes as any[]);
      if (nextCollectionSignature !== collectionNodesSignature.value) {
        collectionNodesSignature.value = nextCollectionSignature;
        collectionNodes.value = nextCollectionNodes;
        collection.value = new ListCollection(nextCollectionNodes as any);
      }

      const attrsRecord = attrs as Record<string, unknown>;
      const isWithinPickerOverlay = (target: EventTarget | null): boolean => {
        if (!(target instanceof Node)) {
          return false;
        }

        if (triggerRef.value?.contains(target)) {
          return true;
        }

        const listboxId = menuProps.id as string | undefined;
        if (!listboxId) {
          return false;
        }

        const listboxElement = document.getElementById(listboxId);
        return Boolean(listboxElement?.contains(target));
      };
      const onTriggerClick = (event: MouseEvent) => {
        (triggerProps.onClick as ((event: MouseEvent) => void) | undefined)?.(event);

        if (props.isDisabled) {
          return;
        }

        if (openedFromPressStart.value) {
          openedFromPressStart.value = false;
          return;
        }

        state.toggle();
      };
      const onTriggerPressStart = (event: MouseEvent | PointerEvent) => {
        if (props.isDisabled) {
          openedFromPressStart.value = false;
          pendingTouchOpen.value = false;
          return;
        }

        const isTouchPointerEvent =
          "pointerType" in event
          && (event as PointerEvent).pointerType === "touch";

        if (isTouchPointerEvent) {
          openedFromPressStart.value = false;
          pendingTouchOpen.value = true;
          return;
        }

        if ("button" in event && event.button !== 0) {
          openedFromPressStart.value = false;
          pendingTouchOpen.value = false;
          return;
        }

        if (state.isOpen) {
          openedFromPressStart.value = false;
          pendingTouchOpen.value = false;
          return;
        }

        openedFromPressStart.value = true;
        pendingTouchOpen.value = false;
        state.open(null);
      };
      const onTriggerTouchStart = () => {
        if (props.isDisabled) {
          pendingTouchOpen.value = false;
          return;
        }

        pendingTouchOpen.value = true;
      };
      const onTriggerTouchEnd = () => {
        if (props.isDisabled || state.isOpen || !pendingTouchOpen.value) {
          pendingTouchOpen.value = false;
          return;
        }

        openedFromPressStart.value = true;
        pendingTouchOpen.value = false;
        state.open(null);
      };
      const onTriggerKeyDown = (event: KeyboardEvent) => {
        const triggerKeyDown =
          (triggerProps.onKeyDown ??
            triggerProps.onKeydown) as ((event: KeyboardEvent) => void) | undefined;
        triggerKeyDown?.(event);

        if (!event.defaultPrevented && event.key === "Tab" && state.isOpen) {
          event.preventDefault();
          const listboxId = menuProps.id as string | undefined;
          if (listboxId) {
            document.getElementById(listboxId)?.focus();
          }
        }
      };
      const onTriggerBlur = (event: FocusEvent) => {
        (triggerProps.onBlur as ((event: FocusEvent) => void) | undefined)?.(event);

        if (!state.isOpen || isWithinPickerOverlay(event.relatedTarget)) {
          return;
        }

        state.close();
        Promise.resolve().then(() => {
          triggerRef.value?.focus();
        });
      };
      const onListboxBlur = (event: FocusEvent) => {
        (menuProps.onBlur as ((event: FocusEvent) => void) | undefined)?.(event);

        if (!state.isOpen || isWithinPickerOverlay(event.relatedTarget)) {
          return;
        }

        state.close();
        Promise.resolve().then(() => {
          triggerRef.value?.focus();
        });
      };
      const onListboxKeyDown = (event: KeyboardEvent) => {
        (menuProps.onKeyDown as ((event: KeyboardEvent) => void) | undefined)?.(event);

        if (event.defaultPrevented || event.key !== "Escape") {
          return;
        }

        state.close();
        Promise.resolve().then(() => {
          triggerRef.value?.focus();
        });
      };
      const dismissButtonStyle = {
        border: "0",
        clipPath: "inset(50%)",
        height: "1px",
        margin: "-1px",
        overflow: "hidden",
        padding: "0",
        position: "absolute",
        whiteSpace: "nowrap",
        width: "1px",
      } as const;
      const onDismiss = () => {
        state.close();
        Promise.resolve().then(() => {
          triggerRef.value?.focus();
        });
      };
      const renderDismissButton = (key: string) =>
        h("button", {
          key,
          type: "button",
          "aria-label": "Dismiss",
          style: dismissButtonStyle,
          onClick: onDismiss,
        });

      return h(
        "div",
        {
          ...attrsRecord,
          class: [
            attrsRecord.class,
            "spectrum-Dropdown",
            {
              "is-invalid": isInvalid.value && !props.isDisabled,
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
            isRequired: props.isRequired,
            required: props.isRequired || undefined,
          }),
          props.label
            ? h("span", {
                ...labelProps,
                class: "spectrum-FieldLabel",
              }, [
                props.label,
                props.isRequired && props.necessityIndicator === "label"
                  ? [
                      " ",
                      h("span", {
                        class: "spectrum-FieldLabel-necessity",
                      }, "(required)"),
                    ]
                  : null,
              ])
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
              onPointerdown: onTriggerPressStart,
              onPointerDown: onTriggerPressStart,
              onMousedown: onTriggerPressStart,
              onMouseDown: onTriggerPressStart,
              onTouchstart: onTriggerTouchStart,
              onTouchStart: onTriggerTouchStart,
              onTouchend: onTriggerTouchEnd,
              onTouchEnd: onTriggerTouchEnd,
              onKeydown: onTriggerKeyDown,
              onKeyDown: onTriggerKeyDown,
              onBlur: onTriggerBlur,
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
          collectionNodes.value.length > 0
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
                    renderDismissButton("dismiss-start"),
                    h(ListBoxBase as any, {
                      id: menuProps.id,
                      ariaLabel: menuProps["aria-label"],
                      ariaLabelledby: menuProps["aria-labelledby"],
                      autoFocus: (state.focusStrategy || true) as boolean | "first" | "last",
                      shouldUseVirtualFocus: menuProps.shouldUseVirtualFocus as boolean | undefined,
                      shouldSelectOnPressUp: menuProps.shouldSelectOnPressUp as boolean | undefined,
                      shouldFocusOnHover: menuProps.shouldFocusOnHover as boolean | undefined,
                      onKeyDown: onListboxKeyDown,
                      onKeydown: onListboxKeyDown,
                      onBlur: onListboxBlur,
                      onFocus: menuProps.onFocus as ((event: FocusEvent) => void) | undefined,
                      onFocusChange: menuProps.onFocusChange as ((isFocused: boolean) => void) | undefined,
                      onAction: (key: PickerKey) => {
                        (menuProps.onAction as ((key: PickerKey) => void) | undefined)?.(key);
                        state.close();
                        Promise.resolve().then(() => {
                          triggerRef.value?.focus();
                        });
                      },
                      maxHeight: props.maxHeight,
                      onLoadMore: props.onLoadMore,
                      isLoading: props.isLoading,
                      state,
                    }),
                    renderDismissButton("dismiss-end"),
                  ],
                }
              )
            : null,
          validationErrors.value.length > 0
            ? h(
                "div",
                {
                  ...errorMessageProps,
                  id: errorMessageId,
                  class: "spectrum-HelpText is-invalid",
                },
                validationErrors.value.join(", ")
              )
            : null,
          props.description
            ? h(
                "div",
                {
                  ...descriptionProps,
                  id: descriptionId,
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
