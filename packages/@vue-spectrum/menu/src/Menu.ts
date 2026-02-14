import { useMenu } from "@vue-aria/menu";
import { ListCollection, useListState, type ListState } from "@vue-aria/list-state";
import { defineComponent, h, ref, type PropType, type VNode } from "vue";
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

    const slotChildren = (slots.default?.() ?? []).filter((node): node is VNode => isRenderableNode(node));
    const collectionNodes = createMenuCollection(props.items, slotChildren);
    const collection = new ListCollection(collectionNodes as any);
    const state = useListState<object>({
      collection: collection as any,
      disabledKeys: props.disabledKeys,
      selectionMode: props.selectionMode,
      disallowEmptySelection: props.disallowEmptySelection,
      selectedKeys: props.selectedKeys,
      defaultSelectedKeys: props.defaultSelectedKeys,
      onSelectionChange: props.onSelectionChange,
    });

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
