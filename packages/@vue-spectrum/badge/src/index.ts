import { useProviderProps } from "@vue-spectrum/provider";
import { useSlotProps, useStyleProps } from "@vue-spectrum/utils";
import { computed, defineComponent, h, isVNode, type PropType } from "vue";
import { Text } from "@vue-spectrum/text";

export interface SpectrumBadgeProps {
  variant?:
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
  tone?: SpectrumBadgeProps["variant"] | string;
  children?: unknown;
  count?: number;
  UNSAFE_className?: string;
  UNSAFE_style?: Record<string, unknown>;
}

function isTextOnly(children: unknown[]): boolean {
  return (
    children.length > 0
    && children.every((child) =>
      typeof child === "string"
      || typeof child === "number"
      || (isVNode(child) && child.type === Text)
    );
}

export const Badge = defineComponent({
  name: "SpectrumBadge",
  inheritAttrs: false,
  props: {
    variant: {
      type: String as PropType<SpectrumBadgeProps["variant"]>,
      required: false,
      default: undefined,
    },
    tone: {
      type: String,
      required: false,
      default: undefined,
    },
    count: {
      type: Number as PropType<number | undefined>,
      required: false,
    },
    UNSAFE_className: {
      type: String,
      required: false,
      default: undefined,
    },
    UNSAFE_style: {
      type: Object as PropType<Record<string, unknown> | undefined>,
      required: false,
      default: undefined,
    },
  },
  setup(props, { attrs, slots }) {
    const mergedProvider = useProviderProps({
      ...props,
      ...attrs,
    } as Record<string, unknown>) as SpectrumBadgeProps & Record<string, unknown>;
    const merged = useSlotProps(mergedProvider, "badge");
    const { styleProps } = useStyleProps(merged);

    const variant = computed(() => merged.variant ?? merged.tone);
    const children = computed(() => {
      const provided = slots.default?.() ?? [];
      if (provided.length > 0) {
        return isTextOnly(provided) ? [h(Text, null, provided)] : provided;
      }
      if (merged.count == null) {
        return [];
      }
      return [String(merged.count)];
    });

    return () => {
      const { tone: _tone, variant: _variant, count: _count, ...domProps } = merged as Record<
        string,
        unknown
      >;

      return h(
        "span",
        {
          ...domProps,
          ...styleProps.value,
          role: "presentation",
          class: [
            "spectrum-Badge",
            variant.value ? `spectrum-Badge--${variant.value}` : null,
            styleProps.value.class,
          ],
        },
        children.value
      );
    };
  },
});
