import { useLink } from "@vue-aria/link";
import { FocusRing } from "@vue-aria/focus";
import { useHover } from "@vue-aria/interactions";
import { mergeProps } from "@vue-aria/utils";
import { useProviderProps } from "@vue-spectrum/provider";
import { getWrappedElement, useSlotProps, useStyleProps } from "@vue-spectrum/utils";
import {
  cloneVNode,
  Comment,
  defineComponent,
  h,
  isVNode,
  onMounted,
  ref,
  Text,
  type PropType,
} from "vue";
import type { SpectrumLinkProps } from "./types";

function createRefObject(domRef: { value: Element | null }) {
  return {
    get current() {
      return domRef.value;
    },
    set current(value: Element | null) {
      domRef.value = value;
    },
  };
}

function isSingleTextNode(children: unknown[]): boolean {
  return (
    children.length === 1
    && isVNode(children[0])
    && children[0].type === Text
    && typeof children[0].children === "string"
  );
}

/**
 * Links allow users to navigate to a different location.
 */
export const Link = defineComponent({
  name: "SpectrumLink",
  inheritAttrs: false,
  props: {
    href: {
      type: String,
      required: false,
    },
    target: {
      type: String,
      required: false,
    },
    rel: {
      type: String,
      required: false,
    },
    download: {
      type: [String, Boolean] as PropType<string | boolean | undefined>,
      required: false,
      default: undefined,
    },
    ping: {
      type: String,
      required: false,
    },
    referrerPolicy: {
      type: String,
      required: false,
    },
    routerOptions: {
      type: Object as PropType<Record<string, unknown> | undefined>,
      required: false,
    },
    isDisabled: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    variant: {
      type: String as () => SpectrumLinkProps["variant"],
      required: false,
      default: "primary",
    },
    isQuiet: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    autoFocus: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    onPress: {
      type: Function,
      required: false,
    },
    onPressStart: {
      type: Function,
      required: false,
    },
    onPressEnd: {
      type: Function,
      required: false,
    },
    onClick: {
      type: Function,
      required: false,
    },
    UNSAFE_className: {
      type: String,
      required: false,
    },
    UNSAFE_style: {
      type: Object,
      required: false,
    },
  },
  setup(props, { attrs, slots, expose }) {
    const domRef = ref<Element | null>(null);
    const domRefObject = createRefObject(domRef);
    const mergedProvider = useProviderProps({
      ...attrs,
      ...props,
    } as Record<string, unknown>) as SpectrumLinkProps & Record<string, unknown>;
    const merged = useSlotProps(mergedProvider, "link") as SpectrumLinkProps & Record<string, unknown>;
    const { styleProps } = useStyleProps(merged);
    const { hoverProps, isHovered } = useHover({});
    const { linkProps } = useLink(
      {
        ...merged,
        elementType: merged.href ? "a" : "span",
      },
      domRefObject
    );

    onMounted(() => {
      if (merged.autoFocus && domRef.value instanceof HTMLElement) {
        domRef.value.focus();
      }
    });

    expose({
      focus: () => (domRef.value instanceof HTMLElement ? domRef.value.focus() : undefined),
      UNSAFE_getDOMNode: () => domRef.value,
    });

    return () => {
      const slotChildren = slots.default?.() ?? [];
      const domProps = {
        ...styleProps.value,
        ...mergeProps(linkProps, hoverProps),
        ref: domRef,
        class: [
          "spectrum-Link",
          {
            "spectrum-Link--quiet": Boolean(merged.isQuiet),
            [`spectrum-Link--${merged.variant ?? "primary"}`]: Boolean(merged.variant ?? "primary"),
            "is-hovered": isHovered,
          },
          styleProps.value.class,
        ],
      };

      let linkNode;
      if (merged.href) {
        linkNode = h("a", domProps, slotChildren);
      } else {
        if (isSingleTextNode(slotChildren as unknown[])) {
          linkNode = h("span", domProps, slotChildren);
        } else {
          try {
            const wrapped = getWrappedElement(slotChildren as any);
            if (wrapped.type !== Text && wrapped.type !== Comment) {
              const wrappedProps = mergeProps((wrapped.props ?? {}) as Record<string, unknown>, domProps);
              linkNode = cloneVNode(wrapped, wrappedProps, true);
            } else {
              linkNode = h("span", domProps, slotChildren);
            }
          } catch {
            linkNode = h("span", domProps, slotChildren);
          }
        }
      }

      return h(
        FocusRing,
        { focusRingClass: "focus-ring" },
        {
          default: () => linkNode,
        }
      );
    };
  },
});
