import {
  computed,
  defineComponent,
  h,
  nextTick,
  onMounted,
  ref,
  type PropType,
} from "vue";
import { useToggleButton } from "@vue-aria/button";
import { useHover } from "@vue-aria/interactions";
import { useToggleState } from "@vue-aria/toggle-state";
import type { PressEvent } from "@vue-aria/types";
import { filterDOMProps, mergeProps } from "@vue-aria/utils";
import { useProviderProps } from "@vue-spectrum/provider";
import {
  classNames,
  useStyleProps,
  type ClassValue,
} from "@vue-spectrum/utils";
import {
  normalizeChildren,
  wrapTextChildren,
  type BaseButtonProps,
} from "./shared";

export interface SpectrumToggleButtonProps extends BaseButtonProps {
  isQuiet?: boolean | undefined;
  isEmphasized?: boolean | undefined;
  staticColor?: "white" | "black" | undefined;
  isSelected?: boolean | undefined;
  defaultSelected?: boolean | undefined;
  onChange?: ((isSelected: boolean) => void) | undefined;
}

export const ToggleButton = defineComponent({
  name: "ToggleButton",
  inheritAttrs: false,
  props: {
    isQuiet: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    isEmphasized: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    staticColor: {
      type: String as PropType<"white" | "black" | undefined>,
      default: undefined,
    },
    isSelected: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    defaultSelected: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    onChange: {
      type: Function as PropType<((isSelected: boolean) => void) | undefined>,
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

    const toggleState = useToggleState(
      props.isSelected === undefined
        ? {
            defaultSelected: () => props.defaultSelected,
            onChange: (value) => props.onChange?.(value),
          }
        : {
            isSelected: () => props.isSelected,
            defaultSelected: () => props.defaultSelected,
            onChange: (value) => props.onChange?.(value),
          }
    );

    const toggleButton = useToggleButton(
      {
        isDisabled,
        onPressStart: (event) =>
          (props.onPressStart as ((value: PressEvent) => void) | undefined)?.(event),
        onPressEnd: (event) =>
          (props.onPressEnd as ((value: PressEvent) => void) | undefined)?.(event),
        onPress: (event) =>
          (props.onPress as ((value: PressEvent) => void) | undefined)?.(event),
      },
      toggleState
    );

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
      const resolvedProps = useProviderProps({
        ...(attrs as Record<string, unknown>),
        isQuiet: props.isQuiet,
        isEmphasized: props.isEmphasized,
        staticColor: props.staticColor,
        isSelected: props.isSelected,
        defaultSelected: props.defaultSelected,
        onChange: props.onChange,
        isDisabled: props.isDisabled,
        autoFocus: props.autoFocus,
        onPressStart: props.onPressStart,
        onPressEnd: props.onPressEnd,
        onPress: props.onPress,
        UNSAFE_className: props.UNSAFE_className,
        UNSAFE_style: props.UNSAFE_style,
      });

      const { styleProps } = useStyleProps(resolvedProps);
      const domProps = filterDOMProps(resolvedProps as Record<string, unknown>);
      const children = wrapTextChildren(normalizeChildren(slots.default?.()));

      return h(
        "button",
        mergeProps(domProps, styleProps, toggleButton.buttonProps.value, hoverProps, {
          ref: (value: unknown) => {
            elementRef.value = value as HTMLElement | null;
          },
          class: classNames(
            "spectrum-ActionButton",
            {
              "spectrum-ActionButton--quiet": Boolean(resolvedProps.isQuiet),
              "spectrum-ActionButton--emphasized": Boolean(resolvedProps.isEmphasized),
              "spectrum-ActionButton--staticColor": Boolean(resolvedProps.staticColor),
              "spectrum-ActionButton--staticWhite": resolvedProps.staticColor === "white",
              "spectrum-ActionButton--staticBlack": resolvedProps.staticColor === "black",
              "is-disabled": Boolean(resolvedProps.isDisabled),
              "is-active": toggleButton.isPressed.value,
              "is-hovered": isHovered.value,
              "is-selected": toggleButton.isSelected.value,
              "focus-ring": toggleButton.isFocusVisible.value,
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
        children
      );
    };
  },
});
