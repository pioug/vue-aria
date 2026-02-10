import {
  computed,
  defineComponent,
  h,
  nextTick,
  onMounted,
  ref,
  type PropType,
} from "vue";
import { useButton } from "@vue-aria/button";
import { useHover } from "@vue-aria/interactions";
import type { PressEvent } from "@vue-aria/types";
import { filterDOMProps, mergeProps } from "@vue-aria/utils";
import { useProviderProps } from "@vue-spectrum/provider";
import {
  classNames,
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
    const isDisabled = computed(() => Boolean(props.isDisabled));

    const button = useButton({
      elementType: () => (props.elementType ?? "button") as ButtonElementType,
      isDisabled,
      href: () => props.href,
      target: () => props.target,
      rel: () => props.rel,
      type: () => props.type ?? "button",
      onPressStart: (event) =>
        (props.onPressStart as ((value: PressEvent) => void) | undefined)?.(event),
      onPressEnd: (event) =>
        (props.onPressEnd as ((value: PressEvent) => void) | undefined)?.(event),
      onPress: (event) =>
        (props.onPress as ((value: PressEvent) => void) | undefined)?.(event),
    });

    const { hoverProps, isHovered } = useHover({
      isDisabled,
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
          autoFocus: props.autoFocus,
          href: props.href,
          target: props.target,
          rel: props.rel,
          type: props.type,
          onPressStart: props.onPressStart,
          onPressEnd: props.onPressEnd,
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

      const { styleProps } = useStyleProps(resolvedProps);
      const domProps = filterDOMProps(resolvedProps as Record<string, unknown>);
      const children = wrapTextChildren(normalizeChildren(slots.default?.()));

      return h(
        elementType,
        mergeProps(domProps, styleProps, button.buttonProps.value, hoverProps, {
          ref: (value: unknown) => {
            elementRef.value = value as HTMLElement | null;
          },
          class: classNames(
            "spectrum-Button",
            {
              "is-disabled": Boolean(resolvedProps.isDisabled),
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
        }),
        children
      );
    };
  },
});
