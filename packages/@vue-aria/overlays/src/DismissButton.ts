import { useLabels } from "@vue-aria/utils";
import { VisuallyHidden } from "@vue-aria/visually-hidden";
import { defineComponent, h, type PropType } from "vue";

export interface DismissButtonProps {
  "aria-label"?: string;
  "aria-labelledby"?: string;
  id?: string;
  onDismiss?: () => void;
}

export const DismissButton = defineComponent({
  name: "DismissButton",
  inheritAttrs: false,
  props: {
    onDismiss: Function as PropType<(() => void) | undefined>,
  },
  setup(props, { attrs }) {
    const labels = useLabels(
      {
        ...(attrs["aria-label"] ? { "aria-label": String(attrs["aria-label"]) } : null),
        ...(attrs["aria-labelledby"] ? { "aria-labelledby": String(attrs["aria-labelledby"]) } : null),
        ...(attrs.id ? { id: String(attrs.id) } : null),
      },
      "Dismiss"
    );

    return () =>
      h(VisuallyHidden, null, {
        default: () => [
          h("button", {
            ...attrs,
            ...labels,
            tabIndex: -1,
            onClick: () => props.onDismiss?.(),
            style: { width: 1, height: 1 },
          }),
        ],
      });
  },
});
