import { useMenuTrigger } from "@vue-aria/menu";
import { cloneVNode, defineComponent, h, ref, type PropType, type VNode } from "vue";
import { Popover } from "./Popover";
import { useRootMenuTriggerState } from "./state";
import type { SpectrumMenuTriggerProps } from "./types";

function isRenderableNode(node: VNode): boolean {
  return typeof node.type !== "symbol";
}

function resolveElement(value: unknown): HTMLElement | null {
  if (value instanceof HTMLElement) {
    return value;
  }

  if (
    value
    && typeof value === "object"
    && "UNSAFE_getDOMNode" in value
    && typeof (value as { UNSAFE_getDOMNode?: unknown }).UNSAFE_getDOMNode === "function"
  ) {
    const element = (value as { UNSAFE_getDOMNode: () => unknown }).UNSAFE_getDOMNode();
    return element instanceof HTMLElement ? element : null;
  }

  if (value && typeof value === "object" && "$el" in value) {
    const element = (value as { $el?: unknown }).$el;
    return element instanceof HTMLElement ? element : null;
  }

  return null;
}

function getInitialPlacement(direction: NonNullable<SpectrumMenuTriggerProps["direction"]>, align: NonNullable<SpectrumMenuTriggerProps["align"]>): string {
  switch (direction) {
    case "left":
    case "right":
    case "start":
    case "end":
      return `${direction} ${align === "end" ? "bottom" : "top"}`;
    case "top":
    case "bottom":
    default:
      return `${direction} ${align}`;
  }
}

/**
 * MenuTrigger links trigger interactions with menu open state.
 */
export const MenuTrigger = defineComponent({
  name: "SpectrumMenuTrigger",
  inheritAttrs: false,
  props: {
    align: {
      type: String as () => NonNullable<SpectrumMenuTriggerProps["align"]>,
      required: false,
      default: "start",
    },
    shouldFlip: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: true,
    },
    direction: {
      type: String as () => NonNullable<SpectrumMenuTriggerProps["direction"]>,
      required: false,
      default: "bottom",
    },
    closeOnSelect: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    trigger: {
      type: String as () => NonNullable<SpectrumMenuTriggerProps["trigger"]>,
      required: false,
      default: "press",
    },
    isOpen: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    defaultOpen: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    onOpenChange: {
      type: Function as PropType<((isOpen: boolean) => void) | undefined>,
      required: false,
    },
  },
  setup(props, { slots, expose }) {
    const triggerRef = ref<HTMLElement | null>(null);
    const menuRef = ref<HTMLElement | null>(null);
    const triggerRefObject = {
      get current() {
        return triggerRef.value;
      },
      set current(value: Element | null) {
        triggerRef.value = value as HTMLElement | null;
      },
    };
    const menuRefObject = {
      get current() {
        return menuRef.value;
      },
      set current(value: Element | null) {
        menuRef.value = value as HTMLElement | null;
      },
    };

    const state = useRootMenuTriggerState(props);
    const { menuTriggerProps, menuProps } = useMenuTrigger(
      {
        trigger: props.trigger,
      },
      state as any,
      triggerRefObject
    );

    expose({
      focus: () => triggerRef.value?.focus(),
      UNSAFE_getDOMNode: () => triggerRef.value,
    });

    const setTriggerRef = (value: unknown) => {
      triggerRef.value = resolveElement(value);
    };

    return () => {
      const children = (slots.default?.() ?? []).filter((node): node is VNode => isRenderableNode(node));
      const trigger = children[0];
      const menu = children[1];

      if (!trigger || !menu) {
        throw new Error("MenuTrigger expects exactly two children: trigger and menu.");
      }

      const isDomTrigger = typeof trigger.type === "string";
      const triggerNode = cloneVNode(
        trigger,
        isDomTrigger
          ? {
              id: menuTriggerProps.id,
              "aria-haspopup": menuTriggerProps["aria-haspopup"],
              "aria-expanded": state.isOpen ? "true" : "false",
              "aria-controls": state.isOpen ? (menuProps.id as string | undefined) : undefined,
              onClick: props.trigger === "press" ? () => state.toggle() : undefined,
              onKeydown: menuTriggerProps.onKeydown as ((event: KeyboardEvent) => void) | undefined,
              onKeyDown: menuTriggerProps.onKeyDown as ((event: KeyboardEvent) => void) | undefined,
              ref: setTriggerRef,
            }
          : {
              ...menuTriggerProps,
              "aria-expanded": state.isOpen ? "true" : "false",
              "aria-controls": state.isOpen ? (menuProps.id as string | undefined) : undefined,
              onClick:
                state.isOpen
                  ? () => state.toggle()
                  : (menuTriggerProps as Record<string, unknown>).onClick,
              isPressed: state.isOpen,
              ref: setTriggerRef,
            }
      );

      const initialPlacement = getInitialPlacement(props.direction, props.align);
      const menuNode = cloneVNode(menu, {
        id: menuProps.id,
        ariaLabelledby: menuProps["aria-labelledby"],
        autoFocus: (menuProps as any).autoFocus as boolean | "first" | "last" | undefined,
        onClose: (menuProps as any).onClose as (() => void) | undefined,
        closeOnSelect: props.closeOnSelect,
        rootMenuTriggerState: state,
        submenuLevel: -1,
        ref: menuRef,
      });

      return [
        triggerNode,
        h(
          Popover as any,
          {
            state,
            triggerRef: triggerRefObject,
            scrollRef: menuRefObject,
            placement: initialPlacement,
            shouldFlip: props.shouldFlip,
            hideArrow: true,
            shouldContainFocus: true,
            UNSAFE_style: {
              clipPath: "unset",
              overflow: "visible",
              borderWidth: "0px",
            },
          },
          {
            default: () => [menuNode],
          }
        ),
      ];
    };
  },
});
