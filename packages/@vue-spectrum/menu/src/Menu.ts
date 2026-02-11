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
import { filterDOMProps } from "@vue-aria/utils";
import { classNames, useStyleProps, type ClassValue } from "@vue-spectrum/utils";
import { MenuItem } from "./MenuItem";
import {
  areSetsEqual,
  keyToString,
  normalizeKeySet,
  type MenuKey,
  type SpectrumMenuBaseProps,
  type SpectrumMenuItemData,
  type SpectrumMenuSectionData,
  type SpectrumMenuSelectionMode,
} from "./types";

export interface SpectrumMenuProps extends SpectrumMenuBaseProps {
  id?: string | undefined;
}

export interface SpectrumMenuSectionProps {
  heading?: string | undefined;
  headingId?: string | undefined;
  ariaLabel?: string | undefined;
  showDivider?: boolean | undefined;
}

interface NormalizedSpectrumMenuSection {
  key: string;
  heading?: string | undefined;
  ariaLabel?: string | undefined;
  items: SpectrumMenuItemData[];
  implicit: boolean;
}

function normalizeMenuKey(value: unknown, fallback: MenuKey): MenuKey {
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

function getSlotChildren(node: VNode): VNode[] {
  if (Array.isArray(node.children)) {
    return flattenVNodeChildren(node.children);
  }

  if (node.children && typeof node.children === "object") {
    const maybeDefault = (node.children as { default?: (() => unknown) | undefined })
      .default;
    if (typeof maybeDefault === "function") {
      return flattenVNodeChildren(maybeDefault());
    }
  }

  return [];
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
    const maybeDefault = (value.children as { default?: (() => unknown) | undefined })
      .default;
    if (typeof maybeDefault === "function") {
      return extractTextContent(maybeDefault());
    }
  }

  return "";
}

function parseMenuItemNode(node: VNode, fallback: MenuKey): SpectrumMenuItemData {
  const props = (node.props ?? {}) as Record<string, unknown>;
  const key = normalizeMenuKey(node.key ?? props.id, fallback);
  const slotLabel = extractTextContent(getSlotContent(node)).trim();
  const label = slotLabel || String(key);

  return {
    key,
    label,
    isDisabled: Boolean(props.isDisabled),
    "aria-label":
      typeof props["aria-label"] === "string" ? props["aria-label"] : undefined,
  };
}

function parseMenuSlotData(
  nodes: VNode[] | undefined
): {
  items: SpectrumMenuItemData[];
  sections: SpectrumMenuSectionData[];
} {
  if (!nodes || nodes.length === 0) {
    return {
      items: [],
      sections: [],
    };
  }

  const topLevel = flattenVNodeChildren(nodes);
  const items: SpectrumMenuItemData[] = [];
  const sections: SpectrumMenuSectionData[] = [];
  let itemIndex = 0;
  let sectionIndex = 0;

  for (const node of topLevel) {
    const componentName = getComponentName(node);
    if (componentName === "MenuItem") {
      items.push(parseMenuItemNode(node, `item-${itemIndex + 1}`));
      itemIndex += 1;
      continue;
    }

    if (componentName === "MenuSection") {
      const sectionProps = (node.props ?? {}) as Record<string, unknown>;
      const sectionNodes = getSlotChildren(node).filter(
        (child) => getComponentName(child) === "MenuItem"
      );
      const sectionItems = sectionNodes.map((child) => {
        const parsed = parseMenuItemNode(child, `item-${itemIndex + 1}`);
        itemIndex += 1;
        return parsed;
      });

      sections.push({
        key: normalizeMenuKey(node.key ?? sectionProps.id, `section-${sectionIndex + 1}`),
        heading:
          typeof sectionProps.heading === "string" ? sectionProps.heading : undefined,
        "aria-label":
          typeof sectionProps["aria-label"] === "string"
            ? sectionProps["aria-label"]
            : typeof sectionProps.ariaLabel === "string"
              ? sectionProps.ariaLabel
              : undefined,
        items: sectionItems,
      });
      sectionIndex += 1;
    }
  }

  return {
    items,
    sections,
  };
}

function areMenuItemsEqual(
  left: SpectrumMenuItemData[],
  right: SpectrumMenuItemData[]
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
      current.isDisabled !== candidate.isDisabled ||
      current["aria-label"] !== candidate["aria-label"]
    ) {
      return false;
    }
  }

  return true;
}

function areMenuSectionsEqual(
  left: SpectrumMenuSectionData[],
  right: SpectrumMenuSectionData[]
): boolean {
  if (left.length !== right.length) {
    return false;
  }

  for (let index = 0; index < left.length; index += 1) {
    const current = left[index];
    const candidate = right[index];
    if (
      current.key !== candidate.key ||
      current.heading !== candidate.heading ||
      current["aria-label"] !== candidate["aria-label"] ||
      !areMenuItemsEqual(current.items, candidate.items)
    ) {
      return false;
    }
  }

  return true;
}

export const MenuSection = defineComponent({
  name: "MenuSection",
  props: {
    heading: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    headingId: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    ariaLabel: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    showDivider: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
  },
  setup(props, { slots }) {
    return () =>
      h("li", { role: "presentation", class: classNames("spectrum-Menu-section") }, [
        props.showDivider
          ? h("div", {
              role: "presentation",
              class: classNames("spectrum-Menu-divider"),
            })
          : null,
        props.heading
          ? h(
              "div",
              {
                id: props.headingId,
                class: classNames("spectrum-Menu-sectionHeading"),
              },
              props.heading
            )
          : null,
        h(
          "ul",
          {
            role: "group",
            "aria-label": props.ariaLabel,
            "aria-labelledby": props.headingId,
            class: classNames("spectrum-Menu"),
          },
          slots.default?.()
        ),
      ]);
  },
});

export const Menu = defineComponent({
  name: "Menu",
  inheritAttrs: false,
  props: {
    id: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    items: {
      type: Array as PropType<SpectrumMenuItemData[] | undefined>,
      default: undefined,
    },
    sections: {
      type: Array as PropType<SpectrumMenuSectionData[] | undefined>,
      default: undefined,
    },
    selectionMode: {
      type: String as PropType<SpectrumMenuSelectionMode | undefined>,
      default: undefined,
    },
    selectedKeys: {
      type: [Array, Set] as unknown as PropType<Iterable<MenuKey> | undefined>,
      default: undefined,
    },
    defaultSelectedKeys: {
      type: [Array, Set] as unknown as PropType<Iterable<MenuKey> | undefined>,
      default: undefined,
    },
    disabledKeys: {
      type: [Array, Set] as unknown as PropType<Iterable<MenuKey> | undefined>,
      default: undefined,
    },
    isDisabled: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    closeOnSelect: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    shouldFocusWrap: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    autoFocus: {
      type: [Boolean, String] as PropType<true | "first" | "last" | undefined>,
      default: undefined,
    },
    onAction: {
      type: Function as PropType<((key: MenuKey) => void) | undefined>,
      default: undefined,
    },
    onSelectionChange: {
      type: Function as PropType<((keys: Set<MenuKey>) => void) | undefined>,
      default: undefined,
    },
    onClose: {
      type: Function as PropType<(() => void) | undefined>,
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
    const rootRef = ref<HTMLUListElement | null>(null);
    const itemRefs = new Map<string, HTMLLIElement>();
    const slotItems = ref<SpectrumMenuItemData[]>([]);
    const slotSections = ref<SpectrumMenuSectionData[]>([]);

    const sections = computed<NormalizedSpectrumMenuSection[]>(() => {
      if (props.sections && props.sections.length > 0) {
        return props.sections.map((section, index) => ({
          key: String(section.key ?? `section-${index}`),
          heading: section.heading,
          ariaLabel: section["aria-label"],
          items: section.items ?? [],
          implicit: false,
        }));
      }

      if (props.items && props.items.length > 0) {
        return [
          {
            key: "default",
            items: props.items,
            implicit: true,
          },
        ];
      }

      if (slotSections.value.length > 0) {
        const normalizedSections = slotSections.value.map((section, index) => ({
          key: String(section.key ?? `section-${index}`),
          heading: section.heading,
          ariaLabel: section["aria-label"],
          items: section.items ?? [],
          implicit: false,
        }));

        if (slotItems.value.length === 0) {
          return normalizedSections;
        }

        return [
          {
            key: "default",
            items: slotItems.value,
            implicit: true,
          },
          ...normalizedSections,
        ];
      }

      return [
        {
          key: "default",
          items: slotItems.value,
          implicit: true,
        },
      ];
    });

    const items = computed<SpectrumMenuItemData[]>(() =>
      sections.value.flatMap((section) => section.items)
    );
    const selectionMode = computed<SpectrumMenuSelectionMode>(
      () => props.selectionMode ?? "none"
    );

    const keyMap = computed(() => {
      const map = new Map<string, MenuKey>();
      for (const item of items.value) {
        map.set(String(item.key), item.key);
      }
      return map;
    });

    const disabledKeys = computed(() => normalizeKeySet(props.disabledKeys));
    const isItemDisabled = (item: SpectrumMenuItemData): boolean =>
      Boolean(props.isDisabled || item.isDisabled || disabledKeys.value.has(String(item.key)));

    const uncontrolledSelectedKeys = ref<Set<string>>(
      normalizeKeySet(props.defaultSelectedKeys)
    );

    const selectedKeys = computed<Set<string>>(() =>
      props.selectedKeys !== undefined
        ? normalizeKeySet(props.selectedKeys)
        : uncontrolledSelectedKeys.value
    );

    const focusedKey = ref<string | null>(null);

    const enabledKeys = computed(() =>
      items.value
        .filter((item) => !isItemDisabled(item))
        .map((item) => String(item.key))
    );

    const setFocusedKey = (key: string | null, shouldMoveFocus = true) => {
      focusedKey.value = key;
      if (!shouldMoveFocus || !key) {
        return;
      }

      void nextTick(() => {
        itemRefs.get(key)?.focus();
      });
    };

    const getNextKey = (offset: 1 | -1): string | null => {
      const keys = enabledKeys.value;
      if (keys.length === 0) {
        return null;
      }

      const currentIndex = focusedKey.value ? keys.indexOf(focusedKey.value) : -1;
      if (currentIndex === -1) {
        return keys[0] ?? null;
      }

      const nextIndex = currentIndex + offset;
      if (nextIndex < 0 || nextIndex >= keys.length) {
        if (!props.shouldFocusWrap) {
          return keys[currentIndex] ?? null;
        }

        return keys[(nextIndex + keys.length) % keys.length] ?? null;
      }

      return keys[nextIndex] ?? null;
    };

    const emitSelectionChange = (nextSelection: Set<string>) => {
      if (areSetsEqual(nextSelection, selectedKeys.value)) {
        return;
      }

      if (props.selectedKeys === undefined) {
        uncontrolledSelectedKeys.value = nextSelection;
      }

      const externalKeys = new Set<MenuKey>();
      for (const key of nextSelection) {
        externalKeys.add(keyMap.value.get(key) ?? key);
      }

      props.onSelectionChange?.(externalKeys);
    };

    const shouldCloseOnSelect = computed(() => {
      if (props.closeOnSelect !== undefined) {
        return props.closeOnSelect;
      }

      return selectionMode.value !== "multiple";
    });

    const activateKey = (key: string | null) => {
      if (!key) {
        return;
      }

      const item = items.value.find((candidate) => String(candidate.key) === key);
      if (!item || isItemDisabled(item)) {
        return;
      }

      if (selectionMode.value === "single") {
        emitSelectionChange(new Set([key]));
      }

      if (selectionMode.value === "multiple") {
        const next = new Set(selectedKeys.value);
        if (next.has(key)) {
          next.delete(key);
        } else {
          next.add(key);
        }
        emitSelectionChange(next);
      }

      props.onAction?.(item.key);

      if (shouldCloseOnSelect.value) {
        props.onClose?.();
      }
    };

    watch(
      items,
      () => {
        if (selectionMode.value === "none") {
          return;
        }

        const validKeys = new Set(items.value.map((item) => String(item.key)));
        const next = new Set<string>();

        for (const key of selectedKeys.value) {
          if (validKeys.has(key)) {
            next.add(key);
          }
        }

        if (!areSetsEqual(next, selectedKeys.value)) {
          emitSelectionChange(next);
        }
      },
      { immediate: true }
    );

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

        const autoFocus = props.autoFocus;
        if (autoFocus === "last") {
          focusedKey.value = keys[keys.length - 1] ?? null;
          return;
        }

        focusedKey.value = keys[0] ?? null;
      },
      { immediate: true }
    );

    watch(
      () => props.autoFocus,
      (autoFocus) => {
        if (!autoFocus) {
          return;
        }

        const keys = enabledKeys.value;
        if (keys.length === 0) {
          return;
        }

        const targetKey =
          autoFocus === "last" ? keys[keys.length - 1] ?? null : keys[0] ?? null;
        setFocusedKey(targetKey, true);
      },
      { immediate: true }
    );

    watch(
      () => props.items,
      (value) => {
        if (value !== undefined) {
          slotItems.value = [];
          slotSections.value = [];
        }
      }
    );

    watch(
      () => props.sections,
      (value) => {
        if (value !== undefined) {
          slotItems.value = [];
          slotSections.value = [];
        }
      }
    );

    expose({
      UNSAFE_getDOMNode: () => rootRef.value,
      focus: () => {
        if (!focusedKey.value) {
          return;
        }

        itemRefs.get(focusedKey.value)?.focus();
      },
    });

    return () => {
      if (props.items === undefined && props.sections === undefined) {
        const parsed = parseMenuSlotData(slots.default?.() as VNode[] | undefined);
        if (!areMenuItemsEqual(parsed.items, slotItems.value)) {
          slotItems.value = parsed.items;
        }
        if (!areMenuSectionsEqual(parsed.sections, slotSections.value)) {
          slotSections.value = parsed.sections;
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

      const ariaLabel =
        props.ariaLabel ??
        props["aria-label"] ??
        (attrsRecord["aria-label"] as string | undefined);
      const ariaLabelledby =
        props.ariaLabelledby ??
        props["aria-labelledby"] ??
        (attrsRecord["aria-labelledby"] as string | undefined);
      const isProduction =
        typeof process !== "undefined" && process.env.NODE_ENV === "production";

      if (!isProduction && !ariaLabel && !ariaLabelledby) {
        console.warn(
          "An aria-label or aria-labelledby prop is required for accessibility."
        );
      }

      const renderMenuItem = (item: SpectrumMenuItemData) => {
        const itemKey = keyToString(item.key) ?? "";

        return h(MenuItem, {
          key: itemKey,
          ref: (value: unknown) => {
            if (!value) {
              itemRefs.delete(itemKey);
              return;
            }

            const element = (value as { $el?: unknown }).$el as
              | HTMLLIElement
              | undefined;
            if (element) {
              itemRefs.set(itemKey, element);
            }
          },
          item,
          selectionMode: selectionMode.value,
          isSelected: selectedKeys.value.has(itemKey),
          isFocused: focusedKey.value === itemKey,
          isDisabled: isItemDisabled(item),
          tabIndex: focusedKey.value === itemKey ? 0 : -1,
          onFocus: () => {
            focusedKey.value = itemKey;
          },
          onHover: () => {
            focusedKey.value = itemKey;
          },
          onAction: () => {
            activateKey(itemKey);
          },
        });
      };

      return h(
        "ul",
        {
          ...domProps,
          id: props.id,
          ref: (value: unknown) => {
            rootRef.value = value as HTMLUListElement | null;
          },
          role: "menu",
          tabIndex: 0,
          "aria-label": ariaLabel,
          "aria-labelledby": ariaLabelledby,
          class: classNames(
            "spectrum-Menu",
            styleProps.class as ClassValue | undefined,
            domProps.class as ClassValue | undefined,
            props.UNSAFE_className as ClassValue | undefined
          ),
          style: {
            ...(styleProps.style ?? {}),
            ...(props.UNSAFE_style ?? {}),
          },
          onFocus: (event: FocusEvent) => {
            if (event.target !== rootRef.value) {
              return;
            }

            if (!focusedKey.value) {
              setFocusedKey(enabledKeys.value[0] ?? null);
              return;
            }

            setFocusedKey(focusedKey.value);
          },
          onKeydown: (event: KeyboardEvent) => {
            switch (event.key) {
              case "ArrowDown":
                event.preventDefault();
                setFocusedKey(getNextKey(1));
                break;
              case "ArrowUp":
                event.preventDefault();
                setFocusedKey(getNextKey(-1));
                break;
              case "Home":
                event.preventDefault();
                setFocusedKey(enabledKeys.value[0] ?? null);
                break;
              case "End":
                event.preventDefault();
                setFocusedKey(enabledKeys.value[enabledKeys.value.length - 1] ?? null);
                break;
              case "Enter":
              case " ":
                event.preventDefault();
                activateKey(focusedKey.value);
                break;
              case "Escape":
                event.preventDefault();
                props.onClose?.();
                break;
              default:
                break;
            }
          },
        },
        sections.value.flatMap((section, sectionIndex) => {
          if (section.implicit) {
            return section.items.map((item) => renderMenuItem(item));
          }

          const headingId = section.heading
            ? `${props.id ?? "v-spectrum-menu"}-section-${sectionIndex}`
            : undefined;

          return [
            h(
              MenuSection,
              {
                key: section.key,
                heading: section.heading,
                headingId,
                ariaLabel: section.ariaLabel,
                showDivider: sectionIndex > 0,
              },
              {
                default: () => section.items.map((item) => renderMenuItem(item)),
              }
            ),
          ];
        })
      );
    };
  },
});
