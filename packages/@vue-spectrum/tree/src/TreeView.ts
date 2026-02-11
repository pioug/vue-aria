import {
  computed,
  defineComponent,
  h,
  nextTick,
  onMounted,
  ref,
  watch,
  type PropType,
} from "vue";
import { useTree, useTreeItem } from "@vue-aria/tree";
import {
  useTreeState,
  type TreeCollectionNode,
  type TreeInputNode,
  type UseTreeStateResult,
} from "@vue-aria/tree-state";
import { filterDOMProps, mergeProps } from "@vue-aria/utils";
import { classNames, useStyleProps, type ClassValue } from "@vue-spectrum/utils";
import type {
  SpectrumTreeSelectionMode,
  SpectrumTreeViewItemData,
  TreeKey,
} from "./types";
import { normalizeTreeItems } from "./types";

export interface SpectrumTreeViewProps {
  id?: string | undefined;
  items?: SpectrumTreeViewItemData[] | undefined;
  selectionMode?: SpectrumTreeSelectionMode | undefined;
  selectedKeys?: Iterable<TreeKey> | undefined;
  defaultSelectedKeys?: Iterable<TreeKey> | undefined;
  expandedKeys?: Iterable<TreeKey> | undefined;
  defaultExpandedKeys?: Iterable<TreeKey> | undefined;
  disabledKeys?: Iterable<TreeKey> | undefined;
  disallowEmptySelection?: boolean | undefined;
  isDisabled?: boolean | undefined;
  autoFocus?: true | "first" | "last" | undefined;
  onSelectionChange?: ((keys: Set<TreeKey>) => void) | undefined;
  onExpandedChange?: ((keys: Set<TreeKey>) => void) | undefined;
  onAction?: ((key: TreeKey) => void) | undefined;
  renderEmptyState?: (() => unknown) | undefined;
  ariaLabel?: string | undefined;
  ariaLabelledby?: string | undefined;
  ariaDescribedby?: string | undefined;
  "aria-label"?: string | undefined;
  "aria-labelledby"?: string | undefined;
  "aria-describedby"?: string | undefined;
  onFocus?: ((event: FocusEvent) => void) | undefined;
  onBlur?: ((event: FocusEvent) => void) | undefined;
  onFocusChange?: ((isFocused: boolean) => void) | undefined;
  onKeydown?: ((event: KeyboardEvent) => void) | undefined;
  onKeyup?: ((event: KeyboardEvent) => void) | undefined;
  slot?: string | undefined;
  isHidden?: boolean | undefined;
  UNSAFE_className?: string | undefined;
  UNSAFE_style?: Record<string, string | number> | undefined;
}

export interface SpectrumTreeViewItemProps extends SpectrumTreeViewItemData {}

export interface SpectrumTreeViewItemContentProps {
  slot?: string | undefined;
  UNSAFE_className?: string | undefined;
  UNSAFE_style?: Record<string, string | number> | undefined;
}

function createTreeStaticComponent(name: string, props: Record<string, unknown>) {
  return defineComponent({
    name,
    props: props as any,
    setup(_, { slots }) {
      return () => slots.default?.() ?? null;
    },
  });
}

export const TreeViewItem = createTreeStaticComponent("TreeViewItem", {
  id: {
    type: [String, Number] as PropType<TreeKey | undefined>,
    default: undefined,
  },
  textValue: {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  isDisabled: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined,
  },
});

export const TreeViewItemContent = createTreeStaticComponent("TreeViewItemContent", {
  slot: {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  UNSAFE_className: {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  UNSAFE_style: {
    type: Object as PropType<Record<string, string | number> | undefined>,
    default: undefined,
  },
});

interface TreeRowViewProps {
  state: UseTreeStateResult<SpectrumTreeViewItemData>;
  node: TreeCollectionNode<SpectrumTreeViewItemData>;
  onAction?: ((key: TreeKey) => void) | undefined;
  renderContent?: (
    item: SpectrumTreeViewItemData,
    node: TreeCollectionNode<SpectrumTreeViewItemData>
  ) => unknown;
}

const TreeRowView = defineComponent({
  name: "TreeRowView",
  props: {
    state: {
      type: Object as PropType<UseTreeStateResult<SpectrumTreeViewItemData>>,
      required: true,
    },
    node: {
      type: Object as PropType<TreeCollectionNode<SpectrumTreeViewItemData>>,
      required: true,
    },
    onAction: {
      type: Function as PropType<((key: TreeKey) => void) | undefined>,
      default: undefined,
    },
    renderContent: {
      type: Function as PropType<
        ((
          item: SpectrumTreeViewItemData,
          node: TreeCollectionNode<SpectrumTreeViewItemData>
        ) => unknown) | undefined
      >,
      default: undefined,
    },
  },
  setup(props) {
    const rowRef = ref<HTMLElement | null>(null);

    const { rowProps, gridCellProps, descriptionProps, expandButtonProps, isExpanded, isSelected, isDisabled } =
      useTreeItem(
        {
          node: props.node,
          isVirtualized: false,
          onAction: props.onAction,
        },
        props.state,
        rowRef
      );

    const item = computed<SpectrumTreeViewItemData>(
      () =>
        props.node.value ?? {
          key: props.node.key,
          textValue: props.node.textValue,
        }
    );

    const rowLabel = computed(() => props.node.textValue ?? String(props.node.key));

    const content = computed(() => {
      if (props.renderContent) {
        return props.renderContent(item.value, props.node);
      }

      return rowLabel.value;
    });

    const indent = computed(() => `${Math.max(0, props.node.level - 1) * 16}px`);

    return () =>
      h(
        "div",
        mergeProps(rowProps.value, {
          ref: (value: unknown) => {
            rowRef.value = value as HTMLElement | null;
          },
          class: classNames("spectrum-TreeView-row", "react-spectrum-TreeView-row", {
            "is-selected": isSelected.value,
            "is-disabled": isDisabled.value,
          }),
          "data-level": String(props.node.level),
        }),
        [
          h(
            "div",
            mergeProps(gridCellProps.value, {
              class: classNames("spectrum-TreeView-cell", "react-spectrum-TreeView-cell"),
              style: {
                paddingInlineStart: indent.value,
              },
            }),
            [
              props.node.hasChildNodes
                ? h(
                    "button",
                    mergeProps(expandButtonProps.value, {
                      type: "button",
                      class: classNames(
                        "spectrum-TreeView-toggleButton",
                        "react-spectrum-TreeView-toggleButton"
                      ),
                    }),
                    isExpanded.value ? "▾" : "▸"
                  )
                : null,
              h(
                "span",
                {
                  class: classNames(
                    "spectrum-TreeView-itemContent",
                    "react-spectrum-TreeView-itemContent"
                  ),
                },
                content.value as any
              ),
            ]
          ),
          h(
            "span",
            mergeProps(descriptionProps.value, {
              class: classNames("react-spectrum-TreeView-description"),
              style: {
                display: "none",
              },
            }),
            rowLabel.value
          ),
        ]
      );
  },
});

function collectTreeKeys(
  nodes: TreeInputNode<SpectrumTreeViewItemData>[]
): Set<TreeKey> {
  const keys = new Set<TreeKey>();

  const visit = (node: TreeInputNode<SpectrumTreeViewItemData>) => {
    keys.add(node.key);

    if (!node.children) {
      return;
    }

    for (const child of node.children) {
      visit(child);
    }
  };

  for (const node of nodes) {
    visit(node);
  }

  return keys;
}

export const TreeView = defineComponent({
  name: "TreeView",
  inheritAttrs: false,
  props: {
    id: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    items: {
      type: Array as PropType<SpectrumTreeViewItemData[] | undefined>,
      default: undefined,
    },
    selectionMode: {
      type: String as PropType<SpectrumTreeSelectionMode | undefined>,
      default: undefined,
    },
    selectedKeys: {
      type: [Array, Set] as unknown as PropType<Iterable<TreeKey> | undefined>,
      default: undefined,
    },
    defaultSelectedKeys: {
      type: [Array, Set] as unknown as PropType<Iterable<TreeKey> | undefined>,
      default: undefined,
    },
    expandedKeys: {
      type: [Array, Set] as unknown as PropType<Iterable<TreeKey> | undefined>,
      default: undefined,
    },
    defaultExpandedKeys: {
      type: [Array, Set] as unknown as PropType<Iterable<TreeKey> | undefined>,
      default: undefined,
    },
    disabledKeys: {
      type: [Array, Set] as unknown as PropType<Iterable<TreeKey> | undefined>,
      default: undefined,
    },
    disallowEmptySelection: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    isDisabled: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    autoFocus: {
      type: [Boolean, String] as PropType<true | "first" | "last" | undefined>,
      default: undefined,
    },
    onSelectionChange: {
      type: Function as PropType<((keys: Set<TreeKey>) => void) | undefined>,
      default: undefined,
    },
    onExpandedChange: {
      type: Function as PropType<((keys: Set<TreeKey>) => void) | undefined>,
      default: undefined,
    },
    onAction: {
      type: Function as PropType<((key: TreeKey) => void) | undefined>,
      default: undefined,
    },
    renderEmptyState: {
      type: Function as PropType<(() => unknown) | undefined>,
      default: undefined,
    },
    ariaLabel: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    ariaLabelledby: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    ariaDescribedby: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    "aria-label": {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    "aria-labelledby": {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    "aria-describedby": {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    onFocus: {
      type: Function as PropType<((event: FocusEvent) => void) | undefined>,
      default: undefined,
    },
    onBlur: {
      type: Function as PropType<((event: FocusEvent) => void) | undefined>,
      default: undefined,
    },
    onFocusChange: {
      type: Function as PropType<((isFocused: boolean) => void) | undefined>,
      default: undefined,
    },
    onKeydown: {
      type: Function as PropType<((event: KeyboardEvent) => void) | undefined>,
      default: undefined,
    },
    onKeyup: {
      type: Function as PropType<((event: KeyboardEvent) => void) | undefined>,
      default: undefined,
    },
    slot: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    isHidden: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    UNSAFE_className: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    UNSAFE_style: {
      type: Object as PropType<Record<string, string | number> | undefined>,
      default: undefined,
    },
  },
  setup(props, { attrs, expose, slots }) {
    const rootRef = ref<HTMLElement | null>(null);

    const normalizedItems = computed(() => normalizeTreeItems(props.items));

    const effectiveDisabledKeys = computed(() => {
      const keys = new Set<TreeKey>(props.disabledKeys ?? []);
      if (!props.isDisabled) {
        return keys;
      }

      const allKeys = collectTreeKeys(normalizedItems.value);
      for (const key of allKeys) {
        keys.add(key);
      }

      return keys;
    });

    const state = useTreeState<SpectrumTreeViewItemData>({
      collection: normalizedItems,
      selectionMode: computed(() => props.selectionMode ?? "none"),
      selectedKeys: props.selectedKeys,
      defaultSelectedKeys: props.defaultSelectedKeys,
      expandedKeys: props.expandedKeys,
      defaultExpandedKeys: props.defaultExpandedKeys,
      disabledKeys: effectiveDisabledKeys,
      disallowEmptySelection: props.disallowEmptySelection,
      onExpandedChange: (keys) => {
        props.onExpandedChange?.(new Set(keys));
      },
      onSelectionChange: (keys) => {
        props.onSelectionChange?.(new Set(keys));
      },
    });

    const { gridProps } = useTree(
      {
        id: props.id,
        "aria-label": props["aria-label"] ?? props.ariaLabel,
        "aria-labelledby": props["aria-labelledby"] ?? props.ariaLabelledby,
        "aria-describedby": props["aria-describedby"] ?? props.ariaDescribedby,
        selectionBehavior: "toggle",
        onAction: (key) => {
          props.onAction?.(key);
        },
        onFocus: props.onFocus,
        onBlur: props.onBlur,
        onFocusChange: props.onFocusChange,
        onKeydown: props.onKeydown,
        onKeyup: props.onKeyup,
      },
      state,
      rootRef
    );

    const applyAutoFocus = () => {
      if (!props.autoFocus) {
        return;
      }

      const visibleNodes = state.collection.value.visibleNodes;
      if (visibleNodes.length === 0) {
        return;
      }

      const key =
        props.autoFocus === "last"
          ? visibleNodes[visibleNodes.length - 1]?.key ?? null
          : visibleNodes[0]?.key ?? null;

      if (key === null) {
        return;
      }

      state.selectionManager.setFocused(true);
      state.selectionManager.setFocusedKey(key);
    };

    onMounted(() => {
      void nextTick(() => {
        applyAutoFocus();
      });
    });

    watch(
      () => props.autoFocus,
      (value) => {
        if (!value) {
          return;
        }

        void nextTick(() => {
          applyAutoFocus();
        });
      }
    );

    watch(
      () => state.collection.value.visibleNodes.length,
      () => {
        if (!props.autoFocus) {
          return;
        }

        void nextTick(() => {
          applyAutoFocus();
        });
      }
    );

    expose({
      UNSAFE_getDOMNode: () => rootRef.value,
      focus: () => {
        rootRef.value?.focus();
      },
    });

    return () => {
      const domProps = filterDOMProps(attrs as Record<string, unknown>, {
        labelable: true,
      });
      const { styleProps } = useStyleProps({
        isHidden: props.isHidden,
        UNSAFE_className: props.UNSAFE_className,
        UNSAFE_style: props.UNSAFE_style,
      });

      const visibleNodes = state.collection.value.visibleNodes;
      const rows = visibleNodes.map((node) =>
        h(TreeRowView, {
          key: String(node.key),
          state,
          node,
          onAction: props.onAction,
          renderContent: slots.default
            ? (item, currentNode) =>
                slots.default?.({
                  item,
                  node: currentNode,
                })
            : undefined,
        })
      );

      if (rows.length === 0) {
        const emptyState = slots.emptyState?.() ?? props.renderEmptyState?.();
        if (emptyState) {
          rows.push(
            h(
              "div",
              {
                role: "row",
                class: classNames("spectrum-TreeView-row", "react-spectrum-TreeView-row"),
              },
              [
                h(
                  "div",
                  {
                    role: "gridcell",
                    "aria-colindex": 1,
                    class: classNames(
                      "spectrum-TreeView-cell",
                      "react-spectrum-TreeView-cell",
                      "react-spectrum-TreeView-empty"
                    ),
                  },
                  emptyState as any
                ),
              ]
            )
          );
        }
      }

      return h(
        "div",
        mergeProps(domProps, gridProps.value, styleProps, {
          ref: (value: unknown) => {
            rootRef.value = value as HTMLElement | null;
          },
          class: classNames(
            "spectrum-TreeView",
            "react-spectrum-TreeView",
            styleProps.class as ClassValue | undefined
          ),
        }),
        [
          h(
            "div",
            {
              role: "rowgroup",
              class: classNames("spectrum-TreeView-body", "react-spectrum-TreeView-body"),
            },
            rows
          ),
        ]
      );
    };
  },
});
