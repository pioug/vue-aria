import {
  defineComponent,
  h,
  nextTick,
  onMounted,
  ref,
  type PropType,
} from "vue";
import { filterDOMProps, mergeProps } from "@vue-aria/utils";
import {
  classNames,
  SlotProvider,
  useSlotProps,
  useStyleProps,
  type ClassValue,
} from "@vue-spectrum/utils";

export type InlineAlertVariant =
  | "neutral"
  | "info"
  | "positive"
  | "notice"
  | "negative";

const INLINE_ALERT_ICON_SYMBOL: Record<
  Exclude<InlineAlertVariant, "neutral">,
  string
> = {
  info: "i",
  positive: "✓",
  notice: "!",
  negative: "!",
};

const INLINE_ALERT_ICON_LABEL: Record<
  Exclude<InlineAlertVariant, "neutral">,
  string
> = {
  info: "Information",
  positive: "Success",
  notice: "Warning",
  negative: "Error",
};

export interface SpectrumInlineAlertProps {
  variant?: InlineAlertVariant | undefined;
  autoFocus?: boolean | undefined;
  slot?: string | undefined;
  UNSAFE_className?: string | undefined;
  UNSAFE_style?: Record<string, string | number> | undefined;
}

export const InlineAlert = defineComponent({
  name: "InlineAlert",
  inheritAttrs: false,
  props: {
    variant: {
      type: String as PropType<InlineAlertVariant | undefined>,
      default: undefined,
    },
    autoFocus: {
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
    UNSAFE_style: {
      type: Object as PropType<Record<string, string | number> | undefined>,
      default: undefined,
    },
  },
  setup(props, { attrs, slots, expose }) {
    const elementRef = ref<HTMLElement | null>(null);
    const shouldAutoFocus = ref(Boolean(props.autoFocus));

    onMounted(() => {
      if (!shouldAutoFocus.value) {
        return;
      }

      void nextTick(() => {
        elementRef.value?.focus();
      });

      shouldAutoFocus.value = false;
    });

    expose({
      UNSAFE_getDOMNode: () => elementRef.value,
    });

    return () => {
      const slotProps = useSlotProps(
        {
          ...(attrs as Record<string, unknown>),
          variant: props.variant,
          autoFocus: props.autoFocus,
          slot: props.slot,
          UNSAFE_className: props.UNSAFE_className,
          UNSAFE_style: props.UNSAFE_style,
        } as Record<string, unknown> & { id?: string; slot?: string },
        "inlinealert"
      );
      const { styleProps } = useStyleProps(
        slotProps as {
          UNSAFE_className?: string;
          UNSAFE_style?: Record<string, string | number>;
        } & Record<string, unknown>
      );
      const domProps = filterDOMProps(slotProps as Record<string, unknown>);
      const variant = (slotProps.variant as InlineAlertVariant | undefined) ?? "neutral";
      const showVariantIcon = variant !== "neutral";
      const iconSymbol = showVariantIcon
        ? INLINE_ALERT_ICON_SYMBOL[variant as Exclude<InlineAlertVariant, "neutral">]
        : undefined;
      const iconLabel = showVariantIcon
        ? INLINE_ALERT_ICON_LABEL[variant as Exclude<InlineAlertVariant, "neutral">]
        : undefined;

      const rootProps = mergeProps(domProps, styleProps, {
        ref: (value: unknown) => {
          elementRef.value = value as HTMLElement | null;
        },
        role: "alert",
        tabIndex: slotProps.autoFocus ? -1 : undefined,
        class: classNames(
          "spectrum-InLineAlert",
          `spectrum-InLineAlert--${variant}`,
          styleProps.class as ClassValue | undefined,
          domProps.class as ClassValue | undefined
        ),
        style: styleProps.style,
      });

      return h("div", rootProps, [
        h(
          "div",
          {
            class: classNames("spectrum-InLineAlert-grid"),
          },
          [
            showVariantIcon
              ? h(
                  "span",
                  {
                    class: classNames("spectrum-InLineAlert-icon"),
                    role: "img",
                    "aria-label": iconLabel,
                  },
                  iconSymbol
                )
              : null,
            h(
              SlotProvider,
              {
                slots: {
                  heading: {
                    UNSAFE_className: classNames("spectrum-InLineAlert-heading"),
                  },
                  content: {
                    UNSAFE_className: classNames("spectrum-InLineAlert-content"),
                  },
                },
              },
              {
                default: () => slots.default?.(),
              }
            ),
          ]
        ),
      ]);
    };
  },
});
