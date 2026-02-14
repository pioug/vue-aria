import { computed, defineComponent, h, inject } from "vue";
import { DialogTitlePropsContext } from "./context";

/**
 * Dialog heading slot component that wires label ids for aria-labelledby.
 */
export const Heading = defineComponent({
  name: "SpectrumDialogHeading",
  inheritAttrs: false,
  props: {
    elementType: {
      type: String,
      required: false,
      default: "h2",
    },
  },
  setup(props, { attrs, slots }) {
    const titlePropsRef = inject(DialogTitlePropsContext, null);
    const titleProps = computed(() => titlePropsRef?.value ?? {});

    return () => {
      const attrsRecord = attrs as Record<string, unknown>;
      const Element = (props.elementType ?? "h2") as string;

      return h(
        Element,
        {
          ...titleProps.value,
          ...attrsRecord,
          class: ["spectrum-Dialog-heading", attrsRecord.class],
        },
        slots.default?.()
      );
    };
  },
});
