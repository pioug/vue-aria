import { defineComponent, h } from "vue";

/**
 * Dialog content composition slot.
 */
export const Content = defineComponent({
  name: "SpectrumDialogContent",
  inheritAttrs: false,
  setup(_props, { attrs, slots }) {
    return () => {
      const attrsRecord = attrs as Record<string, unknown>;
      return h(
        "div",
        {
          ...attrsRecord,
          class: ["spectrum-Dialog-content", attrsRecord.class],
        },
        slots.default?.()
      );
    };
  },
});
