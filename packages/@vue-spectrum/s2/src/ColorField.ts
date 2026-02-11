import clsx from "clsx";
import { computed, defineComponent, h, type PropType } from "vue";
import {
  ColorField as SpectrumColorField,
  type SpectrumColorFieldProps,
} from "@vue-spectrum/color";
import { useProviderProps } from "@vue-spectrum/provider";

export type ColorFieldSize = "S" | "M" | "L" | "XL";

export interface S2ColorFieldProps extends SpectrumColorFieldProps {
  size?: ColorFieldSize | undefined;
}

export const ColorField = defineComponent({
  name: "S2ColorField",
  inheritAttrs: false,
  props: {
    id: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    value: {
      type: String as PropType<string | null | undefined>,
      default: undefined,
    },
    defaultValue: {
      type: String as PropType<string | null | undefined>,
      default: undefined,
    },
    label: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    description: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    errorMessage: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    placeholder: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    isDisabled: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    isReadOnly: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    isRequired: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    isInvalid: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    validationState: {
      type: String as PropType<"valid" | "invalid" | undefined>,
      default: undefined,
    },
    onChange: {
      type: Function as PropType<((value: string | null) => void) | undefined>,
      default: undefined,
    },
    size: {
      type: String as PropType<ColorFieldSize | undefined>,
      default: undefined,
    },
    ariaLabel: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    ariaLabelledby: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    ariaDescribedby: {
      type: String as PropType<string | undefined>,
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
  setup(props, { attrs }) {
    const forwardedProps = computed(() => {
      const merged = useProviderProps({
        ...(attrs as Record<string, unknown>),
        ...props,
        "aria-label": props.ariaLabel,
        "aria-labelledby": props.ariaLabelledby,
        "aria-describedby": props.ariaDescribedby,
      });

      return {
        ...merged,
        UNSAFE_className: clsx(
          "s2-ColorField",
          props.size ? `s2-ColorField--${props.size}` : null,
          merged.UNSAFE_className
        ),
      };
    });

    return () => h(SpectrumColorField, forwardedProps.value as Record<string, unknown>);
  },
});
