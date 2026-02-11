import clsx from "clsx";
import { computed, defineComponent, h, type PropType } from "vue";
import { DropZone as SpectrumDropZone, type SpectrumDropZoneProps } from "@vue-spectrum/dropzone";
import { useProviderProps } from "@vue-spectrum/provider";

export interface S2DropZoneProps extends SpectrumDropZoneProps {}

export const DropZone = defineComponent({
  name: "S2DropZone",
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
        UNSAFE_className: clsx("s2-DropZone", attrsClassName, props.UNSAFE_className),
        UNSAFE_style: {
          ...(attrsStyle ?? {}),
          ...(props.UNSAFE_style ?? {}),
        },
      });
    });

    return () =>
      h(SpectrumDropZone as any, forwardedProps.value as Record<string, unknown>, slots);
  },
});
