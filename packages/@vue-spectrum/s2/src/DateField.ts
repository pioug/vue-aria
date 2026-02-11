import clsx from "clsx";
import { computed, defineComponent, h, type PropType } from "vue";
import {
  DateField as SpectrumDateField,
  type SpectrumDateFieldProps,
} from "@vue-spectrum/datepicker";
import { useProviderProps } from "@vue-spectrum/provider";

export type DateFieldSize = "S" | "M" | "L" | "XL";

export interface S2DateFieldProps extends SpectrumDateFieldProps {
  size?: DateFieldSize | undefined;
}

export const DateField = defineComponent({
  name: "S2DateField",
  inheritAttrs: false,
  props: {
    size: {
      type: String as PropType<DateFieldSize | undefined>,
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
          "s2-DateField",
          props.size ? `s2-DateField--${props.size}` : null,
          attrsClassName,
          props.UNSAFE_className
        ),
        UNSAFE_style: {
          ...(attrsStyle ?? {}),
          ...(props.UNSAFE_style ?? {}),
        },
      });
    });

    return () => h(SpectrumDateField, forwardedProps.value as Record<string, unknown>);
  },
});
