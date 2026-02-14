import { defineComponent, h } from "vue";

/**
 * Dialog button-group composition slot.
 */
export const ButtonGroup = defineComponent({
  name: "SpectrumDialogButtonGroup",
  inheritAttrs: false,
  setup(_props, { attrs, slots }) {
    return () => {
      const attrsRecord = attrs as Record<string, unknown>;
      return h(
        "div",
        {
          ...attrsRecord,
          class: ["spectrum-Dialog-buttonGroup", attrsRecord.class],
        },
        slots.default?.()
      );
    };
  },
});
