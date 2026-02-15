import { ListCollection, useListState } from "@vue-aria/list-state";
import { defineComponent, h, type PropType, type VNode } from "vue";
import { ListBoxBase, useListBoxLayout } from "./ListBoxBase";
import { createListBoxCollection } from "./collection";
import type { SpectrumListBoxNodeData, SpectrumListBoxProps } from "./types";

function isRenderableNode(node: VNode): boolean {
  return typeof node.type !== "symbol";
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
    const slotChildren = (slots.default?.() ?? []).filter((node): node is VNode => isRenderableNode(node));
    const collectionNodes = createListBoxCollection(props.items, slotChildren);
    const collection = new ListCollection(collectionNodes as any);
    const state = useListState<object>({
      collection: collection as any,
      disabledKeys: props.disabledKeys,
      selectionMode: props.selectionMode,
      disallowEmptySelection: props.disallowEmptySelection,
      selectedKeys: props.selectedKeys,
      defaultSelectedKeys: props.defaultSelectedKeys,
      onSelectionChange: props.onSelectionChange,
    });

    const layout = useListBoxLayout<object>();

    return () =>
      h(ListBoxBase as any, {
        ...(attrs as Record<string, unknown>),
        id: props.id,
        ariaLabel: props.ariaLabel,
        ariaLabelledby: props.ariaLabelledby,
        autoFocus: props.autoFocus,
        shouldFocusWrap: props.shouldFocusWrap,
        shouldUseVirtualFocus: props.shouldUseVirtualFocus,
        shouldSelectOnPressUp: props.shouldSelectOnPressUp,
        shouldFocusOnHover: props.shouldFocusOnHover,
        escapeKeyBehavior: props.escapeKeyBehavior,
        onAction: props.onAction,
        onFocus: props.onFocus,
        onBlur: props.onBlur,
        onFocusChange: props.onFocusChange,
        renderEmptyState: props.renderEmptyState,
        state,
        layout,
        UNSAFE_className: props.UNSAFE_className,
        UNSAFE_style: props.UNSAFE_style,
      });
  },
});
