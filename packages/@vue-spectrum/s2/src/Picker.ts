import clsx from "clsx";
import { computed, defineComponent, h, type PropType } from "vue";
import {
  Picker as SpectrumPicker,
  PickerItem as SpectrumPickerItem,
  PickerSection as SpectrumPickerSection,
  type SpectrumPickerItemProps,
  type SpectrumPickerProps,
  type SpectrumPickerSectionProps,
} from "@vue-spectrum/picker";
import { useProviderProps } from "@vue-spectrum/provider";

export type PickerSize = "S" | "M" | "L" | "XL";

export interface S2PickerProps extends SpectrumPickerProps {
  size?: PickerSize | undefined;
}

export interface S2PickerItemProps extends SpectrumPickerItemProps {}

export interface S2PickerSectionProps extends SpectrumPickerSectionProps {}

export const Picker = defineComponent({
  name: "S2Picker",
  inheritAttrs: false,
  props: {
    size: {
      type: String as PropType<PickerSize | undefined>,
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
          "s2-Picker",
          props.size ? `s2-Picker--${props.size}` : null,
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
      h(SpectrumPicker, forwardedProps.value as Record<string, unknown>, slots);
  },
});

export const PickerItem = SpectrumPickerItem;
export const PickerSection = SpectrumPickerSection;

export type {
  PickerKey as S2PickerKey,
  SpectrumPickerItemData as S2PickerItemData,
} from "@vue-spectrum/picker";
