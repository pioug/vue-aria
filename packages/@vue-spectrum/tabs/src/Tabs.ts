import {
  Fragment,
  computed,
  defineComponent,
  h,
  inject,
  isVNode,
  provide,
  ref,
  type ComputedRef,
  type InjectionKey,
  type PropType,
  type VNode,
  type VNodeChild,
} from "vue";
import type { Key } from "@vue-aria/collections";
import { Item } from "./Item";

export type TabsOrientation = "horizontal" | "vertical";
export type TabsKeyboardActivation = "automatic" | "manual";
export type TabsDensity = "regular" | "compact";

export interface SpectrumTabItem {
  key?: Key;
  title?: string;
  children?: unknown;
  isDisabled?: boolean;
  href?: string;
  "aria-label"?: string;
}

export interface SpectrumTabsProps {
  items?: SpectrumTabItem[];
  orientation?: TabsOrientation;
  keyboardActivation?: TabsKeyboardActivation;
  selectedKey?: Key | null;
  defaultSelectedKey?: Key | null;
  disabledKeys?: Iterable<Key>;
  isDisabled?: boolean;
  onSelectionChange?: (key: Key) => void;
  density?: TabsDensity;
  isQuiet?: boolean;
  isEmphasized?: boolean;
  ariaLabel?: string;
  ariaLabelledby?: string;
  UNSAFE_className?: string;
  UNSAFE_style?: Record<string, unknown>;
}

export interface SpectrumTabListProps {
  UNSAFE_className?: string;
  UNSAFE_style?: Record<string, unknown>;
}

export interface SpectrumTabPanelsProps {
  UNSAFE_className?: string;
  UNSAFE_style?: Record<string, unknown>;
}

interface TabsContextValue {
  items: SpectrumTabItem[];
  selectedKey: ComputedRef<Key | null>;
  setSelectedKey: (key: Key) => void;
  orientation: TabsOrientation;
  keyboardActivation: TabsKeyboardActivation;
  isQuiet: boolean;
  isEmphasized: boolean;
  density: TabsDensity;
  isDisabled: boolean;
  disabledKeys: Set<Key>;
  tabId: (key: Key) => string;
  panelId: (key: Key) => string;
}

const tabsContextKey: InjectionKey<TabsContextValue> = Symbol("spectrum-tabs-context");

function useTabsContext(componentName: string): TabsContextValue {
  const context = inject(tabsContextKey, null);
  if (!context) {
    throw new Error(`${componentName} must be used within Tabs.`);
  }

  return context;
}

function isRenderableNode(node: VNode): boolean {
  return typeof node.type !== "symbol";
}

function getComponentName(node: VNode): string | undefined {
  if (typeof node.type === "symbol") {
    return undefined;
  }

  if (typeof node.type === "string") {
    return node.type;
  }

  return (node.type as { name?: string }).name;
}

function flattenVNodeChildren(input: unknown): VNode[] {
  if (input == null) {
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

function getSlotChildren(node: VNode): VNode[] {
  if (Array.isArray(node.children)) {
    return flattenVNodeChildren(node.children);
  }

  if (node.children && typeof node.children === "object") {
    const slot = (node.children as { default?: () => unknown }).default;
    if (typeof slot === "function") {
      return flattenVNodeChildren(slot());
    }
  }

  return [];
}

function getSlotContent(node: VNode): VNodeChild | undefined {
  if (Array.isArray(node.children)) {
    return node.children as VNodeChild;
  }

  if (node.children && typeof node.children === "object") {
    const slot = (node.children as { default?: () => unknown }).default;
    if (typeof slot === "function") {
      return slot() as VNodeChild;
    }
  }

  if (typeof node.children === "string") {
    return node.children;
  }

  return undefined;
}

function extractTextContent(value: unknown): string {
  if (value == null) {
    return "";
  }

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map((entry) => extractTextContent(entry)).join("");
  }

  if (!isVNode(value)) {
    return "";
  }

  if (typeof value.children === "string") {
    return value.children;
  }

  if (Array.isArray(value.children)) {
    return extractTextContent(value.children);
  }

  if (value.children && typeof value.children === "object") {
    const slot = (value.children as { default?: () => unknown }).default;
    if (typeof slot === "function") {
      return extractTextContent(slot());
    }
  }

  return "";
}

function normalizeKey(value: unknown, fallback: Key): Key {
  if (typeof value === "string" || typeof value === "number") {
    return value;
  }

  return fallback;
}

function normalizeItems(items: SpectrumTabItem[] | undefined): SpectrumTabItem[] {
  if (!items) {
    return [];
  }

  return items.map((item, index) => ({
    ...item,
    key: item.key ?? `tab-${index + 1}`,
    title: item.title ?? String(item.key ?? `tab-${index + 1}`),
  }));
}

function parseStaticItems(nodes: VNode[]): SpectrumTabItem[] {
  if (nodes.length === 0) {
    return [];
  }

  const tabListNode = nodes.find((node) => getComponentName(node) === "SpectrumTabList");
  const tabPanelsNode = nodes.find((node) => getComponentName(node) === "SpectrumTabPanels");

  const listItems = (tabListNode ? getSlotChildren(tabListNode) : []).filter((node) => {
    const component = node.type as any;
    return component === Item || component?.__spectrumTabsNodeType === "item";
  });
  const panelItems = (tabPanelsNode ? getSlotChildren(tabPanelsNode) : []).filter((node) => {
    const component = node.type as any;
    return component === Item || component?.__spectrumTabsNodeType === "item";
  });

  const tabs = listItems.map((node, index) => {
    const props = (node.props ?? {}) as Record<string, unknown>;
    const key = normalizeKey(node.key ?? props.id, `tab-${index + 1}`);
    const titleFromSlot = extractTextContent(getSlotContent(node)).trim();

    return {
      key,
      title: (props.title as string | undefined) ?? titleFromSlot ?? String(key),
      isDisabled: Boolean(props.isDisabled),
      href: props.href as string | undefined,
      "aria-label": (props["aria-label"] ?? props.ariaLabel) as string | undefined,
    } as SpectrumTabItem;
  });

  const panels = panelItems.map((node, index) => {
    const props = (node.props ?? {}) as Record<string, unknown>;
    const key = normalizeKey(node.key ?? props.id, tabs[index]?.key ?? `tab-${index + 1}`);
    return {
      key,
      title: props.title as string | undefined,
      children: getSlotContent(node),
    };
  });

  if (tabs.length === 0 && panels.length > 0) {
    return panels.map((panel, index) => ({
      key: panel.key ?? `tab-${index + 1}`,
      title: panel.title ?? (extractTextContent(panel.children).trim() || String(panel.key)),
      children: panel.children,
    }));
  }

  return tabs.map((tab, index) => ({
    ...tab,
    children: panels.find((panel) => panel.key === tab.key)?.children ?? panels[index]?.children,
  }));
}

function findTabIndexByKey(items: SpectrumTabItem[], key: Key | null): number {
  if (key == null) {
    return -1;
  }

  return items.findIndex((item) => item.key === key);
}

function findEnabledIndex(
  items: SpectrumTabItem[],
  startIndex: number,
  direction: 1 | -1,
  disabledKeys: Set<Key>,
  isDisabled: boolean
): number {
  if (items.length === 0 || isDisabled) {
    return startIndex;
  }

  let index = startIndex;
  for (let step = 0; step < items.length; step += 1) {
    index = (index + direction + items.length) % items.length;
    const item = items[index];
    if (!item) {
      continue;
    }

    if (item.isDisabled || disabledKeys.has(item.key as Key)) {
      continue;
    }

    return index;
  }

  return startIndex;
}

function firstEnabledKey(items: SpectrumTabItem[], disabledKeys: Set<Key>): Key | null {
  for (const item of items) {
    if (item.key == null) {
      continue;
    }

    if (item.isDisabled || disabledKeys.has(item.key)) {
      continue;
    }

    return item.key;
  }

  return null;
}

const TabButton = defineComponent({
  name: "SpectrumTabButton",
  props: {
    item: {
      type: Object as PropType<SpectrumTabItem>,
      required: true,
    },
  },
  setup(props) {
    const context = useTabsContext("TabList");

    return () => {
      const key = props.item.key as Key;
      const selected = context.selectedKey.value === key;
      const disabled = context.isDisabled || Boolean(props.item.isDisabled || context.disabledKeys.has(key));
      const ElementType = props.item.href ? "a" : "div";

      return h(
        ElementType,
        {
          id: context.tabId(key),
          role: "tab",
          href: props.item.href,
          tabIndex: selected && !disabled ? 0 : -1,
          "aria-selected": selected,
          "aria-disabled": disabled || undefined,
          "aria-controls": selected ? context.panelId(key) : undefined,
          class: [
            "spectrum-Tabs-item",
            {
              "is-selected": selected,
              "is-disabled": disabled,
              "spectrum-Tabs-item--quiet": context.isQuiet,
              "spectrum-Tabs-item--compact": context.density === "compact",
            },
          ],
          onClick: () => {
            if (!disabled) {
              context.setSelectedKey(key);
            }
          },
          onKeydown: (event: KeyboardEvent) => {
            if (disabled) {
              return;
            }

            const index = findTabIndexByKey(context.items, key);
            if (index < 0) {
              return;
            }

            const isHorizontal = context.orientation === "horizontal";
            let nextIndex = index;

            if ((isHorizontal && event.key === "ArrowRight") || (!isHorizontal && event.key === "ArrowDown")) {
              nextIndex = findEnabledIndex(context.items, index, 1, context.disabledKeys, context.isDisabled);
            } else if ((isHorizontal && event.key === "ArrowLeft") || (!isHorizontal && event.key === "ArrowUp")) {
              nextIndex = findEnabledIndex(context.items, index, -1, context.disabledKeys, context.isDisabled);
            } else if (event.key === "Home") {
              nextIndex = findEnabledIndex(context.items, -1, 1, context.disabledKeys, context.isDisabled);
            } else if (event.key === "End") {
              nextIndex = findEnabledIndex(context.items, 0, -1, context.disabledKeys, context.isDisabled);
            } else if (event.key === "Enter" || event.key === " ") {
              context.setSelectedKey(key);
              event.preventDefault();
              return;
            } else {
              return;
            }

            const next = context.items[nextIndex];
            if (!next || next.key == null) {
              return;
            }

            const nextElement = document.getElementById(context.tabId(next.key));
            nextElement?.focus();

            if (context.keyboardActivation === "automatic") {
              context.setSelectedKey(next.key);
            }

            event.preventDefault();
          },
        },
        props.item.title ?? String(props.item.key)
      );
    };
  },
});

export const TabList = defineComponent({
  name: "SpectrumTabList",
  props: {
    UNSAFE_className: {
      type: String as PropType<SpectrumTabListProps["UNSAFE_className"]>,
      required: false,
    },
    UNSAFE_style: {
      type: Object as PropType<SpectrumTabListProps["UNSAFE_style"]>,
      required: false,
    },
  },
  setup(props) {
    const context = useTabsContext("TabList");

    return () =>
      h(
        "div",
        {
          role: "tablist",
          "aria-orientation": context.orientation,
          class: [
            "spectrum-Tabs",
            {
              "spectrum-Tabs--vertical": context.orientation === "vertical",
              "spectrum-Tabs--quiet": context.isQuiet,
              "spectrum-Tabs--compact": context.density === "compact",
              "spectrum-Tabs--emphasized": context.isEmphasized,
            },
            props.UNSAFE_className,
          ],
          style: props.UNSAFE_style,
        },
        context.items.map((item) =>
          h(TabButton as any, {
            key: String(item.key),
            item,
          })
        )
      );
  },
});

export const TabPanels = defineComponent({
  name: "SpectrumTabPanels",
  props: {
    UNSAFE_className: {
      type: String as PropType<SpectrumTabPanelsProps["UNSAFE_className"]>,
      required: false,
    },
    UNSAFE_style: {
      type: Object as PropType<SpectrumTabPanelsProps["UNSAFE_style"]>,
      required: false,
    },
  },
  setup(props, { slots }) {
    const context = useTabsContext("TabPanels");

    return () => {
      const selected = context.items.find((item) => item.key === context.selectedKey.value) ?? null;
      const content = slots.default?.({ item: selected }) ?? selected?.children;
      const key = selected?.key as Key | undefined;

      return h(
        "div",
        {
          id: key != null ? context.panelId(key) : undefined,
          role: "tabpanel",
          tabIndex: 0,
          "aria-labelledby": key != null ? context.tabId(key) : undefined,
          class: ["spectrum-TabsPanel-tabpanel", props.UNSAFE_className],
          style: props.UNSAFE_style,
        },
        content as any
      );
    };
  },
});

export const Tabs = defineComponent({
  name: "SpectrumTabs",
  inheritAttrs: false,
  props: {
    items: {
      type: Array as PropType<Array<SpectrumTabItem>>,
      required: false,
      default: undefined,
    },
    orientation: {
      type: String as PropType<TabsOrientation | undefined>,
      required: false,
      default: "horizontal",
    },
    keyboardActivation: {
      type: String as PropType<TabsKeyboardActivation | undefined>,
      required: false,
      default: "automatic",
    },
    selectedKey: {
      type: [String, Number] as PropType<Key | null | undefined>,
      required: false,
      default: undefined,
    },
    defaultSelectedKey: {
      type: [String, Number] as PropType<Key | null | undefined>,
      required: false,
      default: undefined,
    },
    disabledKeys: {
      type: Object as PropType<Iterable<Key> | undefined>,
      required: false,
      default: undefined,
    },
    isDisabled: {
      type: Boolean as PropType<boolean | undefined>,
      required: false,
      default: undefined,
    },
    onSelectionChange: {
      type: Function as PropType<SpectrumTabsProps["onSelectionChange"]>,
      required: false,
    },
    density: {
      type: String as PropType<TabsDensity | undefined>,
      required: false,
      default: "regular",
    },
    isQuiet: {
      type: Boolean as PropType<boolean | undefined>,
      required: false,
      default: false,
    },
    isEmphasized: {
      type: Boolean as PropType<boolean | undefined>,
      required: false,
      default: false,
    },
    ariaLabel: {
      type: String,
      required: false,
    },
    ariaLabelledby: {
      type: String,
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
  setup(props, { attrs, slots, expose }) {
    const rootRef = ref<HTMLElement | null>(null);
    const slotChildren = (slots.default?.() ?? []).filter((node): node is VNode => isRenderableNode(node));
    const staticItems = parseStaticItems(slotChildren);
    const items = staticItems.length > 0 ? staticItems : normalizeItems(props.items);
    const disabledKeys = new Set(props.disabledKeys ?? []);
    const defaultSelectedKey = props.defaultSelectedKey ?? firstEnabledKey(items, disabledKeys);
    const uncontrolledSelectedKey = ref<Key | null>(props.selectedKey ?? defaultSelectedKey ?? null);
    const selectedKey = computed<Key | null>(() => props.selectedKey ?? uncontrolledSelectedKey.value ?? null);
    const idBase = `tabs-${Math.random().toString(36).slice(2, 10)}`;

    const setSelectedKey = (key: Key) => {
      const item = items.find((entry) => entry.key === key);
      if (!item) {
        return;
      }

      if (props.isDisabled || item.isDisabled || disabledKeys.has(key)) {
        return;
      }

      if (props.selectedKey === undefined) {
        uncontrolledSelectedKey.value = key;
      }

      props.onSelectionChange?.(key);
    };

    provide(tabsContextKey, {
      items,
      selectedKey,
      setSelectedKey,
      orientation: props.orientation ?? "horizontal",
      keyboardActivation: props.keyboardActivation ?? "automatic",
      isQuiet: Boolean(props.isQuiet),
      isEmphasized: Boolean(props.isEmphasized),
      density: props.density ?? "regular",
      isDisabled: Boolean(props.isDisabled),
      disabledKeys,
      tabId: (key: Key) => `${idBase}-tab-${String(key)}`,
      panelId: (key: Key) => `${idBase}-panel-${String(key)}`,
    });

    expose({
      UNSAFE_getDOMNode: () => rootRef.value,
    });

    return () =>
      h(
        "div",
        {
          ...(attrs as Record<string, unknown>),
          ref: rootRef,
          class: ["spectrum-TabsPanel", props.UNSAFE_className],
          style: props.UNSAFE_style,
        },
        slots.default ? slots.default() : [h(TabList), h(TabPanels)]
      );
  },
});
