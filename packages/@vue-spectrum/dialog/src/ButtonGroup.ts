import { computed, defineComponent, h, inject } from "vue";
import { DialogFooterContext } from "./context";

/**
 * Dialog button-group composition slot.
 */
export const ButtonGroup = defineComponent({
  name: "SpectrumDialogButtonGroup",
  inheritAttrs: false,
  setup(_props, { attrs, slots }) {
    const inFooterRef = inject(DialogFooterContext, null);
    const inFooter = computed(() => inFooterRef?.value ?? false);

    return () => {
      const attrsRecord = attrs as Record<string, unknown>;
      return h(
        "div",
        {
          ...attrsRecord,
          class: [
            "spectrum-Dialog-buttonGroup",
            { "spectrum-Dialog-buttonGroup--noFooter": !inFooter.value },
            attrsRecord.class,
          ],
        },
        slots.default?.()
      );
    };
  },
});
