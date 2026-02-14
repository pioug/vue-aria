import { FocusableProvider } from "@vue-aria/focus";
import { useTooltipTrigger } from "@vue-aria/tooltip";
import { useTooltipTriggerState } from "@vue-aria/tooltip-state";
import { cloneVNode, computed, defineComponent, h, provide, ref, type PropType, type Ref, type VNode } from "vue";
import { TooltipContext } from "./context";
import type { TooltipContextValue } from "./context";
import type { SpectrumTooltipTriggerProps } from "./types";

const DEFAULT_OFFSET = -1;
const DEFAULT_CROSS_OFFSET = 0;
const DEFAULT_SHOULD_CLOSE_ON_PRESS = true;

function createRefObject<T extends Element>(nodeRef: Ref<T | null>): { current: T | null } {
  return {
    get current() {
      return nodeRef.value;
    },
    set current(value: T | null) {
      nodeRef.value = value;
    },
  };
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

function isRenderableNode(node: VNode): boolean {
  return typeof node.type !== "symbol";
}

/**
 * TooltipTrigger links trigger interactions with tooltip open state and overlay positioning.
 */
export const TooltipTrigger = defineComponent({
  name: "SpectrumTooltipTrigger",
  inheritAttrs: false,
  props: {
    isDisabled: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    delay: {
      type: Number as () => number | undefined,
      required: false,
      default: undefined,
    },
    closeDelay: {
      type: Number as () => number | undefined,
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
    trigger: {
      type: String as () => SpectrumTooltipTriggerProps["trigger"],
      required: false,
      default: undefined,
    },
    shouldCloseOnPress: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: DEFAULT_SHOULD_CLOSE_ON_PRESS,
    },
    offset: {
      type: Number as () => number | undefined,
      required: false,
      default: DEFAULT_OFFSET,
    },
    crossOffset: {
      type: Number as () => number | undefined,
      required: false,
      default: DEFAULT_CROSS_OFFSET,
    },
    placement: {
      type: String as () => SpectrumTooltipTriggerProps["placement"],
      required: false,
      default: undefined,
    },
    shouldFlip: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    containerPadding: {
      type: Number as () => number | undefined,
      required: false,
      default: undefined,
    },
  },
  setup(props, { slots }) {
    const state = useTooltipTriggerState({
      delay: props.delay,
      closeDelay: props.closeDelay,
      isOpen: props.isOpen,
      defaultOpen: props.defaultOpen,
      onOpenChange: props.onOpenChange,
    });
    const tooltipTriggerRef = ref<HTMLElement | null>(null);
    const tooltipTriggerRefObject = createRefObject(tooltipTriggerRef);
    const triggerType = props.trigger === "focus" ? "focus" : undefined;
    const { triggerProps, tooltipProps } = useTooltipTrigger(
      {
        isDisabled: props.isDisabled,
        trigger: triggerType,
        shouldCloseOnPress: props.shouldCloseOnPress,
      },
      state,
      tooltipTriggerRefObject
    );

    const resolvedTriggerProps = computed(() => ({
      ...triggerProps,
      "aria-describedby": state.isOpen ? (tooltipProps.id as string | undefined) : undefined,
    }));
    const context = computed<TooltipContextValue>(() => ({
      state,
      placement: ((props.placement ?? "top").split(" ")[0] as TooltipContextValue["placement"]) ?? null,
      tooltipProps,
    }));
    provide(TooltipContext, context as any);

    const setTriggerRef = (value: unknown) => {
      tooltipTriggerRef.value = resolveElement(value);
    };
    return () => {
      const children = (slots.default?.() ?? []).filter((child): child is VNode => isRenderableNode(child));
      const trigger = children[0];
      const tooltip = children[1];
      if (!trigger || !tooltip) {
        throw new Error("TooltipTrigger requires exactly two children: trigger and tooltip.");
      }

      const isDomTrigger = typeof trigger.type === "string";
      const triggerNode = cloneVNode(
        trigger,
        isDomTrigger
          ? {
              ...resolvedTriggerProps.value,
              ref: setTriggerRef,
            }
          : {
              ref: setTriggerRef,
            }
      );
      return [
        h(
          FocusableProvider as any,
          isDomTrigger ? {} : resolvedTriggerProps.value,
          {
            default: () => [triggerNode],
          }
        ),
        state.isOpen ? tooltip : null,
      ];
    };
  },
});
