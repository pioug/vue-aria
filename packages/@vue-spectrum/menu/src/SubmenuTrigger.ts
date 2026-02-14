import { useSubmenuTrigger } from "@vue-aria/menu";
import { cloneVNode, defineComponent, h, ref, type VNode } from "vue";
import { createSubmenuState, useMenuStateContext } from "./context";
import { Popover } from "./Popover";
import type { SpectrumSubmenuTriggerProps } from "./types";

function isRenderableNode(node: VNode): boolean {
  return typeof node.type !== "symbol";
}

/**
 * SubmenuTrigger wraps a MenuItem trigger and a nested Menu/Dialog overlay.
 */
export const SubmenuTrigger = defineComponent({
  name: "SpectrumSubmenuTrigger",
  inheritAttrs: false,
  props: {
    targetKey: {
      type: [String, Number],
      required: false,
      default: undefined,
    },
    type: {
      type: String as () => NonNullable<SpectrumSubmenuTriggerProps["type"]>,
      required: false,
      default: "menu",
    },
    isUnavailable: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
  },
  setup(props, { slots }) {
    const context = useMenuStateContext();
    const triggerRef = ref<HTMLElement | null>(null);
    const submenuMenuRef = ref<HTMLElement | null>(null);

    const triggerRefObject = {
      get current() {
        return triggerRef.value;
      },
      set current(value: HTMLElement | null) {
        triggerRef.value = value;
      },
    };
    const parentMenuRefObject = {
      get current() {
        return context?.menuRef.value ?? null;
      },
      set current(value: HTMLElement | null) {
        if (context) {
          context.menuRef.value = value;
        }
      },
    };
    const submenuRefObject = {
      get current() {
        return submenuMenuRef.value;
      },
      set current(value: HTMLElement | null) {
        submenuMenuRef.value = value;
      },
    };

    const canUseSubmenu =
      context != null
      && context.rootMenuTriggerState != null
      && props.targetKey != null;
    const submenuLevel = (context?.submenuLevel ?? -1) + 1;
    const submenuState = canUseSubmenu
      ? createSubmenuState(context!.rootMenuTriggerState!, props.targetKey!, submenuLevel)
      : null;
    const isDisabled = canUseSubmenu ? context!.state.disabledKeys.has(props.targetKey!) : false;
    const submenuAria = canUseSubmenu
      ? useSubmenuTrigger(
          {
            parentMenuRef: parentMenuRefObject,
            submenuRef: submenuRefObject,
            type: props.type,
            isDisabled,
          },
          submenuState as any,
          triggerRefObject
        )
      : null;

    return () => {
      const children = (slots.default?.() ?? []).filter((node): node is VNode => isRenderableNode(node));
      const menuTrigger = children[0];
      const submenu = children[1];

      if (!menuTrigger || !submenu) {
        return null;
      }

      if (!context || !submenuState || !submenuAria) {
        return menuTrigger;
      }
      const { submenuTriggerProps, submenuProps, popoverProps } = submenuAria;

      const triggerNode = cloneVNode(menuTrigger, {
        submenuTriggerProps,
        submenuTriggerRef: triggerRefObject,
        isUnavailable: props.isUnavailable,
      });

      const submenuNode = props.type === "menu"
        ? cloneVNode(submenu, {
            id: submenuProps.id,
            ariaLabelledby: submenuProps["aria-labelledby"],
            autoFocus: submenuProps.autoFocus,
            onClose: submenuProps.onClose,
            onKeyDown: submenuProps.onKeyDown,
            rootMenuTriggerState: context.rootMenuTriggerState,
            submenuLevel: submenuProps.submenuLevel,
            ref: submenuMenuRef,
          })
        : cloneVNode(submenu, {
            ref: submenuMenuRef,
          });

      return [
        triggerNode,
        h(
          Popover as any,
          {
            state: submenuState,
            triggerRef: triggerRefObject,
            scrollRef: submenuRefObject,
            placement: "end top",
            hideArrow: true,
            shouldContainFocus: false,
            shouldFlip: true,
            isNonModal: true,
            containerPadding: 0,
            shouldCloseOnInteractOutside: popoverProps.shouldCloseOnInteractOutside,
            UNSAFE_className: "spectrum-Submenu-popover",
            UNSAFE_style: {
              clipPath: "unset",
              overflow: "visible",
              borderWidth: "0px",
            },
          },
          {
            default: () => [submenuNode],
          }
        ),
      ];
    };
  },
});

(SubmenuTrigger as any).__spectrumMenuNodeType = "submenuTrigger";
