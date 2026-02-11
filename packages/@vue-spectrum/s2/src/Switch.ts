import clsx from "clsx";
import { computed, defineComponent, h, type PropType } from "vue";
import {
  Switch as SpectrumSwitch,
  type SpectrumSwitchProps,
} from "@vue-spectrum/switch";
import { useProviderProps } from "@vue-spectrum/provider";

export type SwitchSize = "S" | "M" | "L" | "XL";

export interface S2SwitchProps extends SpectrumSwitchProps {
  size?: SwitchSize | undefined;
}

export const Switch = defineComponent({
  name: "S2Switch",
  inheritAttrs: false,
  props: {
    size: {
      type: String as PropType<SwitchSize | undefined>,
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
          "s2-Switch",
          props.size ? `s2-Switch--${props.size}` : null,
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
      h(SpectrumSwitch, forwardedProps.value as Record<string, unknown>, {
        default: () => slots.default?.() ?? [],
      });
  },
});
