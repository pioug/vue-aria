import clsx from "clsx";
import { computed, defineComponent, h, type PropType } from "vue";
import {
  Badge as SpectrumBadge,
  type SpectrumBadgeProps,
} from "@vue-spectrum/badge";
import { useProviderProps } from "@vue-spectrum/provider";

export interface S2BadgeProps extends SpectrumBadgeProps {}

export const Badge = defineComponent({
  name: "S2Badge",
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
        UNSAFE_className: clsx("s2-Badge", attrsClassName, props.UNSAFE_className),
        UNSAFE_style: {
          ...(attrsStyle ?? {}),
          ...(props.UNSAFE_style ?? {}),
        },
      });
    });

    return () =>
      h(SpectrumBadge, forwardedProps.value as Record<string, unknown>, {
        default: () => slots.default?.() ?? [],
      });
  },
});
