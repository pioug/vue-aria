import clsx from "clsx";
import { computed, defineComponent, h, type PropType } from "vue";
import {
  Link as SpectrumLink,
  type SpectrumLinkProps,
} from "@vue-spectrum/link";
import { useProviderProps } from "@vue-spectrum/provider";

export interface S2LinkProps extends SpectrumLinkProps {}

export const Link = defineComponent({
  name: "S2Link",
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
        UNSAFE_className: clsx("s2-Link", attrsClassName, props.UNSAFE_className),
        UNSAFE_style: {
          ...(attrsStyle ?? {}),
          ...(props.UNSAFE_style ?? {}),
        },
      });
    });

    return () =>
      h(SpectrumLink, forwardedProps.value as Record<string, unknown>, {
        default: () => slots.default?.() ?? [],
      });
  },
});
