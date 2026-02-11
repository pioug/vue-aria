import clsx from "clsx";
import { computed, defineComponent, h, type PropType } from "vue";
import { Form as SpectrumForm, type SpectrumFormProps } from "@vue-spectrum/form";
import { useProviderProps } from "@vue-spectrum/provider";

export interface S2FormProps extends SpectrumFormProps {}

export const Form = defineComponent({
  name: "S2Form",
  inheritAttrs: false,
  props: {
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
      const attrsStyle = attrsRecord.style as Record<string, string | number> | undefined;
      const merged = useProviderProps({
        ...attrsRecord,
        style: {
          ...(attrsStyle ?? {}),
          ...(props.UNSAFE_style ?? {}),
        },
      }) as Record<string, unknown>;

      return {
        ...merged,
        class: clsx("s2-Form", merged.class as any, props.UNSAFE_className),
      };
    });

    return () => h(SpectrumForm as any, forwardedProps.value as Record<string, unknown>, slots);
  },
});
