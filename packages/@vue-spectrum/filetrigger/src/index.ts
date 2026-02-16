import { defineComponent, h } from "vue";

export interface SpectrumFileTriggerProps {}

export const FileTrigger = defineComponent({
  name: "SpectrumFileTrigger",
  setup(_, { slots, attrs }) {
    return () =>
      h(
        "input",
        {
          ...attrs,
          class: ["spectrum-FileTrigger", attrs.class],
          type: "file",
        },
        slots.default ? slots.default() : null
      );
  },
});
