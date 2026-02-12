import {
  defineComponent,
  h,
  nextTick,
  onMounted,
  ref,
  type PropType,
} from "vue";
import { useFocusRing } from "@vue-aria/focus";
import { useLocalizedStringFormatter } from "@vue-aria/i18n";
import { filterDOMProps, mergeProps } from "@vue-aria/utils";
import { useProviderProps } from "@vue-spectrum/provider";
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

const INLINE_ALERT_INTL_MESSAGES = {
  "en-US": INLINE_ALERT_ICON_LABEL,
  "fr-FR": {
    info: "Informations",
    positive: "Succès",
    notice: "Avertissement",
    negative: "Erreur",
  },
} as const;

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
    const { focusProps, isFocusVisible } = useFocusRing();
    const stringFormatter = useLocalizedStringFormatter(INLINE_ALERT_INTL_MESSAGES);

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
      const resolvedProps = useProviderProps(
        slotProps as {
          variant?: InlineAlertVariant;
          autoFocus?: boolean;
          UNSAFE_className?: string;
          UNSAFE_style?: Record<string, string | number>;
        } & Record<string, unknown>
      );
      const { styleProps } = useStyleProps(
        resolvedProps as {
          UNSAFE_className?: string;
          UNSAFE_style?: Record<string, string | number>;
        } & Record<string, unknown>
      );
      const domProps = filterDOMProps(resolvedProps as Record<string, unknown>);
      const variant = (resolvedProps.variant as InlineAlertVariant | undefined) ?? "neutral";
      const showVariantIcon = variant !== "neutral";
      const iconSymbol = showVariantIcon
        ? INLINE_ALERT_ICON_SYMBOL[variant as Exclude<InlineAlertVariant, "neutral">]
        : undefined;
      const iconLabel = showVariantIcon
        ? stringFormatter.value.format(
            variant as Exclude<InlineAlertVariant, "neutral">
          )
        : undefined;

      const rootProps = mergeProps(domProps, styleProps, focusProps, {
        ref: (value: unknown) => {
          elementRef.value = value as HTMLElement | null;
        },
        role: "alert",
        tabIndex: resolvedProps.autoFocus ? -1 : undefined,
        autofocus: resolvedProps.autoFocus ? true : undefined,
        class: classNames(
          "spectrum-InLineAlert",
          `spectrum-InLineAlert--${variant}`,
          {
            "focus-ring": isFocusVisible.value,
          },
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
