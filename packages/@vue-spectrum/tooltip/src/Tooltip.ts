import { mergeProps } from "@vue-aria/utils";
import { useLocalizedStringFormatter } from "@vue-aria/i18n";
import { useTooltip } from "@vue-aria/tooltip";
import { computed, defineComponent, h, inject, ref } from "vue";
import { TooltipContext } from "./context";
import { intlMessages } from "./intlMessages";
import type { SpectrumTooltipPlacement, SpectrumTooltipProps, SpectrumTooltipVariant } from "./types";

const iconText: Record<Exclude<SpectrumTooltipVariant, "neutral">, string> = {
  info: "i",
  positive: "✓",
  negative: "!",
};

/**
 * Display container for Tooltip content. Includes directional classes and optional semantic icon.
 */
export const Tooltip = defineComponent({
  name: "SpectrumTooltip",
  inheritAttrs: false,
  props: {
    variant: {
      type: String as () => SpectrumTooltipVariant | undefined,
      required: false,
      default: "neutral",
    },
    placement: {
      type: String as () => SpectrumTooltipPlacement | undefined,
      required: false,
      default: undefined,
    },
    isOpen: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    showIcon: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    UNSAFE_className: {
      type: String,
      required: false,
    },
    UNSAFE_style: {
      type: Object as () => Record<string, unknown> | undefined,
      required: false,
    },
  },
  setup(props, { attrs, slots, expose }) {
    const contextRef = inject(TooltipContext, ref(null));
    const context = computed(() => contextRef?.value ?? null);
    const stringFormatter = useLocalizedStringFormatter(intlMessages as any, "@vue-spectrum/tooltip");
    const domRef = ref<HTMLElement | null>(null);
    const backupPlacement = props.placement;
    const { tooltipProps } = useTooltip(
      {
        ...props,
        ...attrs,
      } as Record<string, unknown>,
      context.value?.state
    );

    const setOverlayRef = (value: Element | null) => {
      domRef.value = value as HTMLElement | null;
    };

    const setArrowRef = (value: Element | null) => {
      if (context.value?.arrowRef && context.value.arrowRef.current !== value) {
        context.value.arrowRef.current = value;
      }
    };

    expose({
      UNSAFE_getDOMNode: () => domRef.value,
      focus: () => domRef.value?.focus(),
    });

    return () => {
      const merged = mergeProps(
        {
          ...props,
          ...attrs,
        } as Record<string, unknown>,
        {
          ...context.value?.tooltipProps,
          placement: context.value?.placement ?? undefined,
          UNSAFE_style: context.value?.UNSAFE_style,
        }
      ) as SpectrumTooltipProps & Record<string, unknown>;
      const variant = merged.variant ?? "neutral";
      const placement = (merged.placement as string | undefined) ?? backupPlacement ?? "top";
      const isOpen = Boolean(merged.isOpen);
      const showIcon = Boolean(merged.showIcon);
      const iconLabel =
        variant !== "neutral"
          ? stringFormatter.format(variant as Exclude<SpectrumTooltipVariant, "neutral">)
          : undefined;
      const rootProps = mergeProps(
        attrs as Record<string, unknown>,
        tooltipProps,
        context.value?.tooltipProps ?? {}
      );
      delete rootProps.class;
      delete rootProps.style;
      const arrowProps = {
        ...(context.value?.arrowProps ?? {}),
      };
      const arrowClass = ["spectrum-Tooltip-tip", (arrowProps as Record<string, unknown>).class];
      delete (arrowProps as Record<string, unknown>).class;

      return h(
        "div",
        {
          ...rootProps,
          ref: setOverlayRef as any,
          class: [
            "spectrum-Tooltip",
            `spectrum-Tooltip--${variant}`,
            `spectrum-Tooltip--${placement}`,
            {
              "is-open": isOpen,
              [`is-open--${placement}`]: isOpen,
            },
            merged.UNSAFE_className,
            attrs.class,
          ],
          style: [context.value?.UNSAFE_style, merged.UNSAFE_style, attrs.style],
        },
        [
          showIcon && variant !== "neutral"
            ? h(
                "span",
                {
                  class: ["spectrum-Tooltip-typeIcon", "spectrum-Icon"],
                  role: "img",
                  "aria-label": iconLabel,
                },
                iconText[variant as Exclude<SpectrumTooltipVariant, "neutral">]
              )
            : null,
          slots.default
            ? h(
                "span",
                {
                  class: "spectrum-Tooltip-label",
                },
                slots.default()
              )
            : null,
          h("span", {
            ...arrowProps,
            ref: setArrowRef as any,
            class: arrowClass,
          }),
        ]
      );
    };
  },
});
