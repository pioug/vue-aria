import clsx from "clsx";
import { computed, defineComponent, h, type PropType } from "vue";
import {
  NumberField as SpectrumNumberField,
  type SpectrumNumberFieldProps,
} from "@vue-spectrum/numberfield";
import { useProviderProps } from "@vue-spectrum/provider";

export type NumberFieldSize = "S" | "M" | "L" | "XL";

export interface S2NumberFieldProps extends SpectrumNumberFieldProps {
  size?: NumberFieldSize | undefined;
}

export const NumberField = defineComponent({
  name: "S2NumberField",
  inheritAttrs: false,
  props: {
    size: {
      type: String as PropType<NumberFieldSize | undefined>,
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
      const attrsRecord = attrs as Record<string, unknown>;
      const attrsClassName =
        typeof attrsRecord.UNSAFE_className === "string"
          ? (attrsRecord.UNSAFE_className as string)
          : undefined;
      const attrsStyle =
        (attrsRecord.UNSAFE_style as Record<string, string | number> | undefined) ??
        undefined;

      return useProviderProps({
        ...attrsRecord,
        UNSAFE_className: clsx(
          "s2-NumberField",
          props.size ? `s2-NumberField--${props.size}` : null,
          attrsClassName,
          props.UNSAFE_className
        ),
        UNSAFE_style: {
          ...(attrsStyle ?? {}),
          ...(props.UNSAFE_style ?? {}),
        },
      });
    });

    return () =>
      h(SpectrumNumberField, forwardedProps.value as Record<string, unknown>);
  },
});
