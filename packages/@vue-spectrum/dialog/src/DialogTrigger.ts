import { useOverlayTrigger, useUNSAFE_PortalContext } from "@vue-aria/overlays";
import { useOverlayTriggerState } from "@vue-aria/overlays-state";
import {
  Teleport,
  cloneVNode,
  computed,
  defineComponent,
  h,
  nextTick,
  provide,
  ref,
  watch,
  watchEffect,
  type PropType,
  type VNode,
} from "vue";
import { DialogContext } from "./context";
import type { DialogContextValue } from "./context";

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

/**
 * DialogTrigger links trigger interactions with dialog open state.
 */
export const DialogTrigger = defineComponent({
  name: "SpectrumDialogTrigger",
  inheritAttrs: false,
  props: {
    type: {
      type: String as () => DialogContextValue["type"],
      required: false,
      default: "modal",
    },
    isDismissable: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    isKeyboardDismissDisabled: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
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
    portalContainer: {
      type: Object as PropType<Element | null | undefined>,
      required: false,
      default: undefined,
    },
  },
  setup(props, { slots }) {
    const { getContainer } = useUNSAFE_PortalContext();
    const resolvedPortalContainer = computed(() => props.portalContainer ?? getContainer?.() ?? null);
    const triggerRef = ref<HTMLElement | null>(null);
    const triggerIsDom = ref(true);
    const state = useOverlayTriggerState({
      get isOpen() {
        return props.isOpen;
      },
      get defaultOpen() {
        return props.defaultOpen;
      },
      get onOpenChange() {
        return props.onOpenChange;
      },
    });
    const { triggerProps, overlayProps } = useOverlayTrigger(
      { type: "dialog" },
      state,
      {
        get current() {
          return triggerRef.value;
        },
        set current(value: Element | null) {
          triggerRef.value = value as HTMLElement | null;
        },
      }
    );

    watchEffect(() => {
      const triggerElement = triggerRef.value;
      if (!triggerElement) {
        return;
      }

      const triggerId = triggerProps.id as string | undefined;
      if (triggerId) {
        triggerElement.id = triggerId;
      }

      const hasPopup = triggerProps["aria-haspopup"];
      if (hasPopup === undefined || hasPopup === null || hasPopup === false) {
        triggerElement.removeAttribute("aria-haspopup");
      } else {
        triggerElement.setAttribute("aria-haspopup", String(hasPopup));
      }

      triggerElement.setAttribute("aria-expanded", state.isOpen ? "true" : "false");
      if (state.isOpen) {
        triggerElement.setAttribute("aria-controls", overlayProps.id as string);
      } else {
        triggerElement.removeAttribute("aria-controls");
      }

      if (triggerIsDom.value) {
        return;
      }

      const handleClick = () => state.toggle();
      triggerElement.addEventListener("click", handleClick);
      return () => {
        triggerElement.removeEventListener("click", handleClick);
      };
    });

    const context = computed<DialogContextValue>(() => ({
      type: props.type,
      onClose: () => state.close(),
      isDismissable: props.isDismissable,
      isKeyboardDismissDisabled: props.isKeyboardDismissDisabled,
      ...overlayProps,
    }));
    provide(DialogContext, context as any);
    watch(
      () => state.isOpen,
      (isOpen, wasOpen) => {
        if (!isOpen && wasOpen) {
          void nextTick(() => {
            triggerRef.value?.focus();
          });
        }
      }
    );

    const setTriggerRef = (value: unknown) => {
      triggerRef.value = resolveElement(value);
    };

    return () => {
      const triggerNodes = (slots.trigger?.() ?? []).filter((node): node is VNode => isRenderableNode(node));
      const contentNodes = slots.default?.({ close: () => state.close() }) ?? [];
      const trigger = triggerNodes[0];
      if (!trigger) {
        throw new Error("DialogTrigger must have a trigger slot.");
      }

      const isDomTrigger = typeof trigger.type === "string";
      triggerIsDom.value = isDomTrigger;
      const triggerWithPress = cloneVNode(
        trigger,
        isDomTrigger
          ? {
              "aria-haspopup": triggerProps["aria-haspopup"],
              "aria-expanded": state.isOpen ? "true" : "false",
              "aria-controls": state.isOpen ? (overlayProps.id as string | undefined) : undefined,
              onClick: () => state.toggle(),
              onPress: () => state.toggle(),
              ref: setTriggerRef,
            }
          : {
              ref: setTriggerRef,
            },
        true
      );
      const dialogContent =
        state.isOpen && contentNodes[0]
          ? cloneVNode(contentNodes[0], { "data-testid": props.type ?? "modal" })
          : null;
      const renderedDialog = resolvedPortalContainer.value && dialogContent
        ? h(Teleport, { to: resolvedPortalContainer.value }, [dialogContent])
        : dialogContent;

      return [
        triggerWithPress,
        renderedDialog,
      ];
    };
  },
});
