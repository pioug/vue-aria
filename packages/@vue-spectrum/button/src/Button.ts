import {
  computed,
  defineComponent,
  h,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type PropType,
} from "vue";
import { useButton } from "@vue-aria/button";
import { useLocalizedStringFormatter } from "@vue-aria/i18n";
import { useHover } from "@vue-aria/interactions";
import type { PressEvent } from "@vue-aria/types";
import { filterDOMProps, mergeProps } from "@vue-aria/utils";
import { useProviderProps } from "@vue-spectrum/provider";
import { ProgressCircle } from "@vue-spectrum/progress";
import {
  classNames,
  SlotProvider,
  useHasChild,
  useSlotProps,
  useStyleProps,
  type ClassValue,
} from "@vue-spectrum/utils";
import {
  normalizeChildren,
  wrapTextChildren,
  type BaseButtonProps,
  type ButtonElementType,
} from "./shared";
import { buttonMessages } from "./intlMessages";

const SPINNER_VISIBILITY_DELAY_MS = 1000;
let nextButtonId = 0;

function createButtonId(prefix: string): string {
  nextButtonId += 1;
  return `${prefix}-${nextButtonId}`;
}

export type ButtonVariant =
  | "accent"
  | "cta"
  | "overBackground"
  | "primary"
  | "secondary"
  | "negative";

export type ButtonStyle = "fill" | "outline";

export interface SpectrumButtonProps extends BaseButtonProps {
  variant?: ButtonVariant | undefined;
  style?: ButtonStyle | undefined;
  staticColor?: "white" | "black" | undefined;
  isPending?: boolean | undefined;
  slot?: string | undefined;
}

export const Button = defineComponent({
  name: "Button",
  inheritAttrs: false,
  props: {
    elementType: {
      type: String as PropType<ButtonElementType | undefined>,
      default: undefined,
    },
    variant: {
      type: String as PropType<ButtonVariant | undefined>,
      default: undefined,
    },
    style: {
      type: String as PropType<ButtonStyle | undefined>,
      default: undefined,
    },
    staticColor: {
      type: String as PropType<"white" | "black" | undefined>,
      default: undefined,
    },
    isDisabled: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    isPending: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    autoFocus: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    href: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    target: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    rel: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    type: {
      type: String as PropType<"button" | "submit" | "reset" | undefined>,
      default: undefined,
    },
    onPressStart: {
      type: Function as PropType<((event: PressEvent) => void) | undefined>,
      default: undefined,
    },
    onPressEnd: {
      type: Function as PropType<((event: PressEvent) => void) | undefined>,
      default: undefined,
    },
    onPressChange: {
      type: Function as PropType<((isPressed: boolean) => void) | undefined>,
      default: undefined,
    },
    onPressUp: {
      type: Function as PropType<((event: PressEvent) => void) | undefined>,
      default: undefined,
    },
    onPress: {
      type: Function as PropType<((event: PressEvent) => void) | undefined>,
      default: undefined,
    },
    slot: {
      type: String as PropType<string | undefined>,
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
  setup(props, { attrs, slots, expose }) {
    const elementRef = ref<HTMLElement | null>(null);
    const stringFormatter = useLocalizedStringFormatter(buttonMessages);
    const isDisabled = computed(() => Boolean(props.isDisabled));
    const isPending = computed(() => Boolean(props.isPending));
    const isProgressVisible = ref(false);
    let pendingTimeout: ReturnType<typeof setTimeout> | null = null;

    const iconId = createButtonId("v-spectrum-button-icon");
    const textId = createButtonId("v-spectrum-button-text");
    const spinnerId = createButtonId("v-spectrum-button-spinner");

    const hasLabel = useHasChild(".spectrum-Button-label", elementRef);
    const hasIcon = useHasChild(".spectrum-Icon", elementRef);

    const clearPendingTimeout = () => {
      if (pendingTimeout !== null) {
        clearTimeout(pendingTimeout);
        pendingTimeout = null;
      }
    };

    watch(
      isPending,
      (pending) => {
        clearPendingTimeout();

        if (pending) {
          pendingTimeout = setTimeout(() => {
            isProgressVisible.value = true;
            pendingTimeout = null;
          }, SPINNER_VISIBILITY_DELAY_MS);
          return;
        }

        isProgressVisible.value = false;
      },
      { immediate: true }
    );

    onBeforeUnmount(() => {
      clearPendingTimeout();
    });

    const button = useButton({
      elementType: () => (props.elementType ?? "button") as ButtonElementType,
      isDisabled,
      href: () => (isPending.value ? undefined : props.href),
      target: () => props.target,
      rel: () => props.rel,
      type: () => props.type ?? "button",
      onPressStart: (event) => {
        if (isPending.value) {
          return;
        }

        (props.onPressStart as ((value: PressEvent) => void) | undefined)?.(event);
      },
      onPressEnd: (event) => {
        if (isPending.value) {
          return;
        }

        (props.onPressEnd as ((value: PressEvent) => void) | undefined)?.(event);
      },
      onPressChange: (value) => {
        if (isPending.value) {
          return;
        }

        (props.onPressChange as ((next: boolean) => void) | undefined)?.(value);
      },
      onPressUp: (event) => {
        if (isPending.value) {
          return;
        }

        (props.onPressUp as ((value: PressEvent) => void) | undefined)?.(event);
      },
      onPress: (event) => {
        if (isPending.value) {
          return;
        }

        (props.onPress as ((value: PressEvent) => void) | undefined)?.(event);
      },
    });

    const { hoverProps, isHovered } = useHover({
      isDisabled: () => isDisabled.value || isPending.value,
    });

    onMounted(() => {
      if (!props.autoFocus) {
        return;
      }

      void nextTick(() => {
        elementRef.value?.focus();
      });
    });

    expose({
      UNSAFE_getDOMNode: () => elementRef.value,
      focus: () => {
        elementRef.value?.focus();
      },
    });

    return () => {
      const slotProps = useSlotProps(
        {
          ...(attrs as Record<string, unknown>),
          elementType: props.elementType,
          variant: props.variant,
          style: props.style,
          staticColor: props.staticColor,
          isDisabled: props.isDisabled,
          isPending: props.isPending,
          autoFocus: props.autoFocus,
          href: props.href,
          target: props.target,
          rel: props.rel,
          type: props.type,
          onPressStart: props.onPressStart,
          onPressEnd: props.onPressEnd,
          onPressChange: props.onPressChange,
          onPressUp: props.onPressUp,
          onPress: props.onPress,
          slot: props.slot,
          UNSAFE_className: props.UNSAFE_className,
          UNSAFE_style: props.UNSAFE_style,
        } as Record<string, unknown> & { id?: string; slot?: string },
        "button"
      );

      const resolvedProps = useProviderProps(slotProps);

      let variant = resolvedProps.variant as ButtonVariant | undefined;
      let staticColor = resolvedProps.staticColor as "white" | "black" | undefined;
      if (variant === "cta") {
        variant = "accent";
      } else if (variant === "overBackground") {
        variant = "primary";
        staticColor = "white";
      }

      const style =
        (resolvedProps.style as ButtonStyle | undefined) ??
        (variant === "accent" ? "fill" : "outline");
      const elementType =
        (resolvedProps.elementType as ButtonElementType | undefined) ?? "button";
      const pending = Boolean(resolvedProps.isPending);

      const domPropsInput = {
        ...(resolvedProps as Record<string, unknown>),
      };
      if (pending) {
        delete domPropsInput.href;
      }

      const domEventProps: Record<string, unknown> = {};
      const eventPropPairs: Array<[string, string]> = [
        ["onKeydown", "onKeyDown"],
        ["onKeyup", "onKeyUp"],
        ["onFocus", "onFocus"],
        ["onBlur", "onBlur"],
        ["onClick", "onClick"],
      ];
      for (const [primaryName, alternateName] of eventPropPairs) {
        const primaryValue = domPropsInput[primaryName];
        const alternateValue = domPropsInput[alternateName];
        if (primaryValue !== undefined) {
          domEventProps[primaryName] = primaryValue;
          continue;
        }
        if (alternateValue !== undefined) {
          domEventProps[primaryName] = alternateValue;
        }
      }

      const { styleProps } = useStyleProps(resolvedProps);
      const domProps = filterDOMProps(domPropsInput);
      const children = wrapTextChildren(normalizeChildren(slots.default?.()));

      const ariaLabel = domProps["aria-label"] as string | undefined;
      const ariaLabelledby = domProps["aria-labelledby"] as string | undefined;
      const hasAriaLabel = ariaLabel !== undefined || ariaLabelledby !== undefined;
      const pendingAriaLiveLabel = `${ariaLabel ?? ""} ${stringFormatter.value.format("pending")}`.trim();
      const pendingAriaLiveLabelledby =
        hasAriaLabel
          ? spinnerId
          : `${hasIcon.value ? iconId : ""} ${hasLabel.value ? textId : ""} ${spinnerId}`.trim();

      return h(
        elementType,
        mergeProps(
          domProps,
          styleProps,
          button.buttonProps.value,
          hoverProps,
          domEventProps,
          {
          ref: (value: unknown) => {
            elementRef.value = value as HTMLElement | null;
          },
          class: classNames(
            "spectrum-Button",
            {
              "spectrum-Button--iconOnly": hasIcon.value && !hasLabel.value,
              "spectrum-Button--pending": isProgressVisible.value,
              "is-disabled": Boolean(resolvedProps.isDisabled) || isProgressVisible.value,
              "is-active": button.isPressed.value,
              "is-hovered": isHovered.value,
              "focus-ring": button.isFocusVisible.value,
            },
            styleProps.class as ClassValue | undefined,
            domProps.class as ClassValue | undefined,
            resolvedProps.UNSAFE_className as ClassValue | undefined
          ),
          style: {
            ...(styleProps.style ?? {}),
            ...((resolvedProps.UNSAFE_style as Record<string, string | number> | undefined) ??
              {}),
          },
          "data-variant": variant,
          "data-style": style,
          "data-static-color": staticColor,
          "aria-disabled": pending ? "true" : undefined,
          "aria-label": pending ? pendingAriaLiveLabel : domProps["aria-label"],
          "aria-labelledby": pending
            ? pendingAriaLiveLabelledby
            : domProps["aria-labelledby"],
          onClick: pending
            ? (event: MouseEvent) => {
                if (event.currentTarget instanceof HTMLButtonElement) {
                  event.preventDefault();
                }
              }
            : undefined,
          }
        ),
        [
          h(
            SlotProvider,
            {
              slots: {
                icon: {
                  id: iconId,
                  size: "S",
                  UNSAFE_className: classNames("spectrum-Icon"),
                },
                text: {
                  id: textId,
                  UNSAFE_className: classNames("spectrum-Button-label"),
                },
              },
            },
            {
              default: () => children,
            }
          ),
          pending
            ? h(
                "div",
                {
                  "aria-hidden": "true",
                  style: { visibility: isProgressVisible.value ? "visible" : "hidden" },
                  class: classNames("spectrum-Button-circleLoader"),
                },
                [
                  h(ProgressCircle, {
                    ariaLabel: pendingAriaLiveLabel,
                    isIndeterminate: true,
                    size: "S",
                    staticColor,
                  }),
                ]
              )
            : null,
          pending
            ? h(
                "div",
                {
                  "aria-live": button.isFocused.value ? "polite" : "off",
                },
                isProgressVisible.value
                  ? [
                      h("div", {
                        role: "img",
                        "aria-labelledby": pendingAriaLiveLabelledby,
                      }),
                    ]
                  : []
              )
            : null,
          pending
            ? h("div", {
                id: spinnerId,
                role: "img",
                "aria-label": pendingAriaLiveLabel,
              })
            : null,
        ]
      );
    };
  },
});
