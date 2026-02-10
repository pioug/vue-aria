import {
  cloneVNode,
  defineComponent,
  h,
  isVNode,
  onMounted,
  onUpdated,
  ref,
  type PropType,
  type VNode,
  type VNodeChild,
} from "vue";
import { filterDOMProps, mergeProps } from "@vue-aria/utils";
import { useId } from "@vue-aria/ssr";
import { useProviderProps } from "@vue-spectrum/provider";
import { classNames, type ClassValue } from "@vue-spectrum/utils";
import { useCardViewContext } from "./CardViewContext";

export type CardOrientation = "vertical" | "horizontal";

export interface SpectrumCardProps {
  itemKey?: string | number | boolean | null | undefined;
  isDisabled?: boolean | undefined;
  isQuiet?: boolean | undefined;
  orientation?: CardOrientation | undefined;
  role?: string | undefined;
  tabIndex?: number | undefined;
  ariaLabel?: string | undefined;
  ariaLabelledby?: string | undefined;
  ariaDescribedby?: string | undefined;
  UNSAFE_className?: string | undefined;
  UNSAFE_style?: Record<string, string | number> | undefined;
}

function normalizeRenderable(
  value: VNodeChild | VNodeChild[] | undefined
): VNodeChild[] {
  if (value === undefined || value === null || value === false) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => normalizeRenderable(item));
  }

  return [value];
}

function getComponentName(node: VNode): string | undefined {
  if (typeof node.type === "object" && node.type !== null) {
    const maybeName = (node.type as { name?: unknown }).name;
    if (typeof maybeName === "string") {
      return maybeName;
    }
  }

  return undefined;
}

function isHeadingNode(node: VNode): boolean {
  if (typeof node.type === "string" && /^h[1-6]$/.test(node.type)) {
    return true;
  }

  return getComponentName(node) === "Heading";
}

function isContentNode(node: VNode): boolean {
  if (typeof node.type === "string" && node.type === "section") {
    return true;
  }

  return getComponentName(node) === "Content";
}

function isImageNode(node: VNode): boolean {
  if (typeof node.type === "string" && node.type === "img") {
    return true;
  }

  return getComponentName(node) === "Image";
}

function isAvatarNode(node: VNode): boolean {
  return getComponentName(node) === "Avatar";
}

export const Card = defineComponent({
  name: "Card",
  inheritAttrs: false,
  props: {
    itemKey: {
      type: null as unknown as PropType<string | number | boolean | null | undefined>,
      default: undefined,
    },
    isDisabled: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    isQuiet: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    orientation: {
      type: String as PropType<CardOrientation | undefined>,
      default: undefined,
    },
    role: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    tabIndex: {
      type: Number as PropType<number | undefined>,
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
    ariaDescribedby: {
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
  setup(props, { attrs, slots, expose }) {
    const elementRef = ref<HTMLElement | null>(null);
    const fallbackHeadingId = useId(undefined, "v-spectrum-card-heading");
    const fallbackDescriptionId = useId(undefined, "v-spectrum-card-description");
    const contextRef = useCardViewContext();
    const isProduction =
      typeof process !== "undefined" && process.env.NODE_ENV === "production";

    const warnFocusableChildren = () => {
      if (isProduction || !elementRef.value) {
        return;
      }

      const focusableNodes = elementRef.value.querySelectorAll<HTMLElement>(
        "a[href], button, input, select, textarea, [contenteditable='true'], [tabindex]"
      );

      for (const node of Array.from(focusableNodes)) {
        if (
          node.closest(".spectrum-Card-checkboxWrapper") ||
          node.classList.contains("spectrum-Card-checkbox")
        ) {
          continue;
        }

        const tabIndex = node.getAttribute("tabindex");
        if (tabIndex === "-1") {
          continue;
        }

        console.warn(
          "Card does not support focusable elements, please contact the team regarding your use case."
        );
        break;
      }
    };

    onMounted(() => {
      warnFocusableChildren();
    });

    onUpdated(() => {
      warnFocusableChildren();
    });

    expose({
      UNSAFE_getDOMNode: () => elementRef.value,
    });

    return () => {
      const context = contextRef?.value ?? null;
      const domProps = filterDOMProps(attrs as Record<string, unknown>);
      const resolvedProps = useProviderProps({
        isQuiet: props.isQuiet,
        orientation: props.orientation,
        isDisabled: props.isDisabled,
      });
      const orientation =
        (resolvedProps.orientation as CardOrientation | undefined) ?? "vertical";
      const isQuiet = Boolean(resolvedProps.isQuiet);
      const itemKey = props.itemKey;
      const isSelectedInView =
        itemKey !== undefined && Boolean(context?.isSelected(itemKey));
      const isDisabledInView =
        Boolean(resolvedProps.isDisabled) ||
        (itemKey !== undefined && Boolean(context?.isDisabled(itemKey)));
      const showsSelectionControl =
        context?.selectionMode !== undefined &&
        context.selectionMode !== "none" &&
        itemKey !== undefined;

      let headingId: string | undefined;
      let descriptionId: string | undefined;

      const processedChildren = normalizeRenderable(slots.default?.()).map((child) => {
        if (!isVNode(child) || typeof child.type === "symbol") {
          return child;
        }

        const nodeProps = (child.props ?? {}) as Record<string, unknown>;
        const slotName =
          typeof nodeProps.slot === "string" ? (nodeProps.slot as string) : undefined;

        if (isHeadingNode(child)) {
          const id =
            typeof nodeProps.id === "string"
              ? (nodeProps.id as string)
              : fallbackHeadingId.value;

          if (!headingId) {
            headingId = id;
          }

          return cloneVNode(
            child,
            {
              id,
              class: classNames(
                "spectrum-Card-heading",
                nodeProps.class as ClassValue | undefined
              ),
            },
            true
          );
        }

        if (isContentNode(child)) {
          const id =
            typeof nodeProps.id === "string"
              ? (nodeProps.id as string)
              : fallbackDescriptionId.value;

          if (!descriptionId) {
            descriptionId = id;
          }

          return cloneVNode(
            child,
            {
              id,
              class: classNames(
                "spectrum-Card-content",
                nodeProps.class as ClassValue | undefined
              ),
            },
            true
          );
        }

        if (slotName === "detail") {
          return cloneVNode(
            child,
            {
              class: classNames(
                "spectrum-Card-detail",
                nodeProps.class as ClassValue | undefined
              ),
            },
            true
          );
        }

        if (slotName === "illustration") {
          const illustrationClass = classNames(
            "spectrum-Card-illustration",
            nodeProps.class as ClassValue | undefined,
            nodeProps.UNSAFE_className as ClassValue | undefined
          );

          return cloneVNode(
            child,
            {
              class: illustrationClass,
              UNSAFE_className: illustrationClass,
            },
            true
          );
        }

        if (isImageNode(child)) {
          const imageClass = classNames(
            "spectrum-Card-image",
            nodeProps.class as ClassValue | undefined,
            nodeProps.UNSAFE_className as ClassValue | undefined
          );
          const cloneProps: Record<string, unknown> = {
            class: imageClass,
            UNSAFE_className: imageClass,
          };

          if (nodeProps.alt === undefined) {
            cloneProps.alt = "";
          }

          return cloneVNode(child, cloneProps, true);
        }

        if (isAvatarNode(child)) {
          const avatarClass = classNames(
            "spectrum-Card-avatar",
            nodeProps.class as ClassValue | undefined,
            nodeProps.UNSAFE_className as ClassValue | undefined
          );

          return cloneVNode(
            child,
            {
              class: avatarClass,
              UNSAFE_className: avatarClass,
            },
            true
          );
        }

        return child;
      });

      const hasPreview = processedChildren.some((child) => {
        if (!isVNode(child) || typeof child.type === "symbol") {
          return false;
        }

        const nodeProps = (child.props ?? {}) as Record<string, unknown>;
        return isImageNode(child) || nodeProps.slot === "illustration";
      });

      const explicitAriaLabel =
        props.ariaLabel ??
        ((attrs as Record<string, unknown>)["aria-label"] as string | undefined);
      const ariaLabelledBy =
        props.ariaLabelledby ??
        ((attrs as Record<string, unknown>)["aria-labelledby"] as string | undefined) ??
        (explicitAriaLabel ? undefined : headingId);
      const ariaDescribedBy =
        props.ariaDescribedby ??
        ((attrs as Record<string, unknown>)["aria-describedby"] as string | undefined) ??
        descriptionId;

      const cardClassName = classNames(
        "spectrum-Card",
        {
          "spectrum-Card--default": !isQuiet && orientation !== "horizontal",
          "spectrum-Card--isQuiet": isQuiet && orientation !== "horizontal",
          "spectrum-Card--horizontal": orientation === "horizontal",
          "spectrum-Card--noPreview": !hasPreview,
          "spectrum-Card--grid": context?.layout === "grid",
          "spectrum-Card--gallery": context?.layout === "gallery",
          "spectrum-Card--waterfall": context?.layout === "waterfall",
          "spectrum-Card--noLayout": context?.layout == null,
          "is-selected": isSelectedInView,
          "is-disabled": isDisabledInView,
        },
        props.UNSAFE_className as ClassValue | undefined,
        domProps.class as ClassValue | undefined
      );

      return h(
        "div",
        mergeProps(domProps, {
          ref: elementRef,
          role:
            props.role ??
            ((domProps.role as string | undefined) ??
              (context?.inCardView ? undefined : "article")),
          tabIndex:
            props.tabIndex ??
            ((domProps.tabIndex as number | undefined) ??
              (context?.inCardView ? undefined : 0)),
          class: cardClassName,
          style: {
            ...(typeof domProps.style === "object" && domProps.style !== null
              ? (domProps.style as Record<string, unknown>)
              : {}),
            ...(props.UNSAFE_style ?? {}),
          },
          "aria-label": explicitAriaLabel,
          "aria-labelledby": ariaLabelledBy,
          "aria-describedby": ariaDescribedBy,
        }),
        [
          h("div", { class: classNames("spectrum-Card-grid") }, [
            showsSelectionControl
              ? h("div", { class: classNames("spectrum-Card-checkboxWrapper") }, [
                  h("input", {
                    type: "checkbox",
                    "aria-label": "select",
                    class: classNames("spectrum-Card-checkbox"),
                    checked: isSelectedInView,
                    disabled: isDisabledInView,
                    tabIndex: -1,
                    onClick: (event: MouseEvent) => {
                      event.stopPropagation();
                      if (isDisabledInView) {
                        return;
                      }

                      context?.toggleSelection(itemKey);
                    },
                  }),
                ])
              : null,
            ...processedChildren,
            h("div", { class: classNames("spectrum-Card-decoration") }),
          ]),
        ]
      );
    };
  },
});
