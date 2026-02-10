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
import { classNames, useStyleProps, type ClassValue } from "@vue-spectrum/utils";
import { normalizeChildren, type ButtonElementType } from "./shared";

export interface SpectrumClearButtonProps {
  elementType?: ButtonElementType | undefined;
  variant?: "overBackground" | undefined;
  inset?: boolean | undefined;
  preventFocus?: boolean | undefined;
  isDisabled?: boolean | undefined;
  autoFocus?: boolean | undefined;
  onPressStart?: ((event: PressEvent) => void) | undefined;
  onPressEnd?: ((event: PressEvent) => void) | undefined;
  onPress?: ((event: PressEvent) => void) | undefined;
  UNSAFE_className?: string | undefined;
  UNSAFE_style?: Record<string, string | number> | undefined;
}

export const ClearButton = defineComponent({
  name: "ClearButton",
  inheritAttrs: false,
  props: {
    elementType: {
      type: String as PropType<ButtonElementType | undefined>,
      default: undefined,
    },
    variant: {
      type: String as PropType<"overBackground" | undefined>,
      default: undefined,
    },
    inset: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    preventFocus: {
      type: Boolean as PropType<boolean | undefined>,
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
    const resolvedElementType = computed<ButtonElementType>(() =>
      props.preventFocus ? "div" : (props.elementType ?? "button")
    );

    const button = useButton({
      elementType: resolvedElementType,
      isDisabled,
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
      const resolvedProps = {
        ...(attrs as Record<string, unknown>),
        elementType: resolvedElementType.value,
        variant: props.variant,
        inset: props.inset,
        preventFocus: props.preventFocus,
        isDisabled: props.isDisabled,
        autoFocus: props.autoFocus,
        onPressStart: props.onPressStart,
        onPressEnd: props.onPressEnd,
        onPress: props.onPress,
        UNSAFE_className: props.UNSAFE_className,
        UNSAFE_style: props.UNSAFE_style,
      };

      const { styleProps } = useStyleProps(resolvedProps);
      const domProps = filterDOMProps(resolvedProps as Record<string, unknown>);
      const elementType = resolvedProps.elementType as ButtonElementType;
      const children = normalizeChildren(slots.default?.());
      const content =
        children.length > 0
          ? children
          : [h("span", { class: classNames("spectrum-Icon"), "aria-hidden": "true" }, "x")];

      const interactiveProps = {
        ...button.buttonProps.value,
      } as Record<string, unknown>;
      if (resolvedProps.preventFocus) {
        delete interactiveProps.tabindex;
      }

      return h(
        elementType,
        mergeProps(domProps, styleProps, interactiveProps, hoverProps, {
          ref: (value: unknown) => {
            elementRef.value = value as HTMLElement | null;
          },
          class: classNames(
            "spectrum-ClearButton",
            {
              [`spectrum-ClearButton--${String(resolvedProps.variant)}`]: Boolean(
                resolvedProps.variant
              ),
              "spectrum-ClearButton--inset": Boolean(resolvedProps.inset),
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
        content
      );
    };
  },
});
