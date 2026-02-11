import {
  cloneVNode,
  computed,
  defineComponent,
  h,
  isVNode,
  ref,
  type PropType,
  type VNode,
  type VNodeChild,
} from "vue";
import { useOverlayPosition } from "@vue-aria/overlays";
import { useTooltipTrigger } from "@vue-aria/tooltip";
import { mergeProps } from "@vue-aria/utils";
import { classNames } from "@vue-spectrum/utils";
import { Overlay } from "@vue-spectrum/overlays";
import type { ReadonlyRef } from "@vue-aria/types";

export interface SpectrumTooltipTriggerProps {
  isOpen?: boolean | undefined;
  defaultOpen?: boolean | undefined;
  onOpenChange?: ((isOpen: boolean) => void) | undefined;
  isDisabled?: boolean | undefined;
  trigger?: "focus" | "hover" | undefined;
  shouldCloseOnPress?: boolean | undefined;
  slot?: string | undefined;
  UNSAFE_className?: string | undefined;
}

interface TooltipTriggerStateLike {
  isOpen: ReadonlyRef<boolean>;
  open: (immediate?: boolean) => void;
  close: (immediate?: boolean) => void;
}

type TooltipPlacement = "top" | "bottom" | "left" | "right";

function normalizeChildren(nodes: VNodeChild[] | undefined): VNode[] {
  if (!nodes) {
    return [];
  }

  const normalized: VNode[] = [];

  for (const node of nodes) {
    if (Array.isArray(node)) {
      normalized.push(...normalizeChildren(node));
      continue;
    }

    if (!isVNode(node) || typeof node.type === "symbol") {
      continue;
    }

    normalized.push(node);
  }

  return normalized;
}

function toHTMLElement(value: unknown): HTMLElement | null {
  if (!value) {
    return null;
  }

  if (value instanceof HTMLElement) {
    return value;
  }

  const maybeEl = (value as { $el?: unknown }).$el;
  if (maybeEl instanceof HTMLElement) {
    return maybeEl;
  }

  return null;
}

function isTooltipPlacement(value: unknown): value is TooltipPlacement {
  return value === "top" || value === "bottom" || value === "left" || value === "right";
}

export const TooltipTrigger = defineComponent({
  name: "TooltipTrigger",
  inheritAttrs: false,
  props: {
    isOpen: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    defaultOpen: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    onOpenChange: {
      type: Function as PropType<((isOpen: boolean) => void) | undefined>,
      default: undefined,
    },
    isDisabled: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    trigger: {
      type: String as PropType<"focus" | "hover" | undefined>,
      default: undefined,
    },
    shouldCloseOnPress: {
      type: Boolean as PropType<boolean | undefined>,
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
  },
  setup(props, { slots, expose }) {
    const triggerElementRef = ref<HTMLElement | null>(null);
    const tooltipElementRef = ref<HTMLElement | null>(null);
    const requestedPlacement = ref<TooltipPlacement>("top");
    const uncontrolledOpen = ref(Boolean(props.defaultOpen));
    const isOpen = computed<boolean>(() =>
      props.isOpen !== undefined ? props.isOpen : uncontrolledOpen.value
    );

    const setOpen = (nextOpen: boolean): void => {
      if (props.isOpen === undefined) {
        uncontrolledOpen.value = nextOpen;
      }

      props.onOpenChange?.(nextOpen);
    };

    const state: TooltipTriggerStateLike = {
      isOpen,
      open: () => {
        setOpen(true);
      },
      close: () => {
        setOpen(false);
      },
    };

    const onTriggerClick = (): void => {
      if (props.shouldCloseOnPress === false) {
        return;
      }

      state.close(true);
    };

    const { triggerProps, tooltipProps } = useTooltipTrigger(
      {
        isDisabled: computed(() => props.isDisabled),
        trigger: computed(() => props.trigger),
        shouldCloseOnPress: computed(() => props.shouldCloseOnPress),
      },
      state,
      computed(() => triggerElementRef.value)
    );

    const overlayPosition = useOverlayPosition({
      targetRef: computed(() => triggerElementRef.value),
      overlayRef: computed(() => tooltipElementRef.value),
      placement: computed(() => requestedPlacement.value),
      offset: 8,
      isOpen,
      shouldUpdatePosition: isOpen,
    });

    expose({
      UNSAFE_getDOMNode: () => triggerElementRef.value,
    });

    return () => {
      const children = normalizeChildren(slots.default?.());
      if (children.length === 0) {
        return null;
      }

      const triggerNode = children[0];
      const tooltipNode = children[1];
      if (tooltipNode && isVNode(tooltipNode)) {
        const tooltipNodeProps = (tooltipNode.props ?? {}) as Record<string, unknown>;
        requestedPlacement.value = isTooltipPlacement(tooltipNodeProps.placement)
          ? tooltipNodeProps.placement
          : "top";
      }

      const renderedTrigger = cloneVNode(
        triggerNode,
        mergeProps(triggerProps.value, {
          onClick: onTriggerClick,
          ref: (value: unknown) => {
            triggerElementRef.value = toHTMLElement(value);
          },
        }),
        true
      );

      const renderedTooltip =
        tooltipNode && isVNode(tooltipNode)
          ? cloneVNode(
              tooltipNode,
              mergeProps(tooltipProps.value, overlayPosition.overlayProps.value, {
                isOpen: isOpen.value,
                placement:
                  (overlayPosition.placement.value as TooltipPlacement | null) ??
                  requestedPlacement.value,
                ref: (value: unknown) => {
                  tooltipElementRef.value = toHTMLElement(value);
                },
              }),
              true
            )
          : null;

      return h(
        "span",
        {
          class: classNames("spectrum-TooltipTrigger", props.UNSAFE_className),
        },
        [
          renderedTrigger,
          renderedTooltip
            ? h(
                Overlay,
                {
                  isOpen: isOpen.value,
                },
                {
                  default: () => renderedTooltip,
                }
              )
            : null,
        ]
      );
    };
  },
});
