import {
  computed,
  defineComponent,
  h,
  ref,
  type PropType,
  type VNodeChild,
  type VNodeRef,
} from "vue";
import { filterDOMProps, mergeProps } from "@vue-aria/utils";
import { classNames, type ClassValue } from "@vue-spectrum/utils";
import { BaseLayout } from "./BaseLayout";
import { provideCardViewContext, type CardViewContextValue } from "./CardViewContext";

export type SpectrumCardSelectionMode = "none" | "single" | "multiple";

export interface SpectrumCardViewProps<T = unknown> {
  items?: T[] | undefined;
  layout?: BaseLayout | undefined;
  selectionMode?: SpectrumCardSelectionMode | undefined;
  selectedKeys?: Iterable<unknown> | undefined;
  defaultSelectedKeys?: Iterable<unknown> | undefined;
  disabledKeys?: Iterable<unknown> | undefined;
  onSelectionChange?: ((keys: Set<unknown>) => void) | undefined;
  width?: string | number | undefined;
  height?: string | number | undefined;
  ariaLabel?: string | undefined;
  ariaLabelledby?: string | undefined;
  UNSAFE_className?: string | undefined;
  UNSAFE_style?: Record<string, string | number> | undefined;
}

function normalizeRenderable(
  value: VNodeChild | VNodeChild[] | undefined
): VNodeChild[] {
  if (value === undefined || value === null || value === false) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => normalizeRenderable(item));
  }

  return [value];
}

function resolveItemKey(item: unknown, index: number): string | number {
  if (item !== null && typeof item === "object" && "id" in item) {
    const key = (item as Record<string, unknown>).id;

    if (typeof key === "string" || typeof key === "number") {
      return key;
    }

    if (typeof key === "boolean") {
      return `bool-${String(key)}-${index}`;
    }

    if (key === null) {
      return `null-${index}`;
    }
  }

  return index;
}

function clampIndex(value: number, length: number): number {
  if (length <= 0) {
    return 0;
  }

  return Math.min(length - 1, Math.max(0, value));
}

function toKeySet(keys: Iterable<unknown> | undefined): Set<unknown> {
  if (!keys) {
    return new Set();
  }

  return new Set(Array.from(keys));
}

export const CardView = defineComponent({
  name: "CardView",
  inheritAttrs: false,
  props: {
    items: {
      type: Array as PropType<unknown[] | undefined>,
      default: undefined,
    },
    layout: {
      type: Object as PropType<BaseLayout | undefined>,
      default: undefined,
    },
    selectionMode: {
      type: String as PropType<SpectrumCardSelectionMode | undefined>,
      default: undefined,
    },
    selectedKeys: {
      type: [Array, Set] as unknown as PropType<Iterable<unknown> | undefined>,
      default: undefined,
    },
    defaultSelectedKeys: {
      type: [Array, Set] as unknown as PropType<Iterable<unknown> | undefined>,
      default: undefined,
    },
    disabledKeys: {
      type: [Array, Set] as unknown as PropType<Iterable<unknown> | undefined>,
      default: undefined,
    },
    onSelectionChange: {
      type: Function as PropType<((keys: Set<unknown>) => void) | undefined>,
      default: undefined,
    },
    width: {
      type: [String, Number] as PropType<string | number | undefined>,
      default: undefined,
    },
    height: {
      type: [String, Number] as PropType<string | number | undefined>,
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
    UNSAFE_className: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    UNSAFE_style: {
      type: Object as PropType<Record<string, string | number> | undefined>,
      default: undefined,
    },
  },
  setup(props, { attrs, slots, expose }) {
    const elementRef = ref<HTMLElement | null>(null);
    const activeCellIndex = ref(0);
    const cellRefs = ref<Array<HTMLElement | null>>([]);
    const internalSelectedKeys = ref<Set<unknown>>(
      toKeySet(props.defaultSelectedKeys)
    );
    const selectedKeys = computed<Set<unknown>>(() =>
      props.selectedKeys !== undefined
        ? toKeySet(props.selectedKeys)
        : internalSelectedKeys.value
    );
    const disabledKeys = computed<Set<unknown>>(() => toKeySet(props.disabledKeys));
    const selectionMode = computed<SpectrumCardSelectionMode>(
      () => props.selectionMode ?? "none"
    );

    const applySelection = (next: Set<unknown>) => {
      if (props.selectedKeys === undefined) {
        internalSelectedKeys.value = next;
      }
      props.onSelectionChange?.(next);
    };

    const toggleSelection = (key: unknown) => {
      if (selectionMode.value === "none" || key === undefined || key === null) {
        return;
      }

      if (disabledKeys.value.has(key)) {
        return;
      }

      const next = new Set(selectedKeys.value);
      if (selectionMode.value === "single") {
        next.clear();
        next.add(key);
      } else if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }

      applySelection(next);
    };

    const context = computed<CardViewContextValue>(() => ({
      inCardView: true,
      layout: props.layout?.type ?? null,
      selectionMode: selectionMode.value,
      isSelected: (key: unknown) =>
        key !== undefined && key !== null ? selectedKeys.value.has(key) : false,
      isDisabled: (key: unknown) =>
        key !== undefined && key !== null ? disabledKeys.value.has(key) : false,
      toggleSelection,
    }));

    provideCardViewContext(context);

    expose({
      UNSAFE_getDOMNode: () => elementRef.value,
    });

    const setCellRef = (index: number, element: Element | null) => {
      cellRefs.value[index] = element as HTMLElement | null;
    };

    const focusCell = (index: number, totalRows: number) => {
      const nextIndex = clampIndex(index, totalRows);
      activeCellIndex.value = nextIndex;
      cellRefs.value[nextIndex]?.focus();
    };

    const handleCellKeyDown = (event: KeyboardEvent, index: number, totalRows: number) => {
      switch (event.key) {
        case "ArrowDown":
        case "ArrowRight":
          event.preventDefault();
          focusCell(index + 1, totalRows);
          return;
        case "ArrowUp":
        case "ArrowLeft":
          event.preventDefault();
          focusCell(index - 1, totalRows);
          return;
        case "Home":
          event.preventDefault();
          focusCell(0, totalRows);
          return;
        case "End":
          event.preventDefault();
          focusCell(totalRows - 1, totalRows);
          return;
        case "Enter":
        case " ":
          event.preventDefault();
          return;
        default:
          return;
      }
    };

    return () => {
      const domProps = filterDOMProps(attrs as Record<string, unknown>);
      const items = props.items;
      const rowEntries = items
        ? items.map((item, index) => ({
            key: resolveItemKey(item, index),
            itemKey: resolveItemKey(item, index),
            children: normalizeRenderable(
              slots.default?.({ item, index }) as VNodeChild[] | undefined
            ),
          }))
        : normalizeRenderable(slots.default?.()).map((child, index) => ({
            key: index,
            itemKey: index,
            children: [child],
          }));
      const rowCount = rowEntries.length;
      if (activeCellIndex.value >= rowCount && rowCount > 0) {
        activeCellIndex.value = rowCount - 1;
      }

      const rows = rowEntries.map((entry, index) =>
        h(
          "div",
          {
            key: entry.key,
            role: "row",
            "aria-rowindex": String(index + 1),
            class: classNames("spectrum-CardView-row"),
          },
          [
            h(
              "div",
              {
                role: "gridcell",
                "aria-selected":
                  selectionMode.value === "none"
                    ? undefined
                    : context.value.isSelected(entry.itemKey),
                tabIndex: index === activeCellIndex.value ? 0 : -1,
                class: classNames("spectrum-CardView-cell"),
                ref: ((element: Element | null) => setCellRef(index, element)) as VNodeRef,
                onFocus: () => {
                  activeCellIndex.value = index;
                },
                onClick: (event: MouseEvent) => {
                  activeCellIndex.value = index;
                  (event.currentTarget as HTMLElement | null)?.focus();
                  toggleSelection(entry.itemKey);
                },
                onKeydown: (event: KeyboardEvent) => {
                  if (event.key === "Enter" || event.key === " ") {
                    toggleSelection(entry.itemKey);
                    return;
                  }
                  handleCellKeyDown(event, index, rowCount);
                },
              },
              entry.children
            ),
          ]
        )
      );

      const className = classNames(
        "spectrum-CardView",
        {
          "spectrum-CardView--grid": props.layout?.type === "grid",
          "spectrum-CardView--gallery": props.layout?.type === "gallery",
          "spectrum-CardView--waterfall": props.layout?.type === "waterfall",
        },
        props.UNSAFE_className as ClassValue | undefined,
        domProps.class as ClassValue | undefined
      );

      return h(
        "div",
        mergeProps(domProps, {
          ref: elementRef,
          role: "grid",
          "aria-label":
            props.ariaLabel ??
            ((attrs as Record<string, unknown>)["aria-label"] as string | undefined),
          "aria-labelledby":
            props.ariaLabelledby ??
            ((attrs as Record<string, unknown>)["aria-labelledby"] as string | undefined),
          "aria-rowcount": String(rowCount),
          "aria-colcount": "1",
          class: className,
          style: {
            ...(typeof domProps.style === "object" && domProps.style !== null
              ? (domProps.style as Record<string, unknown>)
              : {}),
            ...(props.width !== undefined ? { width: String(props.width) } : {}),
            ...(props.height !== undefined ? { height: String(props.height) } : {}),
            ...(props.UNSAFE_style ?? {}),
          },
        }),
        rows
      );
    };
  },
});
