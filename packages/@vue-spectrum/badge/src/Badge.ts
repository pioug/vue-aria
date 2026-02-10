import { defineComponent, h, ref, type PropType } from "vue";
import { filterDOMProps, mergeProps } from "@vue-aria/utils";
import { useProviderProps } from "@vue-spectrum/provider";
import { Text } from "@vue-spectrum/text";
import { classNames, type ClassValue } from "@vue-spectrum/utils";

export type BadgeVariant =
  | "neutral"
  | "info"
  | "positive"
  | "negative"
  | "indigo"
  | "yellow"
  | "magenta"
  | "fuchsia"
  | "purple"
  | "seafoam";

export interface SpectrumBadgeProps {
  variant?: BadgeVariant | undefined;
  UNSAFE_className?: string | undefined;
  UNSAFE_style?: Record<string, string | number> | undefined;
}

export const Badge = defineComponent({
  name: "Badge",
  inheritAttrs: false,
  props: {
    variant: {
      type: String as PropType<BadgeVariant | undefined>,
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

    expose({
      UNSAFE_getDOMNode: () => elementRef.value,
    });

    return () => {
      const resolvedProps = useProviderProps({
        variant: props.variant,
        UNSAFE_className: props.UNSAFE_className,
        UNSAFE_style: props.UNSAFE_style,
      });

      const domProps = filterDOMProps(attrs as Record<string, unknown>);
      const className = classNames(
        "spectrum-Badge",
        resolvedProps.variant
          ? (`spectrum-Badge--${resolvedProps.variant}` as ClassValue)
          : undefined,
        resolvedProps.UNSAFE_className as ClassValue | undefined,
        domProps.class as ClassValue | undefined
      );

      const children = slots.default?.() ?? [];
      const hasElementChildren = children.some((child) => typeof child !== "string");
      const content = hasElementChildren ? children : h(Text, null, () => children);

      const elementProps = mergeProps(domProps, {
        role: "presentation",
        class: className,
        style: resolvedProps.UNSAFE_style as
          | Record<string, string | number>
          | undefined,
        ref: elementRef,
      });

      return h("span", elementProps, content);
    };
  },
});
