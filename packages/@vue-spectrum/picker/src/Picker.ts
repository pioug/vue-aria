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
import { useId } from "@vue-aria/ssr";
import { filterDOMProps } from "@vue-aria/utils";
import { useProviderProps } from "@vue-spectrum/provider";
import { classNames, useStyleProps, type ClassValue } from "@vue-spectrum/utils";

export type PickerKey = string | number;

export interface SpectrumPickerItemData {
  key: PickerKey;
  label: string;
  isDisabled?: boolean | undefined;
}

export interface SpectrumPickerProps {
  id?: string | undefined;
  items?: SpectrumPickerItemData[] | undefined;
  selectedKey?: PickerKey | undefined;
  defaultSelectedKey?: PickerKey | undefined;
  isDisabled?: boolean | undefined;
  placeholder?: string | undefined;
  onSelectionChange?: ((key: PickerKey) => void) | undefined;
  onOpenChange?: ((isOpen: boolean) => void) | undefined;
  ariaLabel?: string | undefined;
  ariaLabelledby?: string | undefined;
  "aria-label"?: string | undefined;
  "aria-labelledby"?: string | undefined;
  slot?: string | undefined;
  UNSAFE_className?: string | undefined;
  UNSAFE_style?: Record<string, string | number> | undefined;
}

export interface SpectrumPickerItemProps {
  id?: PickerKey | undefined;
  textValue?: string | undefined;
  isDisabled?: boolean | undefined;
}

export interface SpectrumPickerSectionProps {
  id?: PickerKey | undefined;
  title?: string | undefined;
  "aria-label"?: string | undefined;
}

function keyToString(key: PickerKey | undefined): string | null {
  if (key === undefined || key === null) {
    return null;
  }

  return String(key);
}

function normalizePickerKey(value: unknown, fallback: PickerKey): PickerKey {
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

function parsePickerItemNode(node: VNode, fallback: PickerKey): SpectrumPickerItemData {
  const props = (node.props ?? {}) as Record<string, unknown>;
  const slotLabel = extractTextContent(getSlotContent(node)).trim();
  const textValue =
    typeof props.textValue === "string" ? props.textValue : slotLabel;

  return {
    key: normalizePickerKey(node.key ?? props.id, fallback),
    label: textValue || String(fallback),
    isDisabled: Boolean(props.isDisabled),
  };
}

function parsePickerSlotItems(nodes: VNode[] | undefined): SpectrumPickerItemData[] {
  if (!nodes || nodes.length === 0) {
    return [];
  }

  const topLevelNodes = flattenVNodeChildren(nodes);
  const items: SpectrumPickerItemData[] = [];
  let itemIndex = 0;

  for (const node of topLevelNodes) {
    const componentName = getComponentName(node);
    if (componentName === "PickerItem") {
      items.push(parsePickerItemNode(node, `item-${itemIndex}`));
      itemIndex += 1;
      continue;
    }

    if (componentName === "PickerSection") {
      const sectionChildren = getSlotChildren(node).filter(
        (child) => getComponentName(child) === "PickerItem"
      );
      for (const child of sectionChildren) {
        items.push(parsePickerItemNode(child, `item-${itemIndex}`));
        itemIndex += 1;
      }
    }
  }

  return items;
}

function createStaticPickerComponent(name: string, props: Record<string, unknown>) {
  return defineComponent({
    name,
    props: props as any,
    setup() {
      return () => null;
    },
  });
}

export const PickerItem = createStaticPickerComponent("PickerItem", {
  id: {
    type: [String, Number] as PropType<PickerKey | undefined>,
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

export const PickerSection = createStaticPickerComponent("PickerSection", {
  id: {
    type: [String, Number] as PropType<PickerKey | undefined>,
    default: undefined,
  },
  title: {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  "aria-label": {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
});

export const Picker = defineComponent({
  name: "Picker",
  inheritAttrs: false,
  props: {
    id: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    items: {
      type: Array as PropType<SpectrumPickerItemData[] | undefined>,
      default: undefined,
    },
    selectedKey: {
      type: [String, Number] as PropType<PickerKey | undefined>,
      default: undefined,
    },
    defaultSelectedKey: {
      type: [String, Number] as PropType<PickerKey | undefined>,
      default: undefined,
    },
    isDisabled: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    placeholder: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    onSelectionChange: {
      type: Function as PropType<((key: PickerKey) => void) | undefined>,
      default: undefined,
    },
    onOpenChange: {
      type: Function as PropType<((isOpen: boolean) => void) | undefined>,
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
    const resolvedProviderProps = computed(() =>
      useProviderProps(props as unknown as Record<string, unknown>)
    );

    const rootRef = ref<HTMLDivElement | null>(null);
    const triggerRef = ref<HTMLButtonElement | null>(null);
    const optionRefs = new Map<string, HTMLLIElement>();

    const listboxId = useId(undefined, "v-spectrum-picker-listbox");

    const parsedSlotItems = computed<SpectrumPickerItemData[]>(() =>
      parsePickerSlotItems(slots.default?.() as VNode[] | undefined)
    );
    const items = computed<SpectrumPickerItemData[]>(() =>
      props.items ?? parsedSlotItems.value
    );
    const itemByKey = computed(() => {
      const map = new Map<string, SpectrumPickerItemData>();
      for (const item of items.value) {
        map.set(String(item.key), item);
      }
      return map;
    });

    const uncontrolledSelectedKey = ref<string | null>(
      keyToString(props.defaultSelectedKey)
    );

    const selectedKey = computed<string | null>(() => {
      const controlled = keyToString(props.selectedKey);
      if (controlled !== null) {
        return controlled;
      }

      return uncontrolledSelectedKey.value;
    });

    const selectedItem = computed(() =>
      selectedKey.value !== null
        ? itemByKey.value.get(selectedKey.value) ?? null
        : null
    );

    const isDisabled = computed(() =>
      Boolean((resolvedProviderProps.value.isDisabled as boolean | undefined) ?? props.isDisabled)
    );

    const enabledKeys = computed(() =>
      items.value
        .filter((item) => !item.isDisabled)
        .map((item) => String(item.key))
    );

    const isOpen = ref(false);
    const focusedKey = ref<string | null>(null);

    const focusOption = () => {
      if (focusedKey.value === null) {
        return;
      }

      optionRefs.get(focusedKey.value)?.focus();
    };

    const setOpen = (nextOpen: boolean) => {
      if (isOpen.value === nextOpen) {
        return;
      }

      isOpen.value = nextOpen;
      props.onOpenChange?.(nextOpen);
    };

    const setFocusedToBoundary = (boundary: "first" | "last" | "selected") => {
      const keys = enabledKeys.value;
      if (keys.length === 0) {
        focusedKey.value = null;
        return;
      }

      if (
        boundary === "selected" &&
        selectedKey.value !== null &&
        keys.includes(selectedKey.value)
      ) {
        focusedKey.value = selectedKey.value;
        return;
      }

      if (boundary === "last") {
        focusedKey.value = keys[keys.length - 1] ?? null;
        return;
      }

      focusedKey.value = keys[0] ?? null;
    };

    const openMenu = (boundary: "first" | "last" | "selected" = "selected") => {
      if (isDisabled.value) {
        return;
      }

      setFocusedToBoundary(boundary);
      setOpen(true);
      void nextTick(() => {
        focusOption();
      });
    };

    const closeMenu = (restoreTriggerFocus = false) => {
      setOpen(false);
      if (restoreTriggerFocus) {
        void nextTick(() => {
          triggerRef.value?.focus();
        });
      }
    };

    const moveFocus = (offset: 1 | -1) => {
      const keys = enabledKeys.value;
      if (keys.length === 0) {
        return;
      }

      const current = focusedKey.value;
      const currentIndex = current !== null ? keys.indexOf(current) : -1;
      const baseIndex = currentIndex >= 0 ? currentIndex : 0;
      const nextIndex = (baseIndex + offset + keys.length) % keys.length;
      focusedKey.value = keys[nextIndex] ?? null;
      void nextTick(() => {
        focusOption();
      });
    };

    const selectKey = (key: string) => {
      if (!itemByKey.value.has(key)) {
        return;
      }

      const item = itemByKey.value.get(key);
      if (!item || item.isDisabled) {
        return;
      }

      if (props.selectedKey === undefined) {
        uncontrolledSelectedKey.value = key;
      }

      props.onSelectionChange?.(item.key);
      closeMenu(true);
    };

    watch(
      items,
      () => {
        const selected = selectedKey.value;
        if (selected === null) {
          return;
        }

        if (itemByKey.value.has(selected)) {
          return;
        }

        if (props.selectedKey === undefined) {
          uncontrolledSelectedKey.value = null;
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

        if (focusedKey.value !== null && keys.includes(focusedKey.value)) {
          return;
        }

        focusedKey.value = keys[0] ?? null;
      },
      { immediate: true }
    );

    const onDocumentPointerDown = (event: MouseEvent) => {
      if (!isOpen.value) {
        return;
      }

      const target = event.target as Node | null;
      if (target && rootRef.value?.contains(target)) {
        return;
      }

      closeMenu();
    };

    onMounted(() => {
      if (typeof document !== "undefined") {
        document.addEventListener("mousedown", onDocumentPointerDown, true);
      }
    });

    onBeforeUnmount(() => {
      if (typeof document !== "undefined") {
        document.removeEventListener("mousedown", onDocumentPointerDown, true);
      }
    });

    expose({
      UNSAFE_getDOMNode: () => rootRef.value,
      focus: () => {
        triggerRef.value?.focus();
      },
    });

    return () => {
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

      return h(
        "div",
        {
          ...domProps,
          id: props.id,
          ref: (value: unknown) => {
            rootRef.value = value as HTMLDivElement | null;
          },
          class: classNames(
            "spectrum-Dropdown",
            {
              "is-disabled": isDisabled.value,
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
            "button",
            {
              ref: (value: unknown) => {
                triggerRef.value = value as HTMLButtonElement | null;
              },
              type: "button",
              class: classNames("spectrum-Dropdown-trigger"),
              role: "button",
              disabled: isDisabled.value,
              "aria-label": ariaLabel,
              "aria-labelledby": ariaLabelledby,
              "aria-haspopup": "listbox",
              "aria-expanded": isOpen.value ? "true" : "false",
              "aria-controls": isOpen.value ? listboxId.value : undefined,
              onClick: () => {
                if (isOpen.value) {
                  closeMenu();
                } else {
                  openMenu("selected");
                }
              },
              onKeydown: (event: KeyboardEvent) => {
                if (isDisabled.value) {
                  return;
                }

                switch (event.key) {
                  case "ArrowDown":
                    event.preventDefault();
                    openMenu("first");
                    break;
                  case "ArrowUp":
                    event.preventDefault();
                    openMenu("last");
                    break;
                  case "Enter":
                  case " ":
                    event.preventDefault();
                    openMenu("selected");
                    break;
                  default:
                    break;
                }
              },
            },
            [
              h(
                "span",
                {
                  class: classNames("spectrum-Dropdown-label", {
                    "is-placeholder": !selectedItem.value,
                  }),
                },
                selectedItem.value?.label ?? props.placeholder ?? "Select…"
              ),
              h("span", { class: classNames("spectrum-Dropdown-chevron"), "aria-hidden": "true" }, "▾"),
            ]
          ),
          isOpen.value && items.value.length > 0
            ? h(
                "ul",
                {
                  id: listboxId.value,
                  role: "listbox",
                  class: classNames("spectrum-Dropdown-popover"),
                  tabindex: -1,
                  onKeydown: (event: KeyboardEvent) => {
                    switch (event.key) {
                      case "ArrowDown":
                        event.preventDefault();
                        moveFocus(1);
                        break;
                      case "ArrowUp":
                        event.preventDefault();
                        moveFocus(-1);
                        break;
                      case "Home":
                        event.preventDefault();
                        focusedKey.value = enabledKeys.value[0] ?? null;
                        void nextTick(() => {
                          focusOption();
                        });
                        break;
                      case "End":
                        event.preventDefault();
                        focusedKey.value =
                          enabledKeys.value[enabledKeys.value.length - 1] ?? null;
                        void nextTick(() => {
                          focusOption();
                        });
                        break;
                      case "Enter":
                      case " ":
                        event.preventDefault();
                        if (focusedKey.value !== null) {
                          selectKey(focusedKey.value);
                        }
                        break;
                      case "Escape":
                        event.preventDefault();
                        closeMenu(true);
                        break;
                      case "Tab":
                        closeMenu();
                        break;
                      default:
                        break;
                    }
                  },
                },
                items.value.map((item) => {
                  const itemKey = String(item.key);
                  const selected = selectedKey.value === itemKey;
                  const focused = focusedKey.value === itemKey;

                  return h(
                    "li",
                    {
                      key: itemKey,
                      id: `${listboxId.value}-${itemKey}`,
                      ref: (value: unknown) => {
                        if (!value) {
                          optionRefs.delete(itemKey);
                          return;
                        }

                        optionRefs.set(itemKey, value as HTMLLIElement);
                      },
                      role: "option",
                      tabindex: focused ? 0 : -1,
                      "aria-selected": selected ? "true" : "false",
                      "aria-disabled": item.isDisabled ? "true" : undefined,
                      class: classNames("spectrum-Menu-item", {
                        "is-selected": selected,
                        "is-focused": focused,
                        "is-disabled": item.isDisabled,
                      }),
                      onMouseenter: () => {
                        if (!item.isDisabled) {
                          focusedKey.value = itemKey;
                        }
                      },
                      onClick: () => {
                        selectKey(itemKey);
                      },
                    },
                    item.label
                  );
                })
              )
            : null,
        ]
      );
    };
  },
});
