import { useListBoxSection } from "@vue-aria/listbox";
import { defineComponent, h } from "vue";
import { ListBoxOption } from "./ListBoxOption";
import { useListBoxContext } from "./context";
import type { ListBoxCollectionNode } from "./types";

/** @private */
export const ListBoxSection = defineComponent({
  name: "SpectrumListBoxSection",
  inheritAttrs: false,
  props: {
    item: {
      type: Object as () => ListBoxCollectionNode,
      required: true,
    },
  },
  setup(props) {
    const context = useListBoxContext();
    if (!context) {
      throw new Error("ListBoxSection must be used within ListBox.");
    }

    const { headingProps, groupProps } = useListBoxSection({
      heading: props.item.rendered,
      "aria-label": props.item["aria-label"],
    });

    return () => {
      const sectionIsFirst = context.state.collection.getFirstKey() === props.item.key;

      return [
        !sectionIsFirst
          ? h("div", {
              role: "presentation",
              class: "spectrum-Menu-divider",
            })
          : null,
        props.item.rendered
          ? h(
              "div",
              {
                ...headingProps,
                class: "spectrum-Menu-sectionHeading",
              },
              typeof props.item.rendered === "string" || typeof props.item.rendered === "number"
                ? String(props.item.rendered)
                : (props.item.rendered as any)
            )
          : null,
        h(
          "div",
          {
            ...groupProps,
            class: "spectrum-Menu",
          },
          [...(props.item.childNodes as Iterable<ListBoxCollectionNode>)].map((node) =>
            h(ListBoxOption as any, {
              key: String(node.key),
              item: node,
            })
          )
        ),
      ];
    };
  },
});
