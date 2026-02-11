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
import {
  classNames,
  SlotProvider,
  useSlotProps,
  useStyleProps,
  type ClassValue,
} from "@vue-spectrum/utils";
import { normalizeChildren } from "./shared";

export interface SpectrumFieldButtonProps {
  isQuiet?: boolean | undefined;
  isActive?: boolean | undefined;
  validationState?: "valid" | "invalid" | undefined;
  isInvalid?: boolean | undefined;
  focusRingClass?: string | undefined;
  isDisabled?: boolean | undefined;
  autoFocus?: boolean | undefined;
  onPressStart?: ((event: PressEvent) => void) | undefined;
  onPressEnd?: ((event: PressEvent) => void) | undefined;
  onPressChange?: ((isPressed: boolean) => void) | undefined;
  onPressUp?: ((event: PressEvent) => void) | undefined;
  onPress?: ((event: PressEvent) => void) | undefined;
  slot?: string | undefined;
  UNSAFE_className?: string | undefined;
  UNSAFE_style?: Record<string, string | number> | undefined;
}

export const FieldButton = defineComponent({
  name: "FieldButton",
  inheritAttrs: false,
  props: {
    isQuiet: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    isActive: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    validationState: {
      type: String as PropType<"valid" | "invalid" | undefined>,
      default: undefined,
    },
    isInvalid: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    focusRingClass: {
      type: String as PropType<string | undefined>,
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
    const isDisabled = computed(() => Boolean(props.isDisabled));

    const button = useButton({
      isDisabled,
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

    const { hoverProps, isHovered } = useHover({ isDisabled });

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
          isQuiet: props.isQuiet,
          isActive: props.isActive,
          validationState: props.validationState,
          isInvalid: props.isInvalid,
          focusRingClass: props.focusRingClass,
          isDisabled: props.isDisabled,
          autoFocus: props.autoFocus,
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

      const { styleProps } = useStyleProps(slotProps);
      const domPropsInput = slotProps as Record<string, unknown>;
      const domProps = filterDOMProps(domPropsInput);
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
      const children = normalizeChildren(slots.default?.());

      return h(
        "button",
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
            "spectrum-FieldButton",
            {
              "spectrum-FieldButton--quiet": Boolean(slotProps.isQuiet),
              "is-active": Boolean(slotProps.isActive) || button.isPressed.value,
              "is-disabled": Boolean(slotProps.isDisabled),
              "spectrum-FieldButton--invalid":
                Boolean(slotProps.isInvalid) || slotProps.validationState === "invalid",
              "is-hovered": isHovered.value,
              "focus-ring": button.isFocusVisible.value,
              [String(slotProps.focusRingClass)]:
                Boolean(slotProps.focusRingClass) && button.isFocusVisible.value,
            },
            styleProps.class as ClassValue | undefined,
            domProps.class as ClassValue | undefined,
            slotProps.UNSAFE_className as ClassValue | undefined
          ),
          style: {
            ...(styleProps.style ?? {}),
            ...((slotProps.UNSAFE_style as Record<string, string | number> | undefined) ??
              {}),
          },
          }
        ),
        [
          h(
            SlotProvider,
            {
              slots: {
                icon: {
                  size: "S",
                  UNSAFE_className: classNames("spectrum-Icon"),
                },
              },
            },
            {
              default: () => children,
            }
          ),
        ]
      );
    };
  },
});
