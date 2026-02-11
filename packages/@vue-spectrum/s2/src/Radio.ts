import clsx from "clsx";
import { computed, defineComponent, h, type PropType } from "vue";
import {
  Radio as SpectrumRadio,
  type SpectrumRadioProps,
} from "@vue-spectrum/radio";
import { useProviderProps } from "@vue-spectrum/provider";

export interface S2RadioProps extends SpectrumRadioProps {}

export const Radio = defineComponent({
  name: "S2Radio",
  inheritAttrs: false,
  props: {
    value: {
      type: String as PropType<string>,
      required: true,
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
        value: props.value,
        UNSAFE_className: clsx("s2-Radio", attrsClassName, props.UNSAFE_className),
        UNSAFE_style: {
          ...(attrsStyle ?? {}),
          ...(props.UNSAFE_style ?? {}),
        },
      });
    });

    return () =>
      h(SpectrumRadio as any, forwardedProps.value as Record<string, unknown>, {
        default: () => slots.default?.() ?? [],
      });
  },
});
