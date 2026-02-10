import { computed, defineComponent, h, ref, type PropType } from "vue";
import { mergeProps } from "@vue-aria/utils";
import { classNames, useStyleProps, type ClassValue } from "@vue-spectrum/utils";
import type { SpectrumProgressBarBaseProps } from "./types";

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export interface ProgressBarBaseComponentProps extends SpectrumProgressBarBaseProps {
  barClassName?: ClassValue | undefined;
  barProps?: Record<string, unknown> | undefined;
  labelProps?: Record<string, unknown> | undefined;
}

export const ProgressBarBase = defineComponent({
  name: "ProgressBarBase",
  inheritAttrs: false,
  props: {
    value: {
      type: Number as PropType<number | undefined>,
      default: undefined,
    },
    minValue: {
      type: Number as PropType<number | undefined>,
      default: undefined,
    },
    maxValue: {
      type: Number as PropType<number | undefined>,
      default: undefined,
    },
    size: {
      type: String as PropType<"S" | "L" | undefined>,
      default: undefined,
    },
    label: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    valueLabel: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    labelPosition: {
      type: String as PropType<"top" | "side" | undefined>,
      default: undefined,
    },
    showValueLabel: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    isIndeterminate: {
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
    UNSAFE_className: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    UNSAFE_style: {
      type: Object as PropType<Record<string, string | number> | undefined>,
      default: undefined,
    },
    barClassName: {
      type: [String, Object, Array] as PropType<ClassValue | undefined>,
      default: undefined,
    },
    barProps: {
      type: Object as PropType<Record<string, unknown> | undefined>,
      default: undefined,
    },
    labelProps: {
      type: Object as PropType<Record<string, unknown> | undefined>,
      default: undefined,
    },
  },
  setup(props, { attrs, expose }) {
    const elementRef = ref<HTMLElement | null>(null);
    const isProduction =
      typeof process !== "undefined" && process.env.NODE_ENV === "production";
    const { styleProps } = useStyleProps(attrs as Record<string, unknown>);

    expose({
      UNSAFE_getDOMNode: () => elementRef.value,
    });

    const minValue = computed(() => props.minValue ?? 0);
    const maxValue = computed(() => props.maxValue ?? 100);
    const value = computed(() =>
      clamp(props.value ?? 0, minValue.value, maxValue.value)
    );

    const barStyle = computed<Record<string, string>>(() => {
      const style: Record<string, string> = {};
      if (!props.isIndeterminate) {
        const denominator = maxValue.value - minValue.value;
        const percentage =
          denominator <= 0 ? 0 : (value.value - minValue.value) / denominator;
        style.width = `${Math.round(percentage * 100)}%`;
      }

      return style;
    });

    const showValueLabel = computed(() =>
      props.showValueLabel === undefined ? Boolean(props.label) : props.showValueLabel
    );

    return () => {
      const ariaLabel =
        props.ariaLabel ??
        (attrs as Record<string, unknown>)["aria-label"] ??
        (attrs as Record<string, unknown>).ariaLabel;
      const ariaLabelledby =
        props.ariaLabelledby ??
        (attrs as Record<string, unknown>)["aria-labelledby"] ??
        (attrs as Record<string, unknown>).ariaLabelledby;

      if (
        !isProduction &&
        !props.label &&
        !ariaLabel &&
        !ariaLabelledby
      ) {
        console.warn(
          "If you do not provide a visible label via children, you must specify an aria-label or aria-labelledby attribute for accessibility"
        );
      }

      const outerClassName = classNames(
        "spectrum-BarLoader",
        {
          "spectrum-BarLoader--small": props.size === "S",
          "spectrum-BarLoader--large": props.size !== "S",
          "spectrum-BarLoader--indeterminate": Boolean(props.isIndeterminate),
          "spectrum-BarLoader--sideLabel": props.labelPosition === "side",
        },
        props.barClassName,
        props.UNSAFE_className as ClassValue | undefined,
        styleProps.class as ClassValue | undefined
      );

      return h(
        "div",
        mergeProps(props.barProps ?? {}, styleProps, {
          ref: elementRef,
          class: outerClassName,
          style: {
            minWidth: "-moz-fit-content",
            ...(styleProps.style ?? {}),
            ...(props.UNSAFE_style ?? {}),
          },
        }),
        [
          props.label
            ? h(
                "span",
                mergeProps(props.labelProps ?? {}, {
                  class: classNames("spectrum-BarLoader-label"),
                }),
                props.label
              )
            : null,
          showValueLabel.value && props.barProps
            ? h(
                "div",
                { class: classNames("spectrum-BarLoader-percentage") },
                String(props.barProps["aria-valuetext"] ?? "")
              )
            : null,
          h("div", { class: classNames("spectrum-BarLoader-track") }, [
            h("div", {
              class: classNames("spectrum-BarLoader-fill"),
              style: barStyle.value,
            }),
          ]),
        ]
      );
    };
  },
});
