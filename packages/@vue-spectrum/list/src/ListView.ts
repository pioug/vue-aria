import {
  Fragment,
  computed,
  defineComponent,
  h,
  isVNode,
  nextTick,
  onMounted,
  ref,
  watch,
  type VNode,
  type VNodeChild,
  type PropType,
} from "vue";
import { useGridList } from "@vue-aria/gridlist";
import { useListBoxState } from "@vue-aria/listbox";
import { filterDOMProps, mergeProps } from "@vue-aria/utils";
import type { Key } from "@vue-aria/types";
import { ProgressCircle } from "@vue-spectrum/progress";
import {
  classNames,
  useStyleProps,
  type ClassValue,
} from "@vue-spectrum/utils";
import { ListViewItem } from "./ListViewItem";
import {
  type ListViewKey,
  normalizeListViewItems,
  type NormalizedListViewItemData,
  type SpectrumListViewItemData,
  type SpectrumListViewLoadingState,
  type SpectrumListViewSelectionMode,
} from "./types";

export interface SpectrumListViewProps {
  id?: string | undefined;
  items?: SpectrumListViewItemData[] | undefined;
  selectionMode?: SpectrumListViewSelectionMode | undefined;
  selectedKeys?: Iterable<Key> | undefined;
  defaultSelectedKeys?: Iterable<Key> | undefined;
  disabledKeys?: Iterable<Key> | undefined;
  isDisabled?: boolean | undefined;
  disallowEmptySelection?: boolean | undefined;
  autoFocus?: true | "first" | "last" | undefined;
  loadingState?: SpectrumListViewLoadingState | undefined;
  isQuiet?: boolean | undefined;
  density?: "compact" | "regular" | "spacious" | undefined;
  overflowMode?: "truncate" | "wrap" | undefined;
  onSelectionChange?: ((keys: Set<Key>) => void) | undefined;
  onAction?: ((key: Key) => void) | undefined;
  onLoadMore?: (() => void) | undefined;
  onScroll?: ((event: Event) => void) | undefined;
  renderEmptyState?: (() => unknown) | undefined;
  ariaLabel?: string | undefined;
  ariaLabelledby?: string | undefined;
  "aria-label"?: string | undefined;
  "aria-labelledby"?: string | undefined;
  slot?: string | undefined;
  isHidden?: boolean | undefined;
  UNSAFE_className?: string | undefined;
  UNSAFE_style?: Record<string, string | number> | undefined;
}

function normalizeListViewKey(value: unknown, fallback: ListViewKey): ListViewKey {
  if (typeof value === "string" || typeof value === "number") {
    return value;
  }

  return fallback;
}

function getComponentName(node: VNode): string | undefined {
  if (typeof node.type === "string") {
    return node.type;
  }

  if (typeof node.type === "symbol") {
    return undefined;
  }

  const componentType = node.type as { name?: string | undefined };
  return componentType.name;
}

function flattenVNodeChildren(input: unknown): VNode[] {
  if (input === null || input === undefined) {
    return [];
  }

  if (Array.isArray(input)) {
    return input.flatMap((entry) => flattenVNodeChildren(entry));
  }

  if (!isVNode(input)) {
    return [];
  }

  if (input.type === Fragment) {
    return flattenVNodeChildren(input.children);
  }

  return [input];
}

function getSlotContent(node: VNode): VNodeChild | undefined {
  if (Array.isArray(node.children)) {
    return node.children as VNodeChild;
  }

  if (node.children && typeof node.children === "object") {
    const maybeDefault = (node.children as { default?: (() => unknown) | undefined })
      .default;
    if (typeof maybeDefault === "function") {
      return maybeDefault() as VNodeChild;
    }
  }

  if (typeof node.children === "string") {
    return node.children;
  }

  return undefined;
}

function getCollectionChildren(node: VNode): VNode[] {
  if (!node.children || typeof node.children !== "object") {
    return [];
  }

  const nodeProps = (node.props ?? {}) as Record<string, unknown>;
  const collectionItems = Array.isArray(nodeProps.items)
    ? (nodeProps.items as unknown[])
    : undefined;
  const defaultSlot = (node.children as {
    default?: ((scope?: { item: unknown; index: number }) => unknown) | undefined;
  }).default;

  if (typeof defaultSlot !== "function") {
    return [];
  }

  if (!collectionItems || collectionItems.length === 0) {
    return flattenVNodeChildren(defaultSlot());
  }

  return collectionItems.flatMap((item, index) =>
    flattenVNodeChildren(defaultSlot({ item, index }))
  );
}

function collectListViewItemNodes(nodes: VNode[]): VNode[] {
  const resolved: VNode[] = [];

  for (const node of nodes) {
    const componentName = getComponentName(node);

    if (componentName === "ListViewItem") {
      resolved.push(node);
      continue;
    }

    if (componentName === "Collection") {
      resolved.push(...collectListViewItemNodes(getCollectionChildren(node)));
    }
  }

  return resolved;
}

function extractTextContent(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map((entry) => extractTextContent(entry)).join("");
  }

  if (isVNode(value)) {
    if (typeof value.children === "string") {
      return value.children;
    }

    if (Array.isArray(value.children)) {
      return extractTextContent(value.children);
    }

    if (value.children && typeof value.children === "object") {
      const maybeDefault = (value.children as { default?: (() => unknown) | undefined })
        .default;
      if (typeof maybeDefault === "function") {
        return extractTextContent(maybeDefault());
      }
    }
  }

  return "";
}

function parseListViewSlotItems(nodes: VNode[] | undefined): SpectrumListViewItemData[] {
  if (!nodes || nodes.length === 0) {
    return [];
  }

  const flattened = collectListViewItemNodes(flattenVNodeChildren(nodes));
  const parsedItems: SpectrumListViewItemData[] = [];
  let itemIndex = 0;

  for (const node of flattened) {
    const nodeProps = (node.props ?? {}) as Record<string, unknown>;
    const key = normalizeListViewKey(node.key ?? nodeProps.id, `item-${itemIndex + 1}`);
    const slotLabel = extractTextContent(getSlotContent(node)).trim();

    parsedItems.push({
      key,
      label: slotLabel || String(key),
      description:
        typeof nodeProps.description === "string" ? nodeProps.description : undefined,
      textValue:
        typeof nodeProps.textValue === "string" ? nodeProps.textValue : undefined,
      isDisabled: Boolean(nodeProps.isDisabled),
      "aria-label":
        typeof nodeProps["aria-label"] === "string" ? nodeProps["aria-label"] : undefined,
    });
    itemIndex += 1;
  }

  return parsedItems;
}

function areListItemsEqual(
  left: SpectrumListViewItemData[],
  right: SpectrumListViewItemData[]
): boolean {
  if (left.length !== right.length) {
    return false;
  }

  for (let index = 0; index < left.length; index += 1) {
    const current = left[index];
    const candidate = right[index];
    if (
      current.key !== candidate.key ||
      current.id !== candidate.id ||
      current.label !== candidate.label ||
      current.description !== candidate.description ||
      current.textValue !== candidate.textValue ||
      current.isDisabled !== candidate.isDisabled ||
      current["aria-label"] !== candidate["aria-label"]
    ) {
      return false;
    }
  }

  return true;
}

export const ListView = defineComponent({
  name: "ListView",
  inheritAttrs: false,
  props: {
    id: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    items: {
      type: Array as PropType<SpectrumListViewItemData[] | undefined>,
      default: undefined,
    },
    selectionMode: {
      type: String as PropType<SpectrumListViewSelectionMode | undefined>,
      default: undefined,
    },
    selectedKeys: {
      type: [Array, Set] as unknown as PropType<Iterable<Key> | undefined>,
      default: undefined,
    },
    defaultSelectedKeys: {
      type: [Array, Set] as unknown as PropType<Iterable<Key> | undefined>,
      default: undefined,
    },
    disabledKeys: {
      type: [Array, Set] as unknown as PropType<Iterable<Key> | undefined>,
      default: undefined,
    },
    isDisabled: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    disallowEmptySelection: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    autoFocus: {
      type: [Boolean, String] as PropType<true | "first" | "last" | undefined>,
      default: undefined,
    },
    loadingState: {
      type: String as PropType<SpectrumListViewLoadingState | undefined>,
      default: undefined,
    },
    isQuiet: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    density: {
      type: String as PropType<"compact" | "regular" | "spacious" | undefined>,
      default: undefined,
    },
    overflowMode: {
      type: String as PropType<"truncate" | "wrap" | undefined>,
      default: undefined,
    },
    onSelectionChange: {
      type: Function as PropType<((keys: Set<Key>) => void) | undefined>,
      default: undefined,
    },
    onAction: {
      type: Function as PropType<((key: Key) => void) | undefined>,
      default: undefined,
    },
    onLoadMore: {
      type: Function as PropType<(() => void) | undefined>,
      default: undefined,
    },
    onScroll: {
      type: Function as PropType<((event: Event) => void) | undefined>,
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
    "aria-label": {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    "aria-labelledby": {
      type: String as PropType<string | undefined>,
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
    const loadMoreRequested = ref(false);
    const slotItems = ref<SpectrumListViewItemData[]>([]);

    const normalizedItems = computed<NormalizedListViewItemData[]>(() =>
      normalizeListViewItems(props.items ?? slotItems.value)
    );
    const usesStaticItemComposition = computed(() => props.items === undefined);
    const selectionMode = computed<SpectrumListViewSelectionMode>(
      () => props.selectionMode ?? "none"
    );
    const isLoading = computed(
      () => props.loadingState === "loading" || props.loadingState === "loadingMore"
    );

    const state = useListBoxState<NormalizedListViewItemData>({
      collection: normalizedItems,
      selectionMode,
      disallowEmptySelection: props.disallowEmptySelection,
      selectedKeys: props.selectedKeys,
      defaultSelectedKeys: props.defaultSelectedKeys,
      disabledKeys: props.disabledKeys,
      isDisabled: props.isDisabled,
      onSelectionChange: (keys) => {
        props.onSelectionChange?.(keys);
      },
    });

    const { gridProps } = useGridList(
      {
        id: props.id,
        "aria-label": props["aria-label"] ?? props.ariaLabel,
        "aria-labelledby": props["aria-labelledby"] ?? props.ariaLabelledby,
        isVirtualized: true,
        selectionBehavior:
          selectionMode.value === "single" ? "replace" : "toggle",
        onAction: (key) => {
          props.onAction?.(key);
        },
      },
      state,
      rootRef
    );

    const getFirstEnabledKey = (): Key | null => {
      for (const item of normalizedItems.value) {
        if (!state.isDisabledKey(item.key)) {
          return item.key;
        }
      }
      return null;
    };

    const getLastEnabledKey = (): Key | null => {
      for (let i = normalizedItems.value.length - 1; i >= 0; i -= 1) {
        const key = normalizedItems.value[i]?.key;
        if (key !== undefined && !state.isDisabledKey(key)) {
          return key;
        }
      }
      return null;
    };

    const focusKey = (key: Key | null) => {
      if (key === null) {
        return;
      }

      state.setFocusedKey(key);

      const attemptFocus = (attempt: number) => {
        const element = state.getOptionElement(key);
        if (element) {
          element.focus();
          return;
        }

        if (attempt >= 4) {
          return;
        }

        void nextTick(() => {
          attemptFocus(attempt + 1);
        });
      };

      void nextTick(() => {
        attemptFocus(0);
      });
    };

    const applyAutoFocus = () => {
      if (!props.autoFocus) {
        return;
      }

      const key =
        props.autoFocus === "last"
          ? getLastEnabledKey()
          : state.focusedKey.value ?? getFirstEnabledKey();

      focusKey(key);
    };

    const onGridScroll = (event: Event) => {
      props.onScroll?.(event);

      const target = event.target as HTMLElement | null;
      if (!target || !props.onLoadMore || isLoading.value) {
        loadMoreRequested.value = false;
        return;
      }

      const distance = target.scrollHeight - target.scrollTop - target.clientHeight;
      if (distance > 4) {
        loadMoreRequested.value = false;
        return;
      }

      if (loadMoreRequested.value) {
        return;
      }

      loadMoreRequested.value = true;
      props.onLoadMore();
    };

    watch(
      () => isLoading.value,
      (value) => {
        if (!value) {
          loadMoreRequested.value = false;
        }
      }
    );

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

    watch(normalizedItems, () => {
      if (!props.autoFocus || state.focusedKey.value !== null) {
        return;
      }

      void nextTick(() => {
        applyAutoFocus();
      });
    });

    expose({
      UNSAFE_getDOMNode: () => rootRef.value,
    });

    return () => {
      if (props.items === undefined) {
        const parsedItems = parseListViewSlotItems(slots.default?.() as VNode[] | undefined);
        if (!areListItemsEqual(parsedItems, slotItems.value)) {
          slotItems.value = parsedItems;
        }
      }

      const domProps = filterDOMProps(attrs as Record<string, unknown>, {
        labelable: true,
      });
      const { styleProps } = useStyleProps({
        isHidden: props.isHidden,
        UNSAFE_className: props.UNSAFE_className,
        UNSAFE_style: props.UNSAFE_style,
      });

      const children = normalizedItems.value.map((item) =>
        h(
          ListViewItem,
          {
            key: String(item.key),
            item,
            state,
            selectionMode: selectionMode.value,
            onAction: props.onAction,
            density: props.density,
            overflowMode: props.overflowMode,
          },
          !usesStaticItemComposition.value && slots.default
            ? {
                default: () => slots.default?.({ item }),
              }
            : undefined
        )
      );

      if (isLoading.value) {
        children.push(
          h(
            "div",
            {
              role: "row",
              class: classNames("react-spectrum-ListView-item", "is-loading"),
            },
            [
              h(
                "div",
                {
                  role: "gridcell",
                  "aria-colindex": 1,
                  class: classNames("react-spectrum-ListView-itemCell"),
                },
                [
                  h(ProgressCircle, {
                    isIndeterminate: true,
                    size: "S",
                    "aria-label":
                      props.loadingState === "loadingMore"
                        ? "Loading more"
                        : "Loading",
                  }),
                ]
              ),
            ]
          )
        );
      }

      if (!isLoading.value && normalizedItems.value.length === 0) {
        const emptyState = slots.emptyState?.() ?? props.renderEmptyState?.();
        if (emptyState) {
          children.push(
            h(
              "div",
              {
                role: "row",
                class: classNames("react-spectrum-ListView-item", "react-spectrum-ListView-empty"),
              },
              [
                h(
                  "div",
                  {
                    role: "gridcell",
                    "aria-colindex": 1,
                    class: classNames("react-spectrum-ListView-itemCell"),
                  },
                  emptyState as any
                ),
              ]
            )
          );
        }
      }

      const rootGridProps = {
        ...gridProps.value,
        onScroll: undefined,
      };

      return h(
        "div",
        mergeProps(domProps, rootGridProps, {
          ref: (value: unknown) => {
            rootRef.value = value as HTMLElement | null;
          },
          class: classNames(
            "react-spectrum-ListView",
            `react-spectrum-ListView--${props.density ?? "regular"}`,
            {
              "react-spectrum-ListView--quiet": Boolean(props.isQuiet),
              "react-spectrum-ListView--wrap": (props.overflowMode ?? "truncate") === "wrap",
              "react-spectrum-ListView--loadingMore": props.loadingState === "loadingMore",
            },
            styleProps.class as ClassValue | undefined,
            domProps.class as ClassValue | undefined
          ),
          style: styleProps.style,
          hidden: styleProps.hidden,
          onScroll: onGridScroll,
        }),
        children
      );
    };
  },
});
