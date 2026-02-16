import { useProviderProps, useSlotProps, useStyleProps } from "@vue-spectrum/utils";

export interface SpectrumLabeledValueProps {
  UNSAFE_className?: string;
  UNSAFE_style?: Record<string, unknown>;
}

import { defineComponent, h } from "vue";

export const LabeledValue = defineComponent({
  name: "SpectrumLabeledValue",
  props: {
    UNSAFE_className: {
      type: String,
      required: false,
      default: undefined,
    },
    UNSAFE_style: {
      type: Object as () => Record<string, unknown> | undefined,
      required: false,
      default: undefined,
    },
  },
  setup(_, { attrs, slots }) {
    const merged = useProviderProps(attrs) as SpectrumLabeledValueProps & Record<string, unknown>;
    const mergedSlot = useSlotProps(merged, "labeledValue");
    const { styleProps } = useStyleProps(mergedSlot);

    return () =>
      h(
        "span",
        {
          ...styleProps.value,
          class: ["spectrum-LabeledValue", styleProps.value.class],
        },
        slots.default ? slots.default() : null
      );
  },
});
