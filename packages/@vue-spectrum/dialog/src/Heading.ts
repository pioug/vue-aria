import { computed, defineComponent, h, inject } from "vue";
import { DialogHeaderContext, DialogTitlePropsContext } from "./context";

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
    const headerContextRef = inject(DialogHeaderContext, null);
    const headerContext = computed(() => headerContextRef?.value ?? null);
    const isInHeader = computed(() => Boolean(headerContext.value?.inHeader));
    const hasTypeIcon = computed(() => Boolean(headerContext.value?.hasTypeIcon));

    return () => {
      const attrsRecord = attrs as Record<string, unknown>;
      const Element = (props.elementType ?? "h2") as string;

      return h(
        Element,
        {
          ...titleProps.value,
          ...attrsRecord,
          class: [
            "spectrum-Dialog-heading",
            {
              "spectrum-Dialog-heading--noHeader": !isInHeader.value,
              "spectrum-Dialog-heading--noTypeIcon": !hasTypeIcon.value,
            },
            attrsRecord.class,
          ],
        },
        slots.default?.()
      );
    };
  },
});
