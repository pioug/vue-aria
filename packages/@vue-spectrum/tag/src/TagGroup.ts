import {
  Fragment,
  computed,
  defineComponent,
  h,
  isVNode,
  nextTick,
  ref,
  watch,
  type VNode,
  type VNodeChild,
  type PropType,
} from "vue";
import { useLocale } from "@vue-aria/i18n";
import { useId } from "@vue-aria/ssr";
import { filterDOMProps } from "@vue-aria/utils";
import {
  classNames,
  useResizeObserver,
  useStyleProps,
  type ClassValue,
} from "@vue-spectrum/utils";
import {
  Tag,
  type SpectrumTagItemData,
  type TagKey,
} from "./Tag";

export interface SpectrumTagGroupProps {
  id?: string | undefined;
  items?: SpectrumTagItemData[] | undefined;
  disabledKeys?: Iterable<TagKey> | undefined;
  isDisabled?: boolean | undefined;
  allowsRemoving?: boolean | undefined;
  maxRows?: number | undefined;
  actionLabel?: string | undefined;
  onAction?: (() => void) | undefined;
  direction?: "ltr" | "rtl" | undefined;
  onRemove?: ((keys: Set<TagKey>) => void) | undefined;
  ariaLabel?: string | undefined;
  ariaLabelledby?: string | undefined;
  "aria-label"?: string | undefined;
  "aria-labelledby"?: string | undefined;
  emptyStateLabel?: string | undefined;
  removeButtonLabel?: string | undefined;
  slot?: string | undefined;
  UNSAFE_className?: string | undefined;
  UNSAFE_style?: Record<string, string | number> | undefined;
}

function normalizeKeySet(keys: Iterable<TagKey> | undefined): Set<string> {
  if (!keys) {
    return new Set<string>();
  }

  return new Set(Array.from(keys, (key) => String(key)));
}

function keyToString(key: TagKey | undefined): string | undefined {
  if (key === undefined || key === null) {
    return undefined;
  }

  return String(key);
}

function normalizeTagKey(value: unknown, fallback: TagKey): TagKey {
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

function parseTagSlotItems(nodes: VNode[] | undefined): SpectrumTagItemData[] {
  if (!nodes || nodes.length === 0) {
    return [];
  }

  const flattened = flattenVNodeChildren(nodes);
  const parsedItems: SpectrumTagItemData[] = [];
  let itemIndex = 0;

  for (const node of flattened) {
    if (getComponentName(node) !== "Tag") {
      continue;
    }

    const nodeProps = (node.props ?? {}) as Record<string, unknown>;
    const key = normalizeTagKey(node.key ?? nodeProps.id, `tag-${itemIndex + 1}`);
    const slotLabel = extractTextContent(getSlotContent(node)).trim();

    parsedItems.push({
      key,
      label: slotLabel || String(key),
      "aria-label":
        typeof nodeProps["aria-label"] === "string" ? nodeProps["aria-label"] : undefined,
      isDisabled: Boolean(nodeProps.isDisabled),
    });
    itemIndex += 1;
  }

  return parsedItems;
}

function areTagItemsEqual(
  left: SpectrumTagItemData[],
  right: SpectrumTagItemData[]
): boolean {
  if (left.length !== right.length) {
    return false;
  }

  for (let index = 0; index < left.length; index += 1) {
    const current = left[index];
    const candidate = right[index];
    if (
      current.key !== candidate.key ||
      current.label !== candidate.label ||
      current["aria-label"] !== candidate["aria-label"] ||
      current.isDisabled !== candidate.isDisabled
    ) {
      return false;
    }
  }

  return true;
}

export const TagGroup = defineComponent({
  name: "TagGroup",
  inheritAttrs: false,
  props: {
    id: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    items: {
      type: Array as PropType<SpectrumTagItemData[] | undefined>,
      default: undefined,
    },
    disabledKeys: {
      type: [Array, Set] as unknown as PropType<Iterable<TagKey> | undefined>,
      default: undefined,
    },
    isDisabled: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    allowsRemoving: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    maxRows: {
      type: Number as PropType<number | undefined>,
      default: undefined,
    },
    actionLabel: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    onAction: {
      type: Function as PropType<(() => void) | undefined>,
      default: undefined,
    },
    direction: {
      type: String as PropType<"ltr" | "rtl" | undefined>,
      default: undefined,
    },
    onRemove: {
      type: Function as PropType<((keys: Set<TagKey>) => void) | undefined>,
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
    emptyStateLabel: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    removeButtonLabel: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
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
  },
  setup(props, { attrs, expose, slots }) {
    const locale = useLocale();
    const rootRef = ref<HTMLDivElement | null>(null);
    const rowRefs = new Map<string, HTMLDivElement>();
    const removedKeys = ref(new Set<string>());
    const focusedKey = ref<string | null>(null);
    const slotItems = ref<SpectrumTagItemData[]>([]);
    const isExpanded = ref(false);
    const measuredCollapsedCount = ref<number | null>(null);
    const measurementReady = ref(false);
    const gridId = useId(undefined, "v-spectrum-tag-grid");
    const actionGroupId = useId(undefined, "v-spectrum-tag-actions");

    const disabledKeys = computed(() => normalizeKeySet(props.disabledKeys));

    const items = computed(() => {
      const source = props.items ?? slotItems.value;
      return source.filter((item) => !removedKeys.value.has(String(item.key)));
    });
    const shouldUseMaxRows = computed(
      () => typeof props.maxRows === "number" && props.maxRows > 0
    );

    const keyMap = computed(() => {
      const map = new Map<string, TagKey>();
      for (const item of items.value) {
        map.set(String(item.key), item.key);
      }

      return map;
    });

    const isItemDisabled = (item: SpectrumTagItemData): boolean =>
      Boolean(props.isDisabled || item.isDisabled || disabledKeys.value.has(String(item.key)));

    const enabledKeys = computed(() =>
      items.value
        .filter((item) => !isItemDisabled(item))
        .map((item) => String(item.key))
    );

    const measureCollapsedRows = () => {
      if (!shouldUseMaxRows.value || !rootRef.value || items.value.length === 0) {
        measuredCollapsedCount.value = null;
        measurementReady.value = true;
        return;
      }

      const rowElements = items.value
        .map((item) => rowRefs.get(String(item.key)))
        .filter((element): element is HTMLDivElement => Boolean(element));
      if (rowElements.length === 0) {
        return;
      }

      const maxRows = props.maxRows as number;
      let rowNumber = 0;
      let lastTop: number | null = null;
      let firstOverflowIndex = rowElements.length;
      for (let index = 0; index < rowElements.length; index += 1) {
        const top = rowElements[index]?.getBoundingClientRect().top ?? 0;
        if (lastTop === null || Math.abs(top - lastTop) > 0.5) {
          rowNumber += 1;
          lastTop = top;
        }

        if (rowNumber > maxRows) {
          firstOverflowIndex = index;
          break;
        }
      }

      measuredCollapsedCount.value =
        firstOverflowIndex < rowElements.length ? firstOverflowIndex : null;
      measurementReady.value = true;
    };

    const scheduleMeasurement = () => {
      if (!shouldUseMaxRows.value) {
        measurementReady.value = true;
        measuredCollapsedCount.value = null;
        return;
      }

      measurementReady.value = false;
      void nextTick(() => {
        measureCollapsedRows();
      });
    };

    const focusKey = (key: string | null) => {
      if (!key) {
        return;
      }

      focusedKey.value = key;
      rowRefs.get(key)?.focus();
    };

    const moveFocus = (offset: 1 | -1) => {
      const keys = enabledKeys.value;
      if (keys.length === 0) {
        return;
      }

      const current = focusedKey.value;
      const currentIndex = current ? keys.indexOf(current) : -1;
      const baseIndex = currentIndex >= 0 ? currentIndex : 0;
      const nextIndex = (baseIndex + offset + keys.length) % keys.length;
      focusKey(keys[nextIndex] ?? null);
    };

    watch(
      enabledKeys,
      (keys) => {
        if (keys.length === 0) {
          focusedKey.value = null;
          return;
        }

        if (focusedKey.value && keys.includes(focusedKey.value)) {
          return;
        }

        focusedKey.value = keys[0] ?? null;
      },
      { immediate: true }
    );

    watch(
      [
        () => props.maxRows,
        () => items.value.length,
        () => items.value.map((item) => String(item.key)).join("|"),
      ],
      () => {
        scheduleMeasurement();
      },
      { immediate: true }
    );

    useResizeObserver({
      ref: rootRef,
      onResize: () => {
        scheduleMeasurement();
      },
    });

    expose({
      UNSAFE_getDOMNode: () => rootRef.value,
    });

    const removeKey = (itemKey: string) => {
      const originalKey = keyMap.value.get(itemKey) ?? itemKey;
      const next = new Set<TagKey>([originalKey]);

      props.onRemove?.(next);

      removedKeys.value = new Set([...removedKeys.value, itemKey]);
    };

    return () => {
      if (!props.items) {
        const parsedItems = parseTagSlotItems(slots.default?.() as VNode[] | undefined);
        if (!areTagItemsEqual(parsedItems, slotItems.value)) {
          slotItems.value = parsedItems;
        }
      }

      const attrsRecord = attrs as Record<string, unknown>;
      const styleInput = {
        ...attrsRecord,
        UNSAFE_className: props.UNSAFE_className,
        UNSAFE_style: props.UNSAFE_style,
      } as Record<string, unknown>;
      const { styleProps } = useStyleProps(styleInput);
      const domProps = filterDOMProps(attrsRecord, { labelable: false });

      const direction = props.direction ?? locale.value.direction;
      const ariaLabel =
        props.ariaLabel ??
        props["aria-label"] ??
        (attrsRecord["aria-label"] as string | undefined);
      const ariaLabelledby =
        props.ariaLabelledby ??
        props["aria-labelledby"] ??
        (attrsRecord["aria-labelledby"] as string | undefined);
      const hasOverflowFromMaxRows = Boolean(
        shouldUseMaxRows.value &&
          measuredCollapsedCount.value !== null &&
          measuredCollapsedCount.value < items.value.length
      );
      const visibleItems =
        !shouldUseMaxRows.value || isExpanded.value || !measurementReady.value
          ? items.value
          : hasOverflowFromMaxRows
            ? items.value.slice(0, measuredCollapsedCount.value ?? items.value.length)
            : items.value;
      const showAllLabel = `Show all (${items.value.length})`;
      const showLessLabel = "Show less";
      const showActions = hasOverflowFromMaxRows || Boolean(props.actionLabel);

      return h(
        "div",
        {
          ...domProps,
          id: props.id,
          ref: (value: unknown) => {
            rootRef.value = value as HTMLDivElement | null;
          },
          class: classNames(
            "spectrum-Tags-container",
            {
              "spectrum-Tags-container--empty": visibleItems.length === 0,
            },
            styleProps.class as ClassValue | undefined,
            domProps.class as ClassValue | undefined,
            props.UNSAFE_className as ClassValue | undefined
          ),
          style: {
            ...(styleProps.style ?? {}),
            ...(props.UNSAFE_style ?? {}),
          },
        },
        [
          h(
            "div",
            {
              id: gridId.value,
              role: "grid",
              class: classNames("spectrum-Tags"),
              "aria-label": ariaLabel,
              "aria-labelledby": ariaLabelledby,
            },
            visibleItems.length === 0
              ? [
                  h(
                    "div",
                    {
                      class: classNames("spectrum-Tags-empty-state"),
                    },
                    props.emptyStateLabel ?? "No tags"
                  ),
                ]
              : visibleItems.map((item) => {
                  const itemKey = keyToString(item.key) ?? "";
                  const disabled = isItemDisabled(item);

                  return h(Tag, {
                    key: itemKey,
                    ref: (value: unknown) => {
                      if (!value) {
                        rowRefs.delete(itemKey);
                        return;
                      }

                      const element = (value as { $el?: unknown }).$el as
                        | HTMLDivElement
                        | undefined;
                      if (element) {
                        rowRefs.set(itemKey, element);
                      }
                    },
                    item,
                    tabIndex: focusedKey.value === itemKey ? 0 : -1,
                    isFocused: focusedKey.value === itemKey,
                    isDisabled: disabled,
                    allowsRemoving: props.allowsRemoving,
                    removeButtonLabel: props.removeButtonLabel,
                    onFocus: () => {
                      focusedKey.value = itemKey;
                    },
                    onKeydown: (event: KeyboardEvent) => {
                      const key = event.key;

                      if ((key === "Delete" || key === "Backspace") && !disabled) {
                        if (props.allowsRemoving) {
                          event.preventDefault();
                          removeKey(itemKey);
                        }
                        return;
                      }

                      let handled = true;
                      switch (key) {
                        case "ArrowRight":
                          moveFocus(direction === "rtl" ? -1 : 1);
                          break;
                        case "ArrowLeft":
                          moveFocus(direction === "rtl" ? 1 : -1);
                          break;
                        case "ArrowDown":
                          moveFocus(1);
                          break;
                        case "ArrowUp":
                          moveFocus(-1);
                          break;
                        case "Home":
                        case "PageUp":
                          focusKey(enabledKeys.value[0] ?? null);
                          break;
                        case "End":
                        case "PageDown":
                          focusKey(enabledKeys.value[enabledKeys.value.length - 1] ?? null);
                          break;
                        default:
                          handled = false;
                          break;
                      }

                      if (!handled) {
                        return;
                      }

                      event.preventDefault();
                    },
                    onRemove: () => {
                      if (!disabled && props.allowsRemoving) {
                        removeKey(itemKey);
                      }
                    },
                  });
                })
          ),
          showActions
            ? h(
                "div",
                {
                  id: actionGroupId.value,
                  role: "group",
                  class: classNames("spectrum-Tags-actions"),
                  "aria-label": "Actions",
                  "aria-labelledby": `${gridId.value} ${actionGroupId.value}`,
                },
                [
                  hasOverflowFromMaxRows
                    ? h(
                        "button",
                        {
                          type: "button",
                          class: classNames("spectrum-Tags-toggle"),
                          onClick: () => {
                            isExpanded.value = !isExpanded.value;
                          },
                        },
                        isExpanded.value ? showLessLabel : showAllLabel
                      )
                    : null,
                  props.actionLabel
                    ? h(
                        "button",
                        {
                          type: "button",
                          class: classNames("spectrum-Tags-action"),
                          onClick: () => {
                            props.onAction?.();
                          },
                        },
                        props.actionLabel
                      )
                    : null,
                ]
              )
            : null,
        ]
      );
    };
  },
});
