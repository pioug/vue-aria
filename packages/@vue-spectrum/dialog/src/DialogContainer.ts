import { computed, defineComponent, provide, type PropType } from "vue";
import { DialogContext } from "./context";
import type { DialogContextValue } from "./context";

/**
 * DialogContainer manages a single controlled dialog child.
 */
export const DialogContainer = defineComponent({
  name: "SpectrumDialogContainer",
  inheritAttrs: false,
  props: {
    type: {
      type: String as () => DialogContextValue["type"],
      required: false,
      default: "modal",
    },
    onDismiss: {
      type: Function as PropType<(() => void) | undefined>,
      required: true,
    },
    isDismissable: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    isKeyboardDismissDisabled: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
  },
  setup(props, { slots }) {
    const context = computed<DialogContextValue>(() => ({
      type: props.type,
      onClose: props.onDismiss,
      isDismissable: props.isDismissable,
    }));
    provide(DialogContext, context as any);

    return () => {
      const children = slots.default?.() ?? [];
      if (children.length > 1) {
        throw new Error("Only a single child can be passed to DialogContainer.");
      }

      return children[0] ?? null;
    };
  },
});
