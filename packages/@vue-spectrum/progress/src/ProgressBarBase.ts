import { clamp } from "@vue-aria/utils";
import { useStyleProps } from "@vue-spectrum/utils";
import { computed, defineComponent, h, type PropType } from "vue";
import type { SpectrumProgressBarBaseProps } from "./types";

/**
 * Shared base for bar-like progress components.
 */
export const ProgressBarBase = defineComponent({
  name: "SpectrumProgressBarBase",
  inheritAttrs: false,
  props: {
    value: {
      type: Number as () => number | undefined,
      required: false,
      default: undefined,
    },
    minValue: {
      type: Number as () => number | undefined,
      required: false,
      default: 0,
    },
    maxValue: {
      type: Number as () => number | undefined,
      required: false,
      default: 100,
    },
    label: {
      type: String,
      required: false,
    },
    isIndeterminate: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    size: {
      type: String as () => SpectrumProgressBarBaseProps["size"],
      required: false,
      default: "L",
    },
    showValueLabel: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    labelPosition: {
      type: String as () => SpectrumProgressBarBaseProps["labelPosition"],
      required: false,
      default: "top",
    },
    barClassName: {
      type: String,
      required: false,
    },
    barProps: {
      type: Object as PropType<Record<string, unknown> | undefined>,
      required: false,
    },
    labelProps: {
      type: Object as PropType<Record<string, unknown> | undefined>,
      required: false,
    },
    "aria-label": {
      type: String,
      required: false,
    },
    "aria-labelledby": {
      type: String,
      required: false,
    },
    UNSAFE_className: {
      type: String,
      required: false,
    },
    UNSAFE_style: {
      type: Object as PropType<Record<string, unknown> | undefined>,
      required: false,
    },
  },
  setup(props, { expose }) {
    const { styleProps } = useStyleProps(props as unknown as Record<string, unknown>);
    const value = computed(() => clamp(props.value ?? 0, props.minValue ?? 0, props.maxValue ?? 100));
    const showValueLabel = computed(() => props.showValueLabel ?? Boolean(props.label));
    const barStyle = computed(() => {
      if (props.isIndeterminate) {
        return {};
      }

      const percentage = ((value.value - (props.minValue ?? 0)) / ((props.maxValue ?? 100) - (props.minValue ?? 0))) * 100;
      return {
        width: `${Math.round(percentage)}%`,
      };
    });

    if (
      !props.label
      && !props["aria-label"]
      && !props["aria-labelledby"]
      && !props.barProps?.["aria-label"]
      && !props.barProps?.["aria-labelledby"]
      && process.env.NODE_ENV !== "production"
    ) {
      console.warn(
        "If you do not provide a visible label via children, you must specify an aria-label or aria-labelledby attribute for accessibility"
      );
    }

    expose({
      UNSAFE_getDOMNode: () => null,
    });

    return () =>
      h(
        "div",
        {
          ...(props.barProps ?? {}),
          ...styleProps.value,
          class: [
            "spectrum-BarLoader",
            {
              "spectrum-BarLoader--small": props.size === "S",
              "spectrum-BarLoader--large": props.size === "L",
              "spectrum-BarLoader--indeterminate": Boolean(props.isIndeterminate),
              "spectrum-BarLoader--sideLabel": props.labelPosition === "side",
            },
            props.barClassName,
            styleProps.value.class,
          ],
          style: {
            minWidth: "-moz-fit-content",
            ...(styleProps.value.style as Record<string, unknown> | undefined),
          },
        },
        [
          props.label
            ? h(
                "span",
                {
                  ...(props.labelProps ?? {}),
                  class: "spectrum-BarLoader-label",
                },
                props.label
              )
            : null,
          showValueLabel.value && props.barProps
            ? h("div", { class: "spectrum-BarLoader-percentage" }, String(props.barProps["aria-valuetext"] ?? ""))
            : null,
          h("div", { class: "spectrum-BarLoader-track" }, [
            h("div", {
              class: "spectrum-BarLoader-fill",
              style: barStyle.value,
            }),
          ]),
        ]
      );
  },
});
