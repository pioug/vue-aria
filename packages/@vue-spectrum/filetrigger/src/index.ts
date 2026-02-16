import { useProviderProps } from "@vue-spectrum/provider";
import { filterDOMProps } from "@vue-aria/utils";
import { useSlotProps, useStyleProps } from "@vue-spectrum/utils";
import { defineComponent, h } from "vue";

export interface SpectrumFileTriggerProps {
  UNSAFE_className?: string;
  UNSAFE_style?: Record<string, unknown>;
}

export const FileTrigger = defineComponent({
  name: "SpectrumFileTrigger",
  inheritAttrs: false,
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
  setup(props, { slots, attrs }) {
    const merged = useProviderProps({
      ...props,
      ...attrs,
    } as Record<string, unknown>) as SpectrumFileTriggerProps & Record<string, unknown>;
    const mergedSlot = useSlotProps(merged, "fileTrigger");
    const { styleProps } = useStyleProps(mergedSlot);
    const domProps = filterDOMProps(mergedSlot);

    return () =>
      h(
        "input",
        {
          ...domProps,
          ...styleProps.value,
          type: "file",
          class: ["spectrum-FileTrigger", styleProps.value.class],
        },
        slots.default ? slots.default() : null
      );
  },
});
