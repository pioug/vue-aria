import { defineComponent, h } from "vue";

/**
 * Dialog header composition slot.
 */
export const Header = defineComponent({
  name: "SpectrumDialogHeader",
  inheritAttrs: false,
  setup(_props, { attrs, slots }) {
    return () => {
      const attrsRecord = attrs as Record<string, unknown>;
      return h(
        "div",
        {
          ...attrsRecord,
          class: ["spectrum-Dialog-header", attrsRecord.class],
        },
        slots.default?.()
      );
    };
  },
});
