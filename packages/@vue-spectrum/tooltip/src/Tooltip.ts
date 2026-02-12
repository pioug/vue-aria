import { defineComponent, h, ref, type PropType } from "vue";
import { useTooltip } from "@vue-aria/tooltip";
import { filterDOMProps, mergeProps } from "@vue-aria/utils";
import { classNames, useStyleProps, type ClassValue } from "@vue-spectrum/utils";
import { useProviderContext } from "@vue-spectrum/provider";

export type TooltipVariant = "neutral" | "info" | "positive" | "negative";
export type TooltipPlacement = "top" | "bottom" | "left" | "right" | "start" | "end";

export interface SpectrumTooltipProps {
  variant?: TooltipVariant | undefined;
  placement?: TooltipPlacement | undefined;
  isOpen?: boolean | undefined;
  showIcon?: boolean | undefined;
  ariaLabel?: string | undefined;
  ariaLabelledby?: string | undefined;
  "aria-label"?: string | undefined;
  "aria-labelledby"?: string | undefined;
  UNSAFE_className?: string | undefined;
  UNSAFE_style?: Record<string, string | number> | undefined;
}

export const Tooltip = defineComponent({
  name: "Tooltip",
  inheritAttrs: false,
  props: {
    variant: {
      type: String as PropType<TooltipVariant | undefined>,
      default: undefined,
    },
    placement: {
      type: String as PropType<TooltipPlacement | undefined>,
      default: undefined,
    },
    isOpen: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    showIcon: {
      type: Boolean as PropType<boolean | undefined>,
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
    const { tooltipProps } = useTooltip({});
    const provider = useProviderContext();

    expose({
      UNSAFE_getDOMNode: () => elementRef.value,
    });

    return () => {
      const attrsRecord = attrs as Record<string, unknown>;
      const styleInput = {
        ...attrsRecord,
        UNSAFE_className: props.UNSAFE_className,
        UNSAFE_style: props.UNSAFE_style,
      } as Record<string, unknown>;
      const { styleProps } = useStyleProps(styleInput);
      const domProps = filterDOMProps(attrsRecord, { labelable: true });
      const mergedProps = mergeProps(domProps, tooltipProps.value);
      const variant = props.variant ?? "neutral";
      const placement = props.placement ?? "top";
      const direction = provider?.value.direction ?? "ltr";
      const resolvedPlacement =
        placement === "start"
          ? direction === "rtl"
            ? "right"
            : "left"
          : placement === "end"
            ? direction === "rtl"
              ? "left"
              : "right"
            : placement;
      const isOpen = Boolean(props.isOpen);
      const showVariantIcon = Boolean(props.showIcon && variant !== "neutral");
      const ariaLabel =
        props.ariaLabel ??
        props["aria-label"] ??
        (attrsRecord["aria-label"] as string | undefined);
      const ariaLabelledby =
        props.ariaLabelledby ??
        props["aria-labelledby"] ??
        (attrsRecord["aria-labelledby"] as string | undefined);

      return h(
        "div",
        mergeProps(mergedProps, {
          ref: (value: unknown) => {
            elementRef.value = value as HTMLElement | null;
          },
          class: classNames(
            "spectrum-Tooltip",
            `spectrum-Tooltip--${variant}`,
            `spectrum-Tooltip--${resolvedPlacement}`,
            {
              "is-open": isOpen,
              [`is-open--${resolvedPlacement}`]: isOpen,
            },
            styleProps.class as ClassValue | undefined,
            domProps.class as ClassValue | undefined
          ),
          "aria-label": ariaLabel,
          "aria-labelledby": ariaLabelledby,
          style: styleProps.style,
        }),
        [
          showVariantIcon
            ? h(
                "span",
                {
                  class: classNames("spectrum-Tooltip-typeIcon"),
                  "aria-hidden": "true",
                },
                "!"
              )
            : null,
          slots.default
            ? h(
                "span",
                {
                  class: classNames("spectrum-Tooltip-label"),
                },
                slots.default()
              )
            : null,
          h("span", {
            class: classNames("spectrum-Tooltip-tip"),
            "aria-hidden": "true",
          }),
        ]
      );
    };
  },
});
