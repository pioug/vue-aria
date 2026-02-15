import { useMenu } from "@vue-aria/menu";
import { ListCollection, useListState, type ListState } from "@vue-aria/list-state";
import { defineComponent, h, nextTick, ref, type PropType, type VNode } from "vue";
import { createMenuCollection } from "./collection";
import { provideMenuStateContext } from "./context";
import { MenuItem } from "./MenuItem";
import { MenuSection } from "./MenuSection";
import type { MenuCollectionNode, SpectrumMenuNodeData, SpectrumMenuProps } from "./types";

type OnCloseHandler = NonNullable<SpectrumMenuProps<object>["onClose"]>;
type OnCloseValue = OnCloseHandler | OnCloseHandler[] | undefined;

function isRenderableNode(node: VNode): boolean {
  return typeof node.type !== "symbol";
}

function syncListCollection(target: any, source: any): void {
  target.keyMap = source.keyMap;
  target.iterable = source.iterable;
  target.firstKey = source.firstKey;
  target.lastKey = source.lastKey;
  target._size = source._size;
}

function getCollectionSignature(nodes: Array<any>): string {
  const parts: string[] = [];
  const visit = (items: Array<any>) => {
    for (const item of items) {
      parts.push(`${String(item.key)}:${item.type}:${item.textValue ?? ""}`);
      if (Array.isArray(item.childNodes) && item.childNodes.length > 0) {
        visit(item.childNodes as Array<any>);
      }
    }
  };

  visit(nodes);
  return parts.join("|");
}

function createOnCloseHandler(value: OnCloseValue): OnCloseHandler | undefined {
  if (!value) {
    return undefined;
  }

  if (typeof value === "function") {
    return value;
  }

  return () => {
    for (const handler of value) {
      if (typeof handler === "function") {
        handler();
      }
    }
  };
}

/**
 * Menus display a list of actions or options that a user can choose.
 */
export const Menu = defineComponent({
  name: "SpectrumMenu",
  inheritAttrs: false,
  props: {
    id: {
      type: String,
      required: false,
    },
    items: {
      type: Array as PropType<Array<SpectrumMenuNodeData>>,
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
      type: String as () => SpectrumMenuProps<object>["selectionMode"],
      required: false,
      default: undefined,
    },
    disallowEmptySelection: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    selectedKeys: {
      type: Object as PropType<SpectrumMenuProps<object>["selectedKeys"]>,
      required: false,
      default: undefined,
    },
    defaultSelectedKeys: {
      type: Object as PropType<SpectrumMenuProps<object>["defaultSelectedKeys"]>,
      required: false,
      default: undefined,
    },
    onSelectionChange: {
      type: Function as PropType<SpectrumMenuProps<object>["onSelectionChange"]>,
      required: false,
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
    isVirtualized: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    autoFocus: {
      type: [Boolean, String] as PropType<boolean | "first" | "last" | undefined>,
      required: false,
      default: undefined,
    },
    closeOnSelect: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    onAction: {
      type: Function as PropType<SpectrumMenuProps<object>["onAction"]>,
      required: false,
    },
    onClose: {
      type: [Function, Array] as PropType<OnCloseValue>,
      required: false,
    },
    onKeyDown: {
      type: Function as PropType<SpectrumMenuProps<object>["onKeyDown"]>,
      required: false,
    },
    onKeyUp: {
      type: Function as PropType<SpectrumMenuProps<object>["onKeyUp"]>,
      required: false,
    },
    rootMenuTriggerState: {
      type: Object as PropType<SpectrumMenuProps<object>["rootMenuTriggerState"]>,
      required: false,
      default: undefined,
    },
    submenuLevel: {
      type: Number,
      required: false,
      default: -1,
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
    const onClose = createOnCloseHandler(props.onClose as OnCloseValue);
    const menuRef = ref<HTMLElement | null>(null);
    const submenuRef = ref<HTMLElement | null>(null);
    const menuRefObject = {
      get current() {
        return menuRef.value;
      },
      set current(value: HTMLElement | null) {
        menuRef.value = value;
      },
    };

    const initialCollectionNodes = createMenuCollection(props.items, []);
    const collection = new ListCollection(initialCollectionNodes as any);
    const collectionSignature = ref(getCollectionSignature(initialCollectionNodes as any[]));
    const state = useListState<object>({
      collection: collection as any,
      get disabledKeys() {
        return props.disabledKeys;
      },
      get selectionMode() {
        return props.selectionMode;
      },
      get disallowEmptySelection() {
        return props.disallowEmptySelection;
      },
      get selectedKeys() {
        return props.selectedKeys;
      },
      get defaultSelectedKeys() {
        return props.defaultSelectedKeys;
      },
      get onSelectionChange() {
        return props.onSelectionChange;
      },
    });

    const syncFocusedKeyAfterCollectionUpdate = () => {
      const manager = state.selectionManager as any;
      const collectionValue = state.collection as any;
      if (!manager || !collectionValue) {
        return;
      }

      if (manager.focusedKey != null && collectionValue.getItem(manager.focusedKey) != null) {
        return;
      }

      const canFocusKey = (key: unknown): boolean => {
        const item = collectionValue.getItem?.(key);
        if (!item || item.type !== "item") {
          return false;
        }

        if (item.props?.isDisabled) {
          return false;
        }

        return !(manager.disabledKeys instanceof Set) || !manager.disabledKeys.has(key);
      };

      const getFirstSelectableKey = (): unknown => {
        let key = collectionValue.getFirstKey?.() ?? null;
        while (key != null) {
          if (canFocusKey(key)) {
            return key;
          }

          key = collectionValue.getKeyAfter?.(key) ?? null;
        }

        return null;
      };

      const getLastSelectableKey = (): unknown => {
        let key = collectionValue.getLastKey?.() ?? null;
        while (key != null) {
          if (canFocusKey(key)) {
            return key;
          }

          key = collectionValue.getKeyBefore?.(key) ?? null;
        }

        return null;
      };

      let nextFocusedKey: unknown = null;
      if (manager.selectedKeys instanceof Set && manager.selectedKeys.size > 0) {
        for (const key of manager.selectedKeys as Set<unknown>) {
          if (canFocusKey(key)) {
            nextFocusedKey = key;
            break;
          }
        }
      }

      if (nextFocusedKey == null) {
        if (props.autoFocus === "last") {
          nextFocusedKey = getLastSelectableKey();
        } else if (props.autoFocus === "first") {
          nextFocusedKey = getFirstSelectableKey();
        }
      }

      if (nextFocusedKey != null) {
        manager.setFocused?.(true);
        manager.setFocusedKey?.(nextFocusedKey);
        void nextTick(() => {
          const focusTarget = menuRef.value?.querySelector<HTMLElement>(
            `[data-key="${String(nextFocusedKey)}"]`
          );
          focusTarget?.focus();
        });
      }
    };

    const { menuProps } = useMenu(
      {
        id: props.id,
        "aria-label": props.ariaLabel,
        "aria-labelledby": props.ariaLabelledby,
        shouldFocusWrap: props.shouldFocusWrap,
        shouldUseVirtualFocus: props.shouldUseVirtualFocus,
        isVirtualized: props.isVirtualized,
        onClose,
        onAction: props.onAction,
        autoFocus: props.autoFocus,
        onKeyDown: props.onKeyDown,
        onKeyUp: props.onKeyUp,
      } as any,
      state as any,
      menuRefObject
    );

    provideMenuStateContext({
      state: state as ListState<object>,
      menuRef,
      submenuRef,
      rootMenuTriggerState: props.rootMenuTriggerState,
      submenuLevel: props.submenuLevel,
    });

    expose({
      focus: () => menuRef.value?.focus(),
      UNSAFE_getDOMNode: () => menuRef.value,
    });

    return () => {
      const slotChildren = (slots.default?.() ?? []).filter((node): node is VNode => isRenderableNode(node));
      const collectionNodes = createMenuCollection(props.items, slotChildren);
      const nextCollectionSignature = getCollectionSignature(collectionNodes as any[]);
      if (nextCollectionSignature !== collectionSignature.value) {
        collectionSignature.value = nextCollectionSignature;
        const nextCollection = new ListCollection(collectionNodes as any);
        syncListCollection(state.collection as any, nextCollection as any);
        (state.selectionManager as any).collection = state.collection as any;
        syncFocusedKeyAfterCollectionUpdate();
      }

      const menuLevel = props.submenuLevel ?? -1;
      const nextMenuLevelKey = props.rootMenuTriggerState?.expandedKeysStack[menuLevel + 1];
      const hasOpenSubmenu = nextMenuLevelKey != null && state.collection.getItem(nextMenuLevelKey) != null;

      return h(
        "div",
        {
          class: [
            "spectrum-Menu-wrapper",
            {
              "is-expanded": hasOpenSubmenu,
            },
          ],
        },
        [
          h(
            "div",
            {
              role: "presentation",
              class: "spectrum-Submenu-wrapper",
            },
            [
              h(
                "div",
                {
                  ...(attrs as Record<string, unknown>),
                  ...menuProps,
                  ref: menuRef,
                  style: {
                    ...(menuProps.style as Record<string, unknown> | undefined),
                    ...(props.UNSAFE_style ?? {}),
                  },
                  class: ["spectrum-Menu", props.UNSAFE_className],
                },
                [...(state.collection as any)].map((item: MenuCollectionNode) => {
                  if (item.type === "section") {
                    return h(MenuSection as any, {
                      key: String(item.key),
                      item: item as MenuCollectionNode,
                      state,
                      closeOnSelect: props.closeOnSelect,
                      onClose,
                      isVirtualized: props.isVirtualized,
                    });
                  }

                  let menuItem = h(MenuItem as any, {
                    key: String(item.key),
                    item: item as MenuCollectionNode,
                    state,
                    closeOnSelect: props.closeOnSelect,
                    onClose,
                    isVirtualized: props.isVirtualized,
                  });

                  const wrapper = (item as MenuCollectionNode).wrapper;
                  if (typeof wrapper === "function") {
                    menuItem = wrapper(menuItem);
                  }

                  return menuItem;
                })
              ),
            ]
          ),
        ]
      );
    };
  },
});
