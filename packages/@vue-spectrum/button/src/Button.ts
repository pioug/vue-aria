import { useButton } from "@vue-aria/button";
import { FocusRing } from "@vue-aria/focus";
import { useLocalizedStringFormatter } from "@vue-aria/i18n";
import { useFocus, useHover } from "@vue-aria/interactions";
import { isAppleDevice, isFirefox, mergeProps, useId } from "@vue-aria/utils";
import { useProviderProps } from "@vue-spectrum/provider";
import { SlotProvider, useHasChild, useSlotProps, useStyleProps } from "@vue-spectrum/utils";
import { computed, defineComponent, h, onMounted, onScopeDispose, ref, watch } from "vue";
import { intlMessages } from "./intlMessages";
import type { SpectrumButtonProps } from "./types";
import { createRefObject, isTextOnlyNodes, joinIds, mapReactEventProps } from "./utils";

function disablePendingProps(props: SpectrumButtonProps): SpectrumButtonProps {
  if (props.isPending) {
    props.onPress = undefined;
    props.onPressStart = undefined;
    props.onPressEnd = undefined;
    props.onPressChange = undefined;
    props.onPressUp = undefined;
    props.onClick = undefined;
    props.href = undefined;
  }

  return props;
}

/**
 * Buttons allow users to perform an action or navigate to another page.
 */
export const Button = defineComponent({
  name: "SpectrumButton",
  inheritAttrs: false,
  props: {
    elementType: {
      type: String as () => SpectrumButtonProps["elementType"],
      required: false,
    },
    variant: {
      type: String as () => SpectrumButtonProps["variant"],
      required: false,
    },
    style: {
      type: String as () => SpectrumButtonProps["style"],
      required: false,
    },
    staticColor: {
      type: String as () => SpectrumButtonProps["staticColor"],
      required: false,
    },
    isDisabled: {
      type: Boolean,
      required: false,
    },
    isPending: {
      type: Boolean,
      required: false,
    },
    autoFocus: {
      type: Boolean,
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
    onClick: {
      type: Function,
      required: false,
    },
  },
  setup(props, { attrs, slots, expose }) {
    const domRef = ref<HTMLElement | null>(null);
    const domRefObject = createRefObject(domRef);
    const mergedProvider = useProviderProps({
      ...attrs,
      ...props,
    } as Record<string, unknown>) as SpectrumButtonProps & Record<string, unknown>;
    const merged = disablePendingProps(
      useSlotProps(mergedProvider, "button") as SpectrumButtonProps & Record<string, unknown>
    );
    if (merged.elementType && merged.elementType !== "button") {
      merged.type = undefined;
    }

    const { buttonProps, isPressed } = useButton(merged, domRefObject);
    const { hoverProps, isHovered } = useHover({ isDisabled: Boolean(merged.isDisabled) });
    const stylePropsSource = { ...merged };
    delete stylePropsSource.style;
    const { styleProps } = useStyleProps(stylePropsSource);
    const stringFormatter = useLocalizedStringFormatter(intlMessages, "@vue-spectrum/button");
    const hasLabel = useHasChild(".spectrum-Button-label", domRef);
    const hasIcon = useHasChild(".spectrum-Icon", domRef);
    const isFocused = ref(false);
    const { focusProps } = useFocus({ onFocusChange: (value) => (isFocused.value = value) });
    const isProgressVisible = ref(false);
    const spinnerTimeout = ref<ReturnType<typeof setTimeout> | null>(null);
    const backupButtonId = useId();
    const iconId = useId();
    const textId = useId();
    const spinnerId = useId();
    const buttonId = computed(() => (buttonProps.id as string | undefined) ?? backupButtonId);
    const variant = computed(() => {
      if (merged.variant === "cta") {
        return "accent";
      }

      if (merged.variant === "overBackground") {
        return "primary";
      }

      return merged.variant;
    });
    const staticColor = computed(() => {
      if (merged.variant === "overBackground") {
        return "white";
      }
      return merged.staticColor;
    });
    const styleVariant = computed(() => {
      if (merged.style) {
        return merged.style;
      }

      return merged.variant === "accent" || merged.variant === "cta" ? "fill" : "outline";
    });

    watch(
      () => Boolean(props.isPending),
      (isPending) => {
        if (spinnerTimeout.value) {
          clearTimeout(spinnerTimeout.value);
          spinnerTimeout.value = null;
        }

        if (isPending) {
          spinnerTimeout.value = setTimeout(() => {
            isProgressVisible.value = true;
          }, 1000);
        } else {
          isProgressVisible.value = false;
        }
      },
      { immediate: true }
    );
    onScopeDispose(() => {
      if (spinnerTimeout.value) {
        clearTimeout(spinnerTimeout.value);
        spinnerTimeout.value = null;
      }
    });

    const pendingAriaLabel = computed(() => {
      const label = buttonProps["aria-label"] as string | undefined;
      return `${label ?? ""} ${stringFormatter.format("pending")}`.trim();
    });
    const pendingAriaLabelledby = computed(() => {
      const labelledby = buttonProps["aria-labelledby"] as string | undefined;
      const hasAriaLabel = Boolean(buttonProps["aria-label"] || labelledby);
      if (hasAriaLabel) {
        return labelledby?.replace(buttonId.value, spinnerId) ?? spinnerId;
      }

      return joinIds(hasIcon.value && iconId, hasLabel.value && textId, spinnerId);
    });
    const ariaLive = computed<"off" | "polite" | "assertive">(() => {
      if (isAppleDevice() && (!(buttonProps["aria-label"] || buttonProps["aria-labelledby"]) || isFirefox())) {
        return "off";
      }

      return "polite";
    });

    expose({
      focus: () => domRef.value?.focus(),
      UNSAFE_getDOMNode: () => domRef.value,
    });
    onMounted(() => {
      if (merged.autoFocus) {
        domRef.value?.focus();
      }
    });

    return () => {
      const content = slots.default?.() ?? [];
      const isTextOnly = isTextOnlyNodes(content);
      const isPending = Boolean(props.isPending);
      const Element = (merged.elementType ?? "button") as string;
      const pendingProps = isPending
        ? {
            onClick: (event: MouseEvent) => {
              if (event.currentTarget instanceof HTMLButtonElement) {
                event.preventDefault();
              }
            },
          }
        : {
            onClick: () => {},
          };

      return h(
        FocusRing,
        {
          focusRingClass: "focus-ring",
          autoFocus: Boolean(merged.autoFocus),
        },
        {
          default: () =>
            h(
              Element,
              {
                ...styleProps.value,
                ...mergeProps(
                  buttonProps,
                  hoverProps,
                  focusProps,
                  pendingProps,
                  mapReactEventProps(merged as Record<string, unknown>)
                ),
                id: buttonId.value,
                ref: domRef,
                "data-variant": variant.value,
                "data-style": styleVariant.value,
                "data-static-color": staticColor.value || undefined,
                "aria-disabled": isPending ? "true" : undefined,
                "aria-label": isPending ? pendingAriaLabel.value : buttonProps["aria-label"],
                "aria-labelledby": isPending ? pendingAriaLabelledby.value : buttonProps["aria-labelledby"],
                class: [
                  "spectrum-Button",
                  {
                    "spectrum-Button--iconOnly": hasIcon.value && !hasLabel.value,
                    "is-disabled": Boolean(merged.isDisabled) || isProgressVisible.value,
                    "is-active": isPressed,
                    "is-hovered": isHovered,
                    "spectrum-Button--pending": isProgressVisible.value,
                  },
                  styleProps.value.class,
                ],
              },
              [
                h(
                  SlotProvider,
                  {
                    slots: {
                      icon: {
                        id: iconId,
                        size: "S",
                        UNSAFE_className: "spectrum-Icon",
                      },
                      text: {
                        id: textId,
                        UNSAFE_className: "spectrum-Button-label",
                      },
                    },
                  },
                  {
                    default: () =>
                      isTextOnly
                        ? h("span", { id: textId, class: "spectrum-Button-label" }, content)
                        : content,
                  }
                ),
                isPending
                  ? h(
                      "div",
                      {
                        "aria-hidden": "true",
                        style: { visibility: isProgressVisible.value ? "visible" : "hidden" },
                        class: "spectrum-Button-circleLoader",
                      },
                      [
                        h("div", {
                          class: "spectrum-ProgressCircle",
                          role: "img",
                          "aria-label": pendingAriaLabel.value,
                        }),
                      ]
                    )
                  : null,
                isPending
                  ? h(
                      "div",
                      {
                        "aria-live": isFocused.value ? ariaLive.value : "off",
                      },
                      [
                        isProgressVisible.value
                          ? h("div", {
                              role: "img",
                              "aria-labelledby": pendingAriaLabelledby.value,
                            })
                          : null,
                      ]
                    )
                  : null,
                isPending
                  ? h("div", {
                      id: spinnerId,
                      role: "img",
                      "aria-label": pendingAriaLabel.value,
                    })
                  : null,
              ]
            ),
        }
      );
    };
  },
});
