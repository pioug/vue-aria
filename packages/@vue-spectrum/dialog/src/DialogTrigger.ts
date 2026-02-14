import { useOverlayTrigger } from "@vue-aria/overlays";
import { useOverlayTriggerState } from "@vue-aria/overlays-state";
import { cloneVNode, computed, defineComponent, provide, ref, type PropType } from "vue";
import { DialogContext } from "./context";
import type { DialogContextValue } from "./context";

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
  },
  setup(props, { slots }) {
    const triggerRef = ref<HTMLElement | null>(null);
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

    const context = computed<DialogContextValue>(() => ({
      type: props.type,
      onClose: () => state.close(),
      isDismissable: props.isDismissable,
      ...overlayProps,
    }));
    provide(DialogContext, context as any);

    return () => {
      const triggerNodes = slots.trigger?.() ?? [];
      const contentNodes = slots.default?.({ close: () => state.close() }) ?? [];
      const trigger = triggerNodes[0];
      if (!trigger) {
        throw new Error("DialogTrigger must have a trigger slot.");
      }

      const triggerWithPress = cloneVNode(trigger, {
        "aria-haspopup": triggerProps["aria-haspopup"],
        "aria-expanded": triggerProps["aria-expanded"],
        "aria-controls": triggerProps["aria-controls"],
        onClick: () => state.toggle(),
        onPress: () => state.toggle(),
        ref: triggerRef,
      });

      return [
        triggerWithPress,
        state.isOpen && contentNodes[0]
          ? cloneVNode(contentNodes[0], { "data-testid": props.type ?? "modal" })
          : null,
      ];
    };
  },
});
