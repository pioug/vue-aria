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
import { classNames, useStyleProps, type ClassValue } from "@vue-spectrum/utils";
import {
  normalizeChildren,
  type BaseButtonProps,
  type ButtonElementType,
} from "./shared";

export interface SpectrumLogicButtonProps extends BaseButtonProps {
  variant?: "and" | "or" | undefined;
}

export const LogicButton = defineComponent({
  name: "LogicButton",
  inheritAttrs: false,
  props: {
    elementType: {
      type: String as PropType<ButtonElementType | undefined>,
      default: undefined,
    },
    variant: {
      type: String as PropType<"and" | "or" | undefined>,
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
      onPressChange: (value) =>
        (props.onPressChange as ((next: boolean) => void) | undefined)?.(value),
      onPressUp: (event) =>
        (props.onPressUp as ((value: PressEvent) => void) | undefined)?.(event),
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
      focus: () => {
        elementRef.value?.focus();
      },
    });

    return () => {
      const resolvedProps = useProviderProps({
        ...(attrs as Record<string, unknown>),
        elementType: props.elementType,
        variant: props.variant,
        isDisabled: props.isDisabled,
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
        UNSAFE_className: props.UNSAFE_className,
        UNSAFE_style: props.UNSAFE_style,
      });

      const { styleProps } = useStyleProps(resolvedProps);
      const domProps = filterDOMProps(resolvedProps as Record<string, unknown>);
      const children = normalizeChildren(slots.default?.());

      return h(
        "button",
        mergeProps(domProps, styleProps, button.buttonProps.value, hoverProps, {
          ref: (value: unknown) => {
            elementRef.value = value as HTMLElement | null;
          },
          class: classNames(
            "spectrum-LogicButton",
            {
              [`spectrum-LogicButton--${String(resolvedProps.variant)}`]: Boolean(
                resolvedProps.variant
              ),
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
        }),
        [
          h(
            "span",
            {
              class: classNames("spectrum-Button-label"),
            },
            children
          ),
        ]
      );
    };
  },
});
