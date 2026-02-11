import clsx from "clsx";
import { computed, defineComponent, h, type PropType } from "vue";
import {
  Card as SpectrumCard,
  CardView as SpectrumCardView,
  type SpectrumCardProps,
  type SpectrumCardViewProps,
} from "@vue-spectrum/card";
import { useProviderProps } from "@vue-spectrum/provider";

export type CardSize = "XS" | "S" | "M" | "L" | "XL";
export type CardVariant = "primary" | "secondary" | "tertiary" | "quiet";

export interface S2CardProps extends SpectrumCardProps {
  size?: CardSize | undefined;
  variant?: CardVariant | undefined;
}

export interface S2CardViewProps<T = unknown> extends SpectrumCardViewProps<T> {}

function resolveStyledForwardedProps(
  attrs: Record<string, unknown>,
  className: string,
  props: {
    size?: CardSize | undefined;
    variant?: CardVariant | undefined;
    UNSAFE_className?: string | undefined;
    UNSAFE_style?: Record<string, string | number> | undefined;
  }
) {
  const attrsClassName =
    typeof attrs.UNSAFE_className === "string" ? (attrs.UNSAFE_className as string) : undefined;
  const attrsStyle =
    (attrs.UNSAFE_style as Record<string, string | number> | undefined) ?? undefined;

  return useProviderProps({
    ...attrs,
    UNSAFE_className: clsx(
      className,
      props.size ? `${className}--${props.size}` : null,
      props.variant ? `${className}--${props.variant}` : null,
      attrsClassName,
      props.UNSAFE_className
    ),
    UNSAFE_style: {
      ...(attrsStyle ?? {}),
      ...(props.UNSAFE_style ?? {}),
    },
    "data-s2-size": props.size,
    "data-s2-variant": props.variant,
  });
}

export const Card = defineComponent({
  name: "S2Card",
  inheritAttrs: false,
  props: {
    size: {
      type: String as PropType<CardSize | undefined>,
      default: undefined,
    },
    variant: {
      type: String as PropType<CardVariant | undefined>,
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
  setup(props, { attrs, slots }) {
    const forwardedProps = computed(() =>
      resolveStyledForwardedProps(attrs as Record<string, unknown>, "s2-Card", props)
    );

    return () => h(SpectrumCard, forwardedProps.value as Record<string, unknown>, slots);
  },
});

export const CardView = defineComponent({
  name: "S2CardView",
  inheritAttrs: false,
  props: {
    size: {
      type: String as PropType<CardSize | undefined>,
      default: undefined,
    },
    variant: {
      type: String as PropType<CardVariant | undefined>,
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
  setup(props, { attrs, slots }) {
    const forwardedProps = computed(() =>
      resolveStyledForwardedProps(attrs as Record<string, unknown>, "s2-CardView", props)
    );

    return () =>
      h(SpectrumCardView, forwardedProps.value as Record<string, unknown>, slots);
  },
});
