import {
  Fragment,
  computed,
  defineComponent,
  h,
  isVNode,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type VNode,
  type VNodeChild,
  type PropType,
} from "vue";
import { useLocale } from "@vue-aria/i18n";
import { filterDOMProps } from "@vue-aria/utils";
import { ActionButton } from "@vue-spectrum/button";
import { ActionMenu } from "@vue-spectrum/menu";
import { useProviderProps } from "@vue-spectrum/provider";
import {
  classNames,
  useResizeObserver,
  useStyleProps,
  type ClassValue,
} from "@vue-spectrum/utils";

export type ActionGroupKey = string | number;

export interface SpectrumActionGroupItemData {
  key: ActionGroupKey;
  label: string;
  "aria-label"?: string | undefined;
  isDisabled?: boolean | undefined;
}

export interface SpectrumActionGroupItemProps {
  id?: ActionGroupKey | undefined;
  "aria-label"?: string | undefined;
  isDisabled?: boolean | undefined;
}

export type ActionGroupSelectionMode = "none" | "single" | "multiple";
export type ActionGroupOrientation = "horizontal" | "vertical";
export type ActionGroupDensity = "regular" | "compact";
export type ActionGroupOverflowMode = "wrap" | "collapse";
export type ActionGroupButtonLabelBehavior = "show" | "collapse" | "hide";

interface ActionButtonHandle {
  focus?: () => void;
  UNSAFE_getDOMNode?: () => HTMLElement | null;
}

const SCREEN_READER_ONLY_STYLE: Record<string, string> = {
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: "0",
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: "0",
};

export interface SpectrumActionGroupProps {
  id?: string | undefined;
  items?: SpectrumActionGroupItemData[] | undefined;
  selectionMode?: ActionGroupSelectionMode | undefined;
  selectedKeys?: Iterable<ActionGroupKey> | undefined;
  defaultSelectedKeys?: Iterable<ActionGroupKey> | undefined;
  disabledKeys?: Iterable<ActionGroupKey> | undefined;
  isDisabled?: boolean | undefined;
  isEmphasized?: boolean | undefined;
  isQuiet?: boolean | undefined;
  staticColor?: "white" | "black" | undefined;
  isJustified?: boolean | undefined;
  density?: ActionGroupDensity | undefined;
  orientation?: ActionGroupOrientation | undefined;
  overflowMode?: ActionGroupOverflowMode | undefined;
  buttonLabelBehavior?: ActionGroupButtonLabelBehavior | undefined;
  onAction?: ((key: ActionGroupKey) => void) | undefined;
  onSelectionChange?: ((keys: Set<ActionGroupKey>) => void) | undefined;
  ariaLabel?: string | undefined;
  ariaLabelledby?: string | undefined;
  slot?: string | undefined;
  UNSAFE_className?: string | undefined;
  UNSAFE_style?: Record<string, string | number> | undefined;
}

function keyToString(key: ActionGroupKey | undefined): string | undefined {
  if (key === undefined || key === null) {
    return undefined;
  }

  return String(key);
}

function normalizeKeySet(keys: Iterable<ActionGroupKey> | undefined): Set<string> {
  if (!keys) {
    return new Set<string>();
  }

  return new Set(Array.from(keys, (key) => String(key)));
}

function areSetsEqual(first: Set<string>, second: Set<string>): boolean {
  if (first.size !== second.size) {
    return false;
  }

  for (const value of first) {
    if (!second.has(value)) {
      return false;
    }
  }

  return true;
}

function normalizeActionGroupKey(value: unknown, fallback: ActionGroupKey): ActionGroupKey {
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

function parseActionGroupSlotItems(
  nodes: VNode[] | undefined
): SpectrumActionGroupItemData[] {
  if (!nodes || nodes.length === 0) {
    return [];
  }

  const flattened = flattenVNodeChildren(nodes);
  const parsedItems: SpectrumActionGroupItemData[] = [];
  let itemIndex = 0;

  for (const node of flattened) {
    if (getComponentName(node) !== "ActionGroupItem") {
      continue;
    }

    const nodeProps = (node.props ?? {}) as Record<string, unknown>;
    const slotLabel = extractTextContent(getSlotContent(node)).trim();
    const key = normalizeActionGroupKey(node.key ?? nodeProps.id, `item-${itemIndex}`);

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

function areItemArraysEqual(
  left: SpectrumActionGroupItemData[],
  right: SpectrumActionGroupItemData[]
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

function createStaticActionGroupComponent(name: string, props: Record<string, unknown>) {
  return defineComponent({
    name,
    props: props as any,
    setup() {
      return () => null;
    },
  });
}

export const ActionGroupItem = createStaticActionGroupComponent("ActionGroupItem", {
  id: {
    type: [String, Number] as PropType<ActionGroupKey | undefined>,
    default: undefined,
  },
  "aria-label": {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  isDisabled: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined,
  },
});

export const ActionGroup = defineComponent({
  name: "ActionGroup",
  inheritAttrs: false,
  props: {
    id: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    items: {
      type: Array as PropType<SpectrumActionGroupItemData[] | undefined>,
      default: undefined,
    },
    selectionMode: {
      type: String as PropType<ActionGroupSelectionMode | undefined>,
      default: undefined,
    },
    selectedKeys: {
      type: [Array, Set] as unknown as PropType<Iterable<ActionGroupKey> | undefined>,
      default: undefined,
    },
    defaultSelectedKeys: {
      type: [Array, Set] as unknown as PropType<Iterable<ActionGroupKey> | undefined>,
      default: undefined,
    },
    disabledKeys: {
      type: [Array, Set] as unknown as PropType<Iterable<ActionGroupKey> | undefined>,
      default: undefined,
    },
    isDisabled: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    isEmphasized: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    isQuiet: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    staticColor: {
      type: String as PropType<"white" | "black" | undefined>,
      default: undefined,
    },
    isJustified: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    density: {
      type: String as PropType<ActionGroupDensity | undefined>,
      default: undefined,
    },
    orientation: {
      type: String as PropType<ActionGroupOrientation | undefined>,
      default: undefined,
    },
    overflowMode: {
      type: String as PropType<ActionGroupOverflowMode | undefined>,
      default: undefined,
    },
    buttonLabelBehavior: {
      type: String as PropType<ActionGroupButtonLabelBehavior | undefined>,
      default: undefined,
    },
    onAction: {
      type: Function as PropType<((key: ActionGroupKey) => void) | undefined>,
      default: undefined,
    },
    onSelectionChange: {
      type: Function as PropType<((keys: Set<ActionGroupKey>) => void) | undefined>,
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
    const rootRef = ref<HTMLElement | null>(null);
    const itemRefs = new Map<string, ActionButtonHandle | null>();
    const slotItems = ref<SpectrumActionGroupItemData[]>([]);

    const resolvedProviderProps = computed(() =>
      useProviderProps(props as unknown as Record<string, unknown>)
    );

    const items = computed<SpectrumActionGroupItemData[]>(
      () => props.items ?? slotItems.value
    );
    const keyMap = computed(() => {
      const map = new Map<string, ActionGroupKey>();
      for (const item of items.value) {
        map.set(String(item.key), item.key);
      }

      return map;
    });

    const selectionMode = computed<ActionGroupSelectionMode>(
      () => props.selectionMode ?? "none"
    );
    const orientation = computed<ActionGroupOrientation>(
      () => props.orientation ?? "horizontal"
    );
    const density = computed<ActionGroupDensity>(() => props.density ?? "regular");

    const isDisabled = computed(
      () =>
        Boolean(
          (resolvedProviderProps.value.isDisabled as boolean | undefined) ?? props.isDisabled
        )
    );

    const isQuiet = computed(
      () =>
        Boolean((resolvedProviderProps.value.isQuiet as boolean | undefined) ?? props.isQuiet)
    );

    const disabledKeys = computed(() => normalizeKeySet(props.disabledKeys));

    const uncontrolledSelectedKeys = ref<Set<string>>(
      normalizeKeySet(props.defaultSelectedKeys)
    );

    const selectedKeys = computed<Set<string>>(() =>
      props.selectedKeys !== undefined
        ? normalizeKeySet(props.selectedKeys)
        : uncontrolledSelectedKeys.value
    );

    const focusedKey = ref<string | null>(null);
    const visibleItemCount = ref<number>(items.value.length);
    const measuredItemWidths = ref<number[]>([]);
    const collapseButtonText = ref<boolean>(false);
    const collapsedAtWidth = ref<number | null>(null);

    const isItemDisabled = (item: SpectrumActionGroupItemData): boolean =>
      Boolean(isDisabled.value || item.isDisabled || disabledKeys.value.has(String(item.key)));

    const shouldOverflowCollapse = computed(
      () => props.overflowMode === "collapse" && orientation.value === "horizontal"
    );
    const hideButtonText = computed(
      () => props.buttonLabelBehavior === "hide" || collapseButtonText.value
    );
    const visibleItems = computed(() =>
      shouldOverflowCollapse.value
        ? items.value.slice(0, visibleItemCount.value)
        : items.value
    );
    const overflowItems = computed(() =>
      shouldOverflowCollapse.value
        ? items.value.slice(visibleItemCount.value)
        : []
    );

    const enabledItemKeys = computed(() =>
      visibleItems.value
        .filter((item) => !isItemDisabled(item))
        .map((item) => String(item.key))
    );

    const coerceExternalSelection = (nextSelection: Set<string>): Set<ActionGroupKey> => {
      const coerced = new Set<ActionGroupKey>();
      for (const key of nextSelection) {
        coerced.add(keyMap.value.get(key) ?? key);
      }
      return coerced;
    };

    const commitSelection = (nextSelection: Set<string>) => {
      if (areSetsEqual(nextSelection, selectedKeys.value)) {
        return;
      }

      if (props.selectedKeys === undefined) {
        uncontrolledSelectedKeys.value = nextSelection;
      }

      props.onSelectionChange?.(coerceExternalSelection(nextSelection));
    };

    const selectKey = (itemKey: string) => {
      if (selectionMode.value === "none") {
        return;
      }

      if (selectionMode.value === "single") {
        commitSelection(new Set([itemKey]));
        return;
      }

      const nextSelection = new Set(selectedKeys.value);
      if (nextSelection.has(itemKey)) {
        nextSelection.delete(itemKey);
      } else {
        nextSelection.add(itemKey);
      }

      commitSelection(nextSelection);
    };

    const focusKey = (itemKey: string | null) => {
      if (!itemKey) {
        return;
      }

      focusedKey.value = itemKey;
      itemRefs.get(itemKey)?.focus?.();
    };

    const moveFocus = (direction: 1 | -1) => {
      const keys = enabledItemKeys.value;
      if (keys.length === 0) {
        return;
      }

      const currentKey = focusedKey.value;
      const currentIndex = currentKey ? keys.indexOf(currentKey) : -1;
      const startIndex = currentIndex === -1 ? 0 : currentIndex;
      const nextIndex = (startIndex + direction + keys.length) % keys.length;
      focusKey(keys[nextIndex] ?? null);
    };

    const updateOverflow = () => {
      if (!shouldOverflowCollapse.value) {
        visibleItemCount.value = items.value.length;
        measuredItemWidths.value = [];
        collapseButtonText.value = false;
        collapsedAtWidth.value = null;
        return;
      }

      const root = rootRef.value;
      if (!root || items.value.length === 0) {
        visibleItemCount.value = items.value.length;
        return;
      }

      if (props.buttonLabelBehavior !== "collapse") {
        collapseButtonText.value = false;
        collapsedAtWidth.value = null;
      }

      const containerWidth = root.clientWidth;
      if (
        props.buttonLabelBehavior === "collapse" &&
        collapseButtonText.value &&
        collapsedAtWidth.value !== null &&
        containerWidth > collapsedAtWidth.value
      ) {
        collapseButtonText.value = false;
        collapsedAtWidth.value = null;
        measuredItemWidths.value = [];
        void nextTick(() => {
          updateOverflow();
        });
        return;
      }

      if (measuredItemWidths.value.length !== items.value.length) {
        const renderedButtons = Array.from(
          root.querySelectorAll<HTMLElement>(".spectrum-ActionButton")
        );
        if (renderedButtons.length >= items.value.length) {
          measuredItemWidths.value = renderedButtons
            .slice(0, items.value.length)
            .map((button) => button.offsetWidth);
        }
      }

      const widths = measuredItemWidths.value;
      if (widths.length !== items.value.length) {
        return;
      }

      const totalItemWidth = widths.reduce((sum, width) => sum + width, 0);
      if (totalItemWidth <= containerWidth) {
        visibleItemCount.value = items.value.length;
        return;
      }

      if (props.buttonLabelBehavior === "collapse" && !collapseButtonText.value) {
        collapseButtonText.value = true;
        collapsedAtWidth.value = containerWidth;
        measuredItemWidths.value = [];
        visibleItemCount.value = items.value.length;
        void nextTick(() => {
          updateOverflow();
        });
        return;
      }

      const measuredMenuButton = root.querySelector<HTMLElement>(
        ".spectrum-ActionMenu .spectrum-ActionButton"
      );
      const overflowButtonWidth = measuredMenuButton?.offsetWidth ?? 40;

      let nextVisibleCount = 0;
      let consumedWidth = 0;
      for (const width of widths) {
        if (consumedWidth + width + overflowButtonWidth <= containerWidth) {
          consumedWidth += width;
          nextVisibleCount += 1;
          continue;
        }
        break;
      }

      if (selectionMode.value !== "none" && nextVisibleCount < items.value.length) {
        nextVisibleCount = 0;
      }

      visibleItemCount.value = nextVisibleCount;
    };

    watch(
      enabledItemKeys,
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
        () => items.value.length,
        () => props.overflowMode,
        () => props.buttonLabelBehavior,
        () => orientation.value,
        () => selectionMode.value,
      ],
      () => {
        visibleItemCount.value = items.value.length;
        measuredItemWidths.value = [];
        collapseButtonText.value = false;
        collapsedAtWidth.value = null;
        void nextTick(() => {
          updateOverflow();
        });
      },
      { immediate: true }
    );

    useResizeObserver({
      ref: rootRef,
      onResize: updateOverflow,
    });

    onMounted(() => {
      if (typeof window !== "undefined") {
        window.addEventListener("resize", updateOverflow);
      }

      void nextTick(() => {
        updateOverflow();
      });
    });

    onBeforeUnmount(() => {
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", updateOverflow);
      }
    });

    expose({
      UNSAFE_getDOMNode: () => rootRef.value,
    });

    return () => {
      if (!props.items) {
        const parsedItems = parseActionGroupSlotItems(
          slots.default?.() as VNode[] | undefined
        );
        if (!areItemArraysEqual(parsedItems, slotItems.value)) {
          slotItems.value = parsedItems;
        }
      }

      const attrsRecord = attrs as Record<string, unknown>;
      const styleInput: Record<string, unknown> = {
        ...attrsRecord,
        UNSAFE_className: props.UNSAFE_className,
        UNSAFE_style: props.UNSAFE_style,
      };
      const { styleProps } = useStyleProps(styleInput);

      const domProps = filterDOMProps(attrsRecord);
      const isVertical = orientation.value === "vertical";
      const role = selectionMode.value === "single" ? "radiogroup" : "toolbar";
      const propsRecord = props as unknown as Record<string, unknown>;
      const ariaLabel =
        props.ariaLabel ??
        (propsRecord["aria-label"] as string | undefined) ??
        (propsRecord.ariaLabel as string | undefined) ??
        (attrsRecord["aria-label"] as string | undefined) ??
        (attrsRecord.ariaLabel as string | undefined);
      const ariaLabelledby =
        props.ariaLabelledby ??
        (propsRecord["aria-labelledby"] as string | undefined) ??
        (propsRecord.ariaLabelledby as string | undefined) ??
        (attrsRecord["aria-labelledby"] as string | undefined) ??
        (attrsRecord.ariaLabelledby as string | undefined);
      const hasOverflowMenu = overflowItems.value.length > 0;
      const collapseToMenuOnly =
        shouldOverflowCollapse.value && hasOverflowMenu && visibleItems.value.length === 0;
      const overflowMenuItems = overflowItems.value.map((item) => ({
        key: item.key,
        label: item.label,
        isDisabled: isItemDisabled(item),
        "aria-label": item["aria-label"],
      }));

      return h(
        "div",
        {
          ...domProps,
          id: props.id,
          ref: (value: unknown) => {
            rootRef.value = value as HTMLElement | null;
          },
          role: collapseToMenuOnly ? undefined : role,
          "aria-disabled":
            collapseToMenuOnly || !isDisabled.value ? undefined : "true",
          "aria-label": collapseToMenuOnly ? undefined : ariaLabel,
          "aria-labelledby": collapseToMenuOnly ? undefined : ariaLabelledby,
          "aria-orientation":
            collapseToMenuOnly || !isVertical ? undefined : "vertical",
          class: classNames(
            "spectrum-ActionGroup",
            {
              "spectrum-ActionGroup--quiet": isQuiet.value,
              "spectrum-ActionGroup--vertical": isVertical,
              "spectrum-ActionGroup--compact": density.value === "compact",
              "spectrum-ActionGroup--justified": Boolean(props.isJustified),
              "spectrum-ActionGroup--overflowCollapse":
                props.overflowMode === "collapse",
            },
            styleProps.class as ClassValue | undefined,
            domProps.class as ClassValue | undefined,
            props.UNSAFE_className as ClassValue | undefined
          ),
          style: {
            ...(styleProps.style ?? {}),
            ...(props.UNSAFE_style ?? {}),
          },
          onKeydown: (event: KeyboardEvent) => {
            if (enabledItemKeys.value.length === 0) {
              return;
            }

            let handled = true;
            const isRTL = locale.value.direction === "rtl";

            switch (event.key) {
              case "ArrowRight":
                moveFocus(
                  isVertical
                    ? 1
                    : isRTL
                      ? -1
                      : 1
                );
                break;
              case "ArrowLeft":
                moveFocus(
                  isVertical
                    ? -1
                    : isRTL
                      ? 1
                      : -1
                );
                break;
              case "ArrowDown":
                moveFocus(1);
                break;
              case "ArrowUp":
                moveFocus(-1);
                break;
              case "Home":
                focusKey(enabledItemKeys.value[0] ?? null);
                break;
              case "End":
                focusKey(
                  enabledItemKeys.value[enabledItemKeys.value.length - 1] ?? null
                );
                break;
              default:
                handled = false;
                break;
            }

            if (!handled) {
              return;
            }

            event.preventDefault();
            event.stopPropagation();
          },
        },
        visibleItems.value
          .map((item) => {
            const itemKey = String(item.key);
            const selected = selectedKeys.value.has(itemKey);
            const disabled = isItemDisabled(item);

            return h(
              ActionButton,
              {
                key: itemKey,
                ref: (value: unknown) => {
                  if (!value) {
                    itemRefs.delete(itemKey);
                    return;
                  }

                  itemRefs.set(itemKey, value as ActionButtonHandle);
                },
                role:
                  selectionMode.value === "single"
                    ? "radio"
                    : selectionMode.value === "multiple"
                      ? "checkbox"
                      : undefined,
                "aria-checked":
                  selectionMode.value === "none" ? undefined : String(selected),
                "aria-label":
                  item["aria-label"] ?? (hideButtonText.value ? item.label : undefined),
                tabindex: focusedKey.value === itemKey ? 0 : -1,
                isDisabled: disabled,
                isQuiet: isQuiet.value,
                staticColor: props.staticColor,
                UNSAFE_className: classNames(
                  "spectrum-ActionGroup-item",
                  {
                    "is-selected": selected,
                    "is-disabled": disabled,
                    "spectrum-ActionGroup-item--iconOnly": hideButtonText.value,
                    "spectrum-ActionButton--emphasized": Boolean(props.isEmphasized),
                  }
                ),
                onFocus: () => {
                  focusedKey.value = itemKey;
                },
                onPress: () => {
                  if (disabled) {
                    return;
                  }

                  selectKey(itemKey);
                  props.onAction?.(item.key);
                },
              },
              {
                default: () =>
                  hideButtonText.value
                    ? h("span", { style: SCREEN_READER_ONLY_STYLE }, item.label)
                    : item.label,
              }
            );
          })
          .concat(
            hasOverflowMenu
              ? [
                  h(ActionMenu, {
                    key: "__overflow_menu__",
                    items: overflowMenuItems,
                    selectionMode:
                      selectionMode.value === "none" ? undefined : selectionMode.value,
                    selectedKeys: selectedKeys.value,
                    disabledKeys: disabledKeys.value,
                    isDisabled: isDisabled.value,
                    triggerLabel: "More",
                    triggerAriaLabel:
                      collapseToMenuOnly
                        ? (ariaLabelledby ? undefined : ariaLabel ?? "More actions")
                        : "More actions",
                    triggerAriaLabelledby:
                      collapseToMenuOnly ? ariaLabelledby : undefined,
                    UNSAFE_className: classNames(
                      "spectrum-ActionGroup-item",
                      "spectrum-ActionGroup-menu"
                    ),
                    onAction: (key: ActionGroupKey) => {
                      const originalKey = keyMap.value.get(String(key)) ?? key;
                      props.onAction?.(originalKey);
                    },
                    onSelectionChange: (keys: Set<ActionGroupKey>) => {
                      if (selectionMode.value === "none") {
                        return;
                      }

                      const normalized = new Set(
                        Array.from(keys, (key) => String(key))
                      );
                      commitSelection(normalized);
                    },
                  }),
                ]
              : []
          )
      );
    };
  },
});
