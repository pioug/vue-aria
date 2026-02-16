import { useButton } from "@vue-aria/button";
import { FocusRing } from "@vue-aria/focus";
import { useHover } from "@vue-aria/interactions";
import { mergeProps } from "@vue-aria/utils";
import { useProviderProps } from "@vue-spectrum/provider";
import { ClearSlots, SlotProvider, useSlotProps, useStyleProps } from "@vue-spectrum/utils";
import { defineComponent, h, onMounted, ref, watch } from "vue";
import type { SpectrumActionButtonProps } from "./types";
import { createRefObject, isTextOnlyNodes, mapReactEventProps } from "./utils";

/**
 * ActionButtons allow users to perform an action.
 * They are used for similar task-based options in a workflow.
 */
export const ActionButton = defineComponent({
  name: "SpectrumActionButton",
  inheritAttrs: false,
  props: {
    isQuiet: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    isDisabled: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    staticColor: {
      type: String as () => SpectrumActionButtonProps["staticColor"],
      required: false,
    },
    autoFocus: {
      type: Boolean,
      required: false,
    },
    holdAffordance: {
      type: Boolean,
      required: false,
    },
    hideButtonText: {
      type: Boolean,
      required: false,
    },
    elementType: {
      type: String as () => SpectrumActionButtonProps["elementType"],
      required: false,
    },
    type: {
      type: String as () => "button" | "submit" | "reset" | undefined,
      required: false,
      default: "button",
    },
    UNSAFE_className: {
      type: String,
      required: false,
    },
    UNSAFE_style: {
      type: Object,
      required: false,
    },
    onPress: {
      type: Function,
      required: false,
    },
    onPressStart: {
      type: Function,
      required: false,
    },
    onPressEnd: {
      type: Function,
      required: false,
    },
    onPressUp: {
      type: Function,
      required: false,
    },
    onPressChange: {
      type: Function,
      required: false,
    },
    onKeyDown: {
      type: Function,
      required: false,
    },
    onKeyUp: {
      type: Function,
      required: false,
    },
  },
  setup(props, { attrs, slots, expose }) {
    const domRef = ref<HTMLElement | null>(null);
    const domRefObject = createRefObject(domRef);
    const withProvider = useProviderProps({
      ...attrs,
      ...props,
    } as Record<string, unknown>) as SpectrumActionButtonProps & Record<string, unknown>;
    const merged = useSlotProps(withProvider, "actionButton") as SpectrumActionButtonProps & Record<string, unknown>;
    if (merged.elementType && merged.elementType !== "button") {
      merged.type = undefined;
    }
    const textProps = useSlotProps(
      {
        UNSAFE_className: "spectrum-ActionButton-label",
      },
      "text"
    );
    const { buttonProps: buttonPropsFromHook, isPressed } = useButton(merged, domRefObject);
    const buttonProps = {
      ...buttonPropsFromHook,
    };
    if ("disabled" in buttonProps) {
      delete buttonProps.disabled;
    }
    const { hoverProps, isHovered } = useHover({
      isDisabled: Boolean(merged.isDisabled),
    });
    const { styleProps } = useStyleProps(merged);
    const syncDisabledAttribute = (isDisabled: boolean | undefined) => {
      if (!domRef.value) {
        return;
      }

      if (isDisabled) {
        domRef.value.setAttribute("disabled", "disabled");
      } else {
        domRef.value.removeAttribute("disabled");
      }
    };

    const getIsDisabled = () => props.isDisabled ?? merged.isDisabled;
    watch(
      () => getIsDisabled(),
      syncDisabledAttribute
    );

    expose({
      focus: () => domRef.value?.focus(),
      UNSAFE_getDOMNode: () => domRef.value,
    });

    onMounted(() => {
      syncDisabledAttribute(getIsDisabled());
      if (merged.autoFocus) {
        domRef.value?.focus();
      }
    });

    return () => {
      const content = slots.default?.() ?? [];
      const isTextOnly = isTextOnlyNodes(content);

      return h(
        FocusRing,
        {
          focusRingClass: "focus-ring",
          autoFocus: Boolean(merged.autoFocus),
        },
        {
          default: () =>
            h(
              "button",
              {
                ...styleProps.value,
                ...mergeProps(buttonProps, hoverProps, mapReactEventProps(merged as Record<string, unknown>)),
                ref: domRef,
                class: [
                  "spectrum-ActionButton",
                  {
                    "spectrum-ActionButton--quiet": Boolean(merged.isQuiet),
                    "spectrum-ActionButton--staticColor": Boolean(merged.staticColor),
                    "spectrum-ActionButton--staticWhite": merged.staticColor === "white",
                    "spectrum-ActionButton--staticBlack": merged.staticColor === "black",
                    "is-active": isPressed,
                    "is-disabled": Boolean(merged.isDisabled),
                    "is-hovered": isHovered,
                  },
                  styleProps.value.class,
                ],
              },
              [
                merged.holdAffordance
                  ? h("span", { class: "spectrum-ActionButton-hold", "aria-hidden": "true" })
                  : null,
                h(ClearSlots, null, {
                  default: () =>
                    h(
                      SlotProvider,
                      {
                        slots: {
                          icon: {
                            size: "S",
                            UNSAFE_className: merged.hideButtonText
                              ? "spectrum-Icon spectrum-ActionGroup-itemIcon"
                              : "spectrum-Icon",
                          },
                          text: {
                            ...textProps,
                          },
                        },
                      },
                      {
                        default: () =>
                          isTextOnly
                            ? h(
                                "span",
                                { class: textProps.UNSAFE_className as string | undefined },
                                content
                              )
                            : content,
                      }
                    ),
                }),
              ]
            ),
        }
      );
    };
  },
});
