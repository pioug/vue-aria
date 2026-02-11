import clsx from "clsx";
import { computed, defineComponent, h, type PropType } from "vue";
import {
  ActionBar as SpectrumActionBar,
  type SpectrumActionBarProps,
} from "@vue-spectrum/actionbar";
import { useProviderProps } from "@vue-spectrum/provider";

export interface S2ActionBarProps extends SpectrumActionBarProps {}

export const ActionBar = defineComponent({
  name: "S2ActionBar",
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
      const attrsClassName =
        typeof attrsRecord.UNSAFE_className === "string"
          ? (attrsRecord.UNSAFE_className as string)
          : undefined;
      const attrsStyle =
        (attrsRecord.UNSAFE_style as Record<string, string | number> | undefined) ??
        undefined;

      return useProviderProps({
        ...attrsRecord,
        UNSAFE_className: clsx("s2-ActionBar", attrsClassName, props.UNSAFE_className),
        UNSAFE_style: {
          ...(attrsStyle ?? {}),
          ...(props.UNSAFE_style ?? {}),
        },
      });
    });

    return () => h(SpectrumActionBar, forwardedProps.value as Record<string, unknown>, slots);
  },
});
