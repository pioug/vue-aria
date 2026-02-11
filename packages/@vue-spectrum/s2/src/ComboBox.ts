import clsx from "clsx";
import { computed, defineComponent, h, type PropType } from "vue";
import {
  ComboBox as SpectrumComboBox,
  type SpectrumComboBoxProps,
} from "@vue-spectrum/combobox";
import { useProviderProps } from "@vue-spectrum/provider";

export type ComboBoxSize = "S" | "M" | "L" | "XL";

export interface S2ComboBoxProps extends SpectrumComboBoxProps {
  size?: ComboBoxSize | undefined;
}

export const ComboBox = defineComponent({
  name: "S2ComboBox",
  inheritAttrs: false,
  props: {
    size: {
      type: String as PropType<ComboBoxSize | undefined>,
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
          "s2-ComboBox",
          props.size ? `s2-ComboBox--${props.size}` : null,
          attrsClassName,
          props.UNSAFE_className
        ),
        UNSAFE_style: {
          ...(attrsStyle ?? {}),
          ...(props.UNSAFE_style ?? {}),
        },
      });
    });

    return () => h(SpectrumComboBox, forwardedProps.value as Record<string, unknown>);
  },
});
