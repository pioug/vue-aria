import {
  cloneVNode,
  defineComponent,
  h,
  isVNode,
  ref,
  type PropType,
  type VNode,
  type VNodeChild,
} from "vue";
import type { Placement } from "@vue-aria/overlays";
import { ActionButton } from "@vue-spectrum/button";
import { classNames, ClearSlots, SlotProvider, type ClassValue } from "@vue-spectrum/utils";
import { Dialog, DialogTrigger } from "@vue-spectrum/dialog";

export interface SpectrumContextualHelpProps {
  variant?: "help" | "info" | undefined;
  placement?: Placement | undefined;
  ariaLabel?: string | undefined;
  ariaLabelledby?: string | undefined;
  "aria-label"?: string | undefined;
  "aria-labelledby"?: string | undefined;
  slot?: string | undefined;
  UNSAFE_className?: string | undefined;
}

function normalizeChildren(nodes: VNodeChild[] | undefined): VNode[] {
  if (!nodes) {
    return [];
  }

  const result: VNode[] = [];
  for (const node of nodes) {
    if (Array.isArray(node)) {
      result.push(...normalizeChildren(node));
      continue;
    }

    if (!isVNode(node) || typeof node.type === "symbol") {
      continue;
    }

    result.push(node);
  }

  return result;
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

function decorateChildren(children: VNode[]): VNode[] {
  return children.map((child) => {
    const type = child.type as { name?: string } | string;
    const componentName = typeof type === "string" ? type : type.name;

    if (componentName === "Content") {
      return cloneVNode(
        child,
        {
          class: classNames(
            "react-spectrum-ContextualHelp-content",
            (child.props as Record<string, unknown> | null)?.class as
              | ClassValue
              | undefined
          ),
        },
        true
      );
    }

    if (componentName === "Footer") {
      return cloneVNode(
        child,
        {
          class: classNames(
            "react-spectrum-ContextualHelp-footer",
            (child.props as Record<string, unknown> | null)?.class as
              | ClassValue
              | undefined
          ),
        },
        true
      );
    }

    return child;
  });
}

export const ContextualHelp = defineComponent({
  name: "ContextualHelp",
  inheritAttrs: false,
  props: {
    variant: {
      type: String as PropType<"help" | "info" | undefined>,
      default: undefined,
    },
    placement: {
      type: String as PropType<Placement | undefined>,
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
  },
  setup(props, { attrs, slots, expose }) {
    const triggerButtonRef = ref<HTMLElement | null>(null);

    expose({
      UNSAFE_getDOMNode: () => triggerButtonRef.value,
      focus: () => {
        triggerButtonRef.value?.focus();
      },
    });

    return () => {
      const attrsRecord = attrs as Record<string, unknown>;
      const variant = props.variant ?? "help";
      const defaultAriaLabel = variant === "info" ? "Information" : "Help";
      const ariaLabelledby =
        props.ariaLabelledby ??
        props["aria-labelledby"] ??
        (attrsRecord["aria-labelledby"] as string | undefined);
      const ariaLabel =
        props.ariaLabel ??
        props["aria-label"] ??
        (attrsRecord["aria-label"] as string | undefined) ??
        (ariaLabelledby ? undefined : defaultAriaLabel);
      const icon = variant === "info" ? "i" : "?";

      return h(
        DialogTrigger,
        {
          ...attrsRecord,
          type: "popover",
          placement: props.placement ?? "bottom start",
          hideArrow: true,
        },
        {
          default: () => [
            h(
              ActionButton,
              {
                ...(attrsRecord as Record<string, unknown>),
                isQuiet: true,
                isDisabled: false,
                ref: (value: unknown) => {
                  triggerButtonRef.value = toHTMLElement(value);
                },
                "aria-label": ariaLabel,
                "aria-labelledby": ariaLabelledby,
                UNSAFE_className: classNames(
                  "react-spectrum-ContextualHelp-button",
                  props.UNSAFE_className as ClassValue | undefined
                ),
              },
              {
                default: () => icon,
              }
            ),
            h(
              ClearSlots,
              null,
              {
                default: () =>
                  h(
                    SlotProvider,
                    {
                      slots: {
                        content: {
                          UNSAFE_className:
                            "react-spectrum-ContextualHelp-content",
                        },
                        footer: {
                          UNSAFE_className:
                            "react-spectrum-ContextualHelp-footer",
                        },
                      },
                    },
                    {
                      default: () =>
                        h(
                          Dialog,
                          {
                            UNSAFE_className: classNames(
                              "react-spectrum-ContextualHelp-dialog"
                            ),
                          },
                          {
                            default: () => decorateChildren(normalizeChildren(slots.default?.())),
                          }
                        ),
                    }
                  ),
              }
            ),
          ],
        }
      );
    };
  },
});
