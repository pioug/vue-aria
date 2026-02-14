import { useButton } from "@vue-aria/button";
import { useGridListSelectionCheckbox } from "@vue-aria/gridlist";
import { useTree, useTreeItem } from "@vue-aria/tree";
import { useTreeState, type TreeState } from "@vue-aria/tree-state";
import type { Key, Node } from "@vue-aria/collections";
import { mergeProps } from "@vue-aria/utils";
import { computed, defineComponent, h, ref, type PropType, type VNode, type VNodeChild } from "vue";
import type {
  SpectrumTreeSelectionMode,
  SpectrumTreeSelectionStyle,
  SpectrumTreeViewItemData,
  TreeKey,
} from "./types";
import { buildTreeCollectionNodes, normalizeTreeItems, parseTreeSlotItems } from "./types";

const srOnlyStyle: Record<string, string> = {
  border: "0",
  clip: "rect(0 0 0 0)",
  height: "1px",
  margin: "-1px",
  overflow: "hidden",
  padding: "0",
  position: "absolute",
  width: "1px",
  whiteSpace: "nowrap",
};

export interface SpectrumTreeViewProps {
  id?: string | undefined;
  items?: SpectrumTreeViewItemData[] | undefined;
  selectionMode?: SpectrumTreeSelectionMode | undefined;
  selectionStyle?: SpectrumTreeSelectionStyle | undefined;
  selectedKeys?: Iterable<TreeKey> | undefined;
  defaultSelectedKeys?: Iterable<TreeKey> | undefined;
  disabledKeys?: Iterable<TreeKey> | undefined;
  disabledBehavior?: "all" | "selection" | undefined;
  escapeKeyBehavior?: "clearSelection" | "none" | undefined;
  disallowEmptySelection?: boolean | undefined;
  isDisabled?: boolean | undefined;
  expandedKeys?: Iterable<TreeKey> | undefined;
  defaultExpandedKeys?: Iterable<TreeKey> | undefined;
  onExpandedChange?: ((keys: Set<TreeKey>) => void) | undefined;
  onSelectionChange?: ((keys: Set<TreeKey>) => void) | undefined;
  onAction?: ((key: TreeKey) => void) | undefined;
  renderEmptyState?: (() => unknown) | undefined;
  autoFocus?: boolean | "first" | "last" | undefined;
  shouldSelectOnPressUp?: boolean | undefined;
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
  isHidden?: boolean | undefined;
  UNSAFE_className?: string | undefined;
  UNSAFE_style?: Record<string, string | number> | undefined;
}

export interface SpectrumTreeViewItemProps {
  id?: TreeKey | undefined;
  textValue?: string | undefined;
  name?: string | undefined;
  isDisabled?: boolean | undefined;
  href?: string | undefined;
  hasChildItems?: boolean | undefined;
}

export interface SpectrumTreeViewItemContentProps {
  children?: VNodeChild | undefined;
}

function createStaticTreeComponent(name: string, props: Record<string, unknown>) {
  return defineComponent({
    name,
    props: props as any,
    setup() {
      return () => null;
    },
  });
}

const TreeRow = defineComponent({
  name: "SpectrumTreeRow",
  props: {
    node: {
      type: Object as PropType<Node<SpectrumTreeViewItemData>>,
      required: true,
    },
    state: {
      type: Object as PropType<TreeState<SpectrumTreeViewItemData>>,
      required: true,
    },
    showSelectionCheckboxes: {
      type: Boolean as PropType<boolean | undefined>,
      required: false,
      default: false,
    },
  },
  setup(props) {
    const rowElementRef = ref<HTMLElement | null>(null);
    const pointerPressed = ref(false);
    const rowRef = {
      get current() {
        return rowElementRef.value;
      },
      set current(value: HTMLElement | null) {
        rowElementRef.value = value;
      },
    };

    const rowAria = useTreeItem(
      {
        get node() {
          return props.node;
        },
        get hasChildItems() {
          return props.node.hasChildNodes;
        },
      },
      props.state,
      rowRef
    );

    const expandButtonElementRef = ref<HTMLElement | null>(null);
    const expandButtonRef = {
      get current() {
        return expandButtonElementRef.value;
      },
      set current(value: HTMLElement | null) {
        expandButtonElementRef.value = value;
      },
    };

    const { buttonProps } = useButton(
      {
        ...(rowAria.expandButtonProps as any),
        elementType: "button",
        isDisabled: rowAria.isDisabled,
      },
      expandButtonRef as any
    );
    const { checkboxProps } = useGridListSelectionCheckbox(
      {
        get key() {
          return props.node.key;
        },
      } as any,
      props.state
    );
    const checkboxSelected = computed(() => props.state.selectionManager.isSelected(props.node.key));
    const checkboxDisabled = computed(() => !props.state.selectionManager.canSelectItem(props.node.key));

    return () => {
      const rowProps = rowAria.rowProps as Record<string, unknown>;
      const onRowPointerDown = rowProps.onPointerdown as ((event: PointerEvent) => void) | undefined;
      const onRowPointerUp = rowProps.onPointerup as ((event: PointerEvent) => void) | undefined;
      const onRowPointerLeave = rowProps.onPointerleave as ((event: PointerEvent) => void) | undefined;
      const onRowMouseDown = rowProps.onMousedown as ((event: MouseEvent) => void) | undefined;
      const onRowMouseUp = rowProps.onMouseup as ((event: MouseEvent) => void) | undefined;
      const onRowMouseLeave = rowProps.onMouseleave as ((event: MouseEvent) => void) | undefined;
      const canSelectItem = props.state.selectionManager.canSelectItem(props.node.key);
      const isSelected = canSelectItem && props.state.selectionManager.isSelected(props.node.key);
      const isDisabled = props.state.selectionManager.isDisabled(props.node.key);
      const isRowInteractive = rowAria.allowsSelection || rowAria.hasAction;
      const selectionMode = props.state.selectionManager.selectionMode;
      const loadedChildRows = [...props.state.collection.getChildren(props.node.key)].filter((node) => node.type === "item");
      const hasLoadedChildRows = loadedChildRows.length > 0;
      const isExpanded = hasLoadedChildRows ? props.state.expandedKeys.has(props.node.key) : undefined;
      const chevronButtonProps = buttonProps as Record<string, unknown>;
      const onChevronClick = chevronButtonProps.onClick as ((event: MouseEvent) => void) | undefined;
      const onChevronPointerDown = chevronButtonProps.onPointerdown as ((event: PointerEvent) => void) | undefined;
      const onChevronPointerUp = chevronButtonProps.onPointerup as ((event: PointerEvent) => void) | undefined;
      return h(
        "div",
        {
          ...rowProps,
          ref: rowElementRef,
          class: [
            rowProps.class,
            "react-spectrum-TreeView-row",
            {
              "is-disabled": isDisabled,
              "is-selected": isSelected,
              "is-focused": rowAria.isFocused,
            },
          ],
          "aria-selected": canSelectItem ? (isSelected ? "true" : "false") : undefined,
          "aria-disabled": isDisabled ? "true" : undefined,
          "aria-expanded": isExpanded == null ? undefined : (isExpanded ? "true" : "false"),
          "data-level": String(props.node.level + 1),
          "data-disabled": isDisabled ? "true" : undefined,
          "data-expanded": isExpanded ? "true" : undefined,
          "data-focused": rowAria.isFocused ? "true" : undefined,
          "data-pressed": rowAria.isPressed || pointerPressed.value ? "true" : undefined,
          "data-selected": isSelected ? "true" : undefined,
          "data-selection-mode": selectionMode === "none" ? undefined : selectionMode,
          onPointerdown: (event: PointerEvent) => {
            onRowPointerDown?.(event);
            if (!event.defaultPrevented && event.button === 0 && isRowInteractive) {
              pointerPressed.value = true;
            }
          },
          onPointerup: (event: PointerEvent) => {
            onRowPointerUp?.(event);
            pointerPressed.value = false;
          },
          onPointerleave: (event: PointerEvent) => {
            onRowPointerLeave?.(event);
            pointerPressed.value = false;
          },
          onMousedown: (event: MouseEvent) => {
            onRowMouseDown?.(event);
            if (!event.defaultPrevented && event.button === 0 && isRowInteractive) {
              pointerPressed.value = true;
            }
          },
          onMouseup: (event: MouseEvent) => {
            onRowMouseUp?.(event);
            pointerPressed.value = false;
          },
          onMouseleave: (event: MouseEvent) => {
            onRowMouseLeave?.(event);
            pointerPressed.value = false;
          },
        },
        [
          h(
            "div",
            {
              ...rowAria.gridCellProps,
              class: "react-spectrum-TreeView-cell",
            },
            [
              h("span", {
                class: "react-spectrum-TreeView-indent",
                style: {
                  width: `${props.node.level * 16}px`,
                },
              }),
              props.node.hasChildNodes
                ? h(
                  "button",
                  {
                    ...chevronButtonProps,
                    ref: expandButtonElementRef,
                    class: "react-spectrum-TreeView-chevron",
                    disabled: isDisabled || Boolean(chevronButtonProps.disabled),
                    tabIndex: isDisabled ? undefined : (chevronButtonProps.tabIndex as number | undefined),
                    onClick: (event: MouseEvent) => {
                      event.stopPropagation();
                      onChevronClick?.(event);
                    },
                    onPointerdown: (event: PointerEvent) => {
                      event.stopPropagation();
                      onChevronPointerDown?.(event);
                    },
                    onPointerup: (event: PointerEvent) => {
                      event.stopPropagation();
                      onChevronPointerUp?.(event);
                    },
                    "aria-label": props.state.expandedKeys.has(props.node.key) ? "Collapse" : "Expand",
                    "aria-expanded": props.state.expandedKeys.has(props.node.key),
                  },
                  props.state.expandedKeys.has(props.node.key) ? "▾" : "▸"
                )
                : h("span", {
                  class: "react-spectrum-TreeView-chevronPlaceholder",
                  "aria-hidden": "true",
                }),
              h(
                "div",
                {
                  class: "react-spectrum-TreeView-item",
                },
                [
                  props.showSelectionCheckboxes
                    ? h("input", {
                      type: "checkbox",
                      class: "react-spectrum-TreeView-selectionCheckbox",
                      "aria-label": checkboxProps["aria-label"] as string | undefined,
                      "aria-labelledby": checkboxProps["aria-labelledby"] as string | undefined,
                      checked: checkboxSelected.value,
                      disabled: checkboxDisabled.value,
                      onClick: (event: MouseEvent) => {
                        event.stopPropagation();
                      },
                      onChange: checkboxProps.onChange as ((event: Event) => void) | undefined,
                    })
                    : null,
                  props.node.rendered as any,
                  h(
                    "span",
                    {
                      ...rowAria.descriptionProps,
                      style: srOnlyStyle,
                    },
                    props.node.textValue
                  ),
                ]
              ),
            ]
          ),
        ]
      );
    };
  },
});

export const TreeViewItem = createStaticTreeComponent("TreeViewItem", {
  id: {
    type: [String, Number] as PropType<TreeKey | undefined>,
    default: undefined,
  },
  textValue: {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  name: {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  isDisabled: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined,
  },
  href: {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  hasChildItems: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined,
  },
});
(TreeViewItem as any).__spectrumTreeNodeType = "tree-item";

export const TreeViewItemContent = createStaticTreeComponent("TreeViewItemContent", {});
(TreeViewItemContent as any).__spectrumTreeNodeType = "tree-item-content";

export const TreeView = defineComponent({
  name: "SpectrumTreeView",
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
    selectionStyle: {
      type: String as PropType<SpectrumTreeSelectionStyle | undefined>,
      default: undefined,
    },
    selectedKeys: {
      type: [Object, Array, Set] as PropType<Iterable<TreeKey> | undefined>,
      default: undefined,
    },
    defaultSelectedKeys: {
      type: [Object, Array, Set] as PropType<Iterable<TreeKey> | undefined>,
      default: undefined,
    },
    disabledKeys: {
      type: [Object, Array, Set] as PropType<Iterable<TreeKey> | undefined>,
      default: undefined,
    },
    disabledBehavior: {
      type: String as PropType<"all" | "selection" | undefined>,
      default: undefined,
    },
    escapeKeyBehavior: {
      type: String as PropType<"clearSelection" | "none" | undefined>,
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
    expandedKeys: {
      type: [Object, Array, Set] as PropType<Iterable<TreeKey> | undefined>,
      default: undefined,
    },
    defaultExpandedKeys: {
      type: [Object, Array, Set] as PropType<Iterable<TreeKey> | undefined>,
      default: undefined,
    },
    onExpandedChange: {
      type: Function as PropType<((keys: Set<TreeKey>) => void) | undefined>,
      default: undefined,
    },
    onSelectionChange: {
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
    autoFocus: {
      type: [Boolean, String] as PropType<boolean | "first" | "last" | undefined>,
      default: undefined,
    },
    shouldSelectOnPressUp: {
      type: Boolean as PropType<boolean | undefined>,
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
  },
  setup(props, { attrs, slots, expose }) {
    const treeElementRef = ref<HTMLElement | null>(null);
    const treeRef = {
      get current() {
        return treeElementRef.value;
      },
      set current(value: HTMLElement | null) {
        treeElementRef.value = value;
      },
    };

    const slotItems = computed(() => parseTreeSlotItems(slots.default?.() as VNode[] | undefined));
    const normalizedItems = computed(() => normalizeTreeItems(props.items, slotItems.value));
    const collectionNodes = computed(() => buildTreeCollectionNodes(normalizedItems.value));

    const selectionBehavior = computed(() =>
      props.selectionStyle === "highlight" ? "replace" : "toggle"
    );

    const state = useTreeState<SpectrumTreeViewItemData>({
      get collection() {
        return collectionNodes.value;
      },
      get selectionMode() {
        return props.selectionMode ?? "none";
      },
      get selectionBehavior() {
        return selectionBehavior.value;
      },
      get selectedKeys() {
        return props.selectedKeys as any;
      },
      get defaultSelectedKeys() {
        return props.defaultSelectedKeys as any;
      },
      get disabledKeys() {
        return props.disabledKeys;
      },
      get disabledBehavior() {
        return props.disabledBehavior;
      },
      get disallowEmptySelection() {
        return props.disallowEmptySelection;
      },
      get expandedKeys() {
        return props.expandedKeys as any;
      },
      get defaultExpandedKeys() {
        return props.defaultExpandedKeys as any;
      },
      onExpandedChange(keys) {
        props.onExpandedChange?.(new Set(keys as Set<TreeKey>));
      },
      onSelectionChange(keys) {
        if (keys === "all") {
          const all = new Set<TreeKey>();
          for (const key of state.collection.getKeys()) {
            all.add(key as TreeKey);
          }
          props.onSelectionChange?.(all);
          return;
        }

        props.onSelectionChange?.(new Set(keys as Set<TreeKey>));
      },
    });

    const treeAriaProps = {
      get id() {
        return props.id;
      },
      get "aria-label"() {
        return props["aria-label"] ?? props.ariaLabel;
      },
      get "aria-labelledby"() {
        return props["aria-labelledby"] ?? props.ariaLabelledby;
      },
      get "aria-describedby"() {
        return props["aria-describedby"] ?? props.ariaDescribedby;
      },
      get onAction() {
        return props.onAction;
      },
      get autoFocus() {
        return props.autoFocus;
      },
      get shouldSelectOnPressUp() {
        return props.shouldSelectOnPressUp;
      },
      get escapeKeyBehavior() {
        return props.escapeKeyBehavior;
      },
    };

    const { gridProps } = useTree(treeAriaProps as any, state, treeRef);

    expose({
      focus: () => treeElementRef.value?.focus(),
      blur: () => treeElementRef.value?.blur(),
      UNSAFE_getDOMNode: () => treeElementRef.value,
    });

    return () => {
      const attrsRecord = attrs as Record<string, unknown>;
      const attrsClass = attrsRecord.class;
      const attrsStyle = attrsRecord.style;
      const attrsWithoutClassStyle = { ...attrsRecord };
      delete attrsWithoutClassStyle.class;
      delete attrsWithoutClassStyle.style;

      const visibleRows = [...state.collection.getKeys()]
        .map((key) => state.collection.getItem(key))
        .filter((node): node is Node<SpectrumTreeViewItemData> => Boolean(node && node.type === "item"));
      const showSelectionCheckboxes =
        (props.selectionMode ?? "none") !== "none" && (props.selectionStyle ?? "checkbox") !== "highlight";

      const rootProps = mergeProps(gridProps, attrsWithoutClassStyle, {
        class: [
          attrsClass,
          "react-spectrum-TreeView",
          {
            "is-disabled": props.isDisabled,
            "is-hidden": props.isHidden,
            "is-empty": visibleRows.length === 0,
          },
          props.UNSAFE_className,
        ],
        style: [attrsStyle, props.UNSAFE_style],
      }) as Record<string, unknown>;

      return h(
        "div",
        {
          ...rootProps,
          ref: treeElementRef,
        },
        visibleRows.length > 0
          ? visibleRows.map((node) =>
            h(TreeRow, {
              key: String(node.key),
              node,
              state,
              showSelectionCheckboxes,
            })
          )
          : props.renderEmptyState
            ? [h("div", { class: "react-spectrum-TreeView-empty" }, props.renderEmptyState() as any)]
            : []
      );
    };
  },
});
