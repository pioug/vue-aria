import clsx from "clsx";
import { computed, defineComponent, h, type PropType } from "vue";
import {
  ButtonGroup as SpectrumButtonGroup,
  type SpectrumButtonGroupProps,
} from "@vue-spectrum/buttongroup";
import { useProviderProps } from "@vue-spectrum/provider";

export type ButtonGroupSize = "S" | "M" | "L" | "XL";

export interface S2ButtonGroupProps extends SpectrumButtonGroupProps {
  size?: ButtonGroupSize | undefined;
}

export const ButtonGroup = defineComponent({
  name: "S2ButtonGroup",
  inheritAttrs: false,
  props: {
    orientation: {
      type: String as PropType<"horizontal" | "vertical" | undefined>,
      default: undefined,
    },
    align: {
      type: String as PropType<"start" | "center" | "end" | undefined>,
      default: undefined,
    },
    isDisabled: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    size: {
      type: String as PropType<ButtonGroupSize | undefined>,
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
  setup(props, { attrs, slots }) {
    const forwardedProps = computed(() => {
      const merged = useProviderProps({
        ...(attrs as Record<string, unknown>),
        orientation: props.orientation,
        align: props.align,
        isDisabled: props.isDisabled,
        slot: props.slot,
        UNSAFE_className: props.UNSAFE_className,
        UNSAFE_style: props.UNSAFE_style,
      });

      return {
        ...merged,
        UNSAFE_className: clsx("s2-ButtonGroup", merged.UNSAFE_className),
        "data-s2-size": props.size,
      };
    });

    return () =>
      h(SpectrumButtonGroup, forwardedProps.value as Record<string, unknown>, {
        default: () => slots.default?.() ?? [],
      });
  },
});
