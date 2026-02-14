import { defineComponent, h, provide, ref } from "vue";
import { DialogFooterContext } from "./context";

/**
 * Dialog footer composition slot.
 */
export const Footer = defineComponent({
  name: "SpectrumDialogFooter",
  inheritAttrs: false,
  setup(_props, { attrs, slots }) {
    provide(DialogFooterContext, ref(true));

    return () => {
      const attrsRecord = attrs as Record<string, unknown>;
      return h(
        "div",
        {
          ...attrsRecord,
          class: ["spectrum-Dialog-footer", attrsRecord.class],
        },
        slots.default?.()
      );
    };
  },
});
