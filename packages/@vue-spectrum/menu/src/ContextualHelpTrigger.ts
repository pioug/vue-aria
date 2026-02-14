import { defineComponent, h } from "vue";
import { SubmenuTrigger } from "./SubmenuTrigger";

/**
 * ContextualHelpTrigger wraps a menu item and contextual overlay content.
 */
export const ContextualHelpTrigger = defineComponent({
  name: "SpectrumContextualHelpTrigger",
  props: {
    isUnavailable: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  setup(props, { slots }) {
    return () => {
      const children = slots.default?.() ?? [];
      if (children.length < 2) {
        return null;
      }

      if (!props.isUnavailable) {
        return children[0] ?? null;
      }

      return h(
        SubmenuTrigger as any,
        {
          type: "dialog",
          isUnavailable: props.isUnavailable,
        },
        {
          default: () => [children[0], children[1]],
        }
      );
    };
  },
});

(ContextualHelpTrigger as any).__spectrumMenuNodeType = "contextualHelpTrigger";
