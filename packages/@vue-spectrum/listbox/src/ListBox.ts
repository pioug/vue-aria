import { ListCollection, useListState } from "@vue-aria/list-state";
import { defineComponent, h, type PropType, type VNode } from "vue";
import { ListBoxBase, useListBoxLayout } from "./ListBoxBase";
import { createListBoxCollection } from "./collection";
import type { SpectrumListBoxNodeData, SpectrumListBoxProps } from "./types";

function isRenderableNode(node: VNode): boolean {
  return typeof node.type !== "symbol";
}

function syncListCollection(target: any, source: any): void {
  target.keyMap = source.keyMap;
  target.iterable = source.iterable;
  target.firstKey = source.firstKey;
  target.lastKey = source.lastKey;
  target._size = source._size;
}

function getCollectionSignature(nodes: Array<any>): string {
  const parts: string[] = [];
  const visit = (items: Array<any>) => {
    for (const item of items) {
      parts.push(`${String(item.key)}:${item.type}:${item.textValue ?? ""}`);
      if (Array.isArray(item.childNodes) && item.childNodes.length > 0) {
        visit(item.childNodes as Array<any>);
      }
    }
  };

  visit(nodes);
  return parts.join("|");
}

/**
 * A list of options that can allow selection of one or more.
 */
export const ListBox = defineComponent({
  name: "SpectrumListBox",
  inheritAttrs: false,
  props: {
    id: {
      type: String,
      required: false,
    },
    items: {
      type: Array as PropType<Array<SpectrumListBoxNodeData>>,
      required: false,
      default: undefined,
    },
    ariaLabel: {
      type: String,
      required: false,
    },
    ariaLabelledby: {
      type: String,
      required: false,
    },
    disabledKeys: {
      type: Object as PropType<Iterable<string | number> | undefined>,
      required: false,
      default: undefined,
    },
    selectionMode: {
      type: String as () => SpectrumListBoxProps<object>["selectionMode"],
      required: false,
      default: undefined,
    },
    disallowEmptySelection: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    escapeKeyBehavior: {
      type: String as () => SpectrumListBoxProps<object>["escapeKeyBehavior"],
      required: false,
      default: undefined,
    },
    selectedKeys: {
      type: Object as PropType<SpectrumListBoxProps<object>["selectedKeys"]>,
      required: false,
      default: undefined,
    },
    defaultSelectedKeys: {
      type: Object as PropType<SpectrumListBoxProps<object>["defaultSelectedKeys"]>,
      required: false,
      default: undefined,
    },
    onSelectionChange: {
      type: Function as PropType<SpectrumListBoxProps<object>["onSelectionChange"]>,
      required: false,
    },
    autoFocus: {
      type: [Boolean, String] as PropType<boolean | "first" | "last" | undefined>,
      required: false,
      default: undefined,
    },
    shouldFocusWrap: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    shouldUseVirtualFocus: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    shouldSelectOnPressUp: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    shouldFocusOnHover: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    maxHeight: {
      type: Number as () => number | undefined,
      required: false,
      default: undefined,
    },
    onLoadMore: {
      type: Function as PropType<SpectrumListBoxProps<object>["onLoadMore"]>,
      required: false,
    },
    isLoading: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    onAction: {
      type: Function as PropType<SpectrumListBoxProps<object>["onAction"]>,
      required: false,
    },
    onFocus: {
      type: Function as PropType<SpectrumListBoxProps<object>["onFocus"]>,
      required: false,
    },
    onBlur: {
      type: Function as PropType<SpectrumListBoxProps<object>["onBlur"]>,
      required: false,
    },
    onFocusChange: {
      type: Function as PropType<SpectrumListBoxProps<object>["onFocusChange"]>,
      required: false,
    },
    renderEmptyState: {
      type: Function as PropType<SpectrumListBoxProps<object>["renderEmptyState"]>,
      required: false,
    },
    UNSAFE_className: {
      type: String,
      required: false,
    },
    UNSAFE_style: {
      type: Object as PropType<Record<string, unknown> | undefined>,
      required: false,
    },
  },
  setup(props, { attrs, slots }) {
    const initialSlotChildren = (slots.default?.() ?? []).filter((node): node is VNode => isRenderableNode(node));
    const initialCollectionNodes = createListBoxCollection(props.items, initialSlotChildren);
    const collection = new ListCollection(initialCollectionNodes as any);
    const state = useListState<object>({
      collection: collection as any,
      get disabledKeys() {
        return props.disabledKeys;
      },
      get selectionMode() {
        return props.selectionMode;
      },
      get disallowEmptySelection() {
        return props.disallowEmptySelection;
      },
      get selectedKeys() {
        return props.selectedKeys;
      },
      get defaultSelectedKeys() {
        return props.defaultSelectedKeys;
      },
      get onSelectionChange() {
        return props.onSelectionChange;
      },
    });

    const layout = useListBoxLayout<object>();

    return () => {
      const slotChildren = (slots.default?.() ?? []).filter((node): node is VNode => isRenderableNode(node));
      const collectionNodes = createListBoxCollection(props.items, slotChildren);
      const nextCollection = new ListCollection(collectionNodes as any);
      const collectionSignature = getCollectionSignature(collectionNodes as any[]);
      syncListCollection(state.collection as any, nextCollection as any);
      (state.selectionManager as any).collection = state.collection as any;

      return h(ListBoxBase as any, {
        ...(attrs as Record<string, unknown>),
        id: props.id,
        ariaLabel: props.ariaLabel,
        ariaLabelledby: props.ariaLabelledby,
        autoFocus: props.autoFocus,
        shouldFocusWrap: props.shouldFocusWrap,
        shouldUseVirtualFocus: props.shouldUseVirtualFocus,
        shouldSelectOnPressUp: props.shouldSelectOnPressUp,
        shouldFocusOnHover: props.shouldFocusOnHover,
        maxHeight: props.maxHeight,
        onLoadMore: props.onLoadMore,
        isLoading: props.isLoading,
        escapeKeyBehavior: props.escapeKeyBehavior,
        onAction: props.onAction,
        onFocus: props.onFocus,
        onBlur: props.onBlur,
        onFocusChange: props.onFocusChange,
        renderEmptyState: props.renderEmptyState,
        collectionSignature,
        state,
        layout,
        UNSAFE_className: props.UNSAFE_className,
        UNSAFE_style: props.UNSAFE_style,
      });
    };
  },
});
