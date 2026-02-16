import { useMenuSection } from "@vue-aria/menu";
import { useSeparator } from "@vue-aria/separator";
import { defineComponent, h, type PropType } from "vue";
import { MenuItem } from "./MenuItem";
import type { MenuCollectionNode } from "./types";
import type { ListState } from "@vue-stately/list";

/** @private */
export const MenuSection = defineComponent({
  name: "SpectrumMenuSection",
  inheritAttrs: false,
  props: {
    item: {
      type: Object as () => MenuCollectionNode,
      required: true,
    },
    state: {
      type: Object as () => ListState<object>,
      required: true,
    },
    closeOnSelect: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    onClose: {
      type: Function as PropType<(() => void) | undefined>,
      required: false,
    },
    isVirtualized: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
  },
  setup(props) {
    const { itemProps, headingProps, groupProps } = useMenuSection({
      heading: props.item.rendered,
      "aria-label": props.item["aria-label"],
    });

    const { separatorProps } = useSeparator({ elementType: "div" });

    return () => {
      const firstSectionKey = props.state.collection.getFirstKey();
      const sections = [...(props.state.collection as any)].filter((node: MenuCollectionNode) => node.type === "section");
      const lastSectionKey = sections.at(-1)?.key;
      const sectionIsFirst = firstSectionKey === props.item.key;
      const lastKey = (props.state.collection as any).getLastKey() as string | number | null;
      const sectionIsLast =
        lastSectionKey === props.item.key
        && lastKey != null
        && props.state.collection.getItem(lastKey)?.parentKey === lastSectionKey;

      const children = [...(props.item.childNodes as Iterable<MenuCollectionNode>)].map((node) => {
        let menuItem = h(MenuItem as any, {
          key: String(node.key),
          item: node,
          state: props.state,
          closeOnSelect: props.closeOnSelect,
          onClose: props.onClose,
          isVirtualized: props.isVirtualized,
        });

        if (typeof node.wrapper === "function") {
          menuItem = node.wrapper(menuItem);
        }

        return menuItem;
      });

      return [
        props.item.key !== props.state.collection.getFirstKey()
          ? h("div", {
              ...separatorProps,
              class: "spectrum-Menu-divider",
            })
          : null,
        h("div", { ...itemProps }, [
          props.item.rendered
            ? h(
                "span",
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
              class: [
                "spectrum-Menu",
                {
                  "spectrum-Menu-section--noHeading": props.item.rendered == null,
                  "spectrum-Menu-section--isFirst": sectionIsFirst,
                  "spectrum-Menu-section--isLast": sectionIsLast,
                },
              ],
            },
            children as any
          ),
        ]),
      ];
    };
  },
});
