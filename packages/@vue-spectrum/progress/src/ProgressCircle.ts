import { useProgressBar } from "@vue-aria/progress";
import { clamp } from "@vue-aria/utils";
import { useStyleProps } from "@vue-spectrum/utils";
import { computed, defineComponent, h, type CSSProperties } from "vue";
import type { SpectrumProgressCircleProps } from "./types";

/**
 * ProgressCircle shows operation progress in circular form.
 */
export const ProgressCircle = defineComponent({
  name: "SpectrumProgressCircle",
  inheritAttrs: false,
  props: {
    value: {
      type: Number as () => number | undefined,
      required: false,
      default: 0,
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
    valueLabel: {
      type: String,
      required: false,
    },
    isIndeterminate: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: false,
    },
    formatOptions: {
      type: Object as () => Intl.NumberFormatOptions | undefined,
      required: false,
    },
    size: {
      type: String as () => SpectrumProgressCircleProps["size"],
      required: false,
      default: "M",
    },
    staticColor: {
      type: String as () => SpectrumProgressCircleProps["staticColor"],
      required: false,
    },
    variant: {
      type: String as () => SpectrumProgressCircleProps["variant"],
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
  setup(props, { attrs }) {
    const merged = {
      ...props,
      ...attrs,
      value: clamp(props.value ?? 0, props.minValue ?? 0, props.maxValue ?? 100),
    } as SpectrumProgressCircleProps & Record<string, unknown>;
    const { progressBarProps } = useProgressBar(merged);
    const { styleProps } = useStyleProps(merged);
    const subMask1Style = computed<CSSProperties>(() => {
      if (merged.isIndeterminate) {
        return {};
      }

      const percentage = ((merged.value! - (merged.minValue ?? 0)) / ((merged.maxValue ?? 100) - (merged.minValue ?? 0))) * 100;
      if (percentage > 0 && percentage <= 50) {
        const angle = -180 + (percentage / 50) * 180;
        return { transform: `rotate(${angle}deg)` };
      }

      if (percentage > 50) {
        return { transform: "rotate(0deg)" };
      }

      return {};
    });
    const subMask2Style = computed<CSSProperties>(() => {
      if (merged.isIndeterminate) {
        return {};
      }

      const percentage = ((merged.value! - (merged.minValue ?? 0)) / ((merged.maxValue ?? 100) - (merged.minValue ?? 0))) * 100;
      if (percentage > 0 && percentage <= 50) {
        return { transform: "rotate(-180deg)" };
      }

      if (percentage > 50) {
        const angle = -180 + ((percentage - 50) / 50) * 180;
        return { transform: `rotate(${angle}deg)` };
      }

      return {};
    });

    if (!attrs["aria-label"] && !attrs["aria-labelledby"] && process.env.NODE_ENV !== "production") {
      console.warn("ProgressCircle requires an aria-label or aria-labelledby attribute for accessibility");
    }

    return () =>
      h(
        "div",
        {
          ...styleProps.value,
          ...progressBarProps,
          class: [
            "spectrum-CircleLoader",
            {
              "spectrum-CircleLoader--indeterminate": Boolean(merged.isIndeterminate),
              "spectrum-CircleLoader--small": merged.size === "S",
              "spectrum-CircleLoader--large": merged.size === "L",
              "spectrum-CircleLoader--overBackground": merged.variant === "overBackground",
              "spectrum-CircleLoader--staticWhite": merged.staticColor === "white",
              "spectrum-CircleLoader--staticBlack": merged.staticColor === "black",
            },
            styleProps.value.class,
          ],
        },
        [
          h("div", { class: "spectrum-CircleLoader-track" }),
          h("div", { class: "spectrum-CircleLoader-fills" }, [
            h("div", { class: "spectrum-CircleLoader-fillMask1" }, [
              h(
                "div",
                {
                  class: "spectrum-CircleLoader-fillSubMask1",
                  "data-testid": "fillSubMask1",
                  style: subMask1Style.value,
                },
                [h("div", { class: "spectrum-CircleLoader-fill" })]
              ),
            ]),
            h("div", { class: "spectrum-CircleLoader-fillMask2" }, [
              h(
                "div",
                {
                  class: "spectrum-CircleLoader-fillSubMask2",
                  "data-testid": "fillSubMask2",
                  style: subMask2Style.value,
                },
                [h("div", { class: "spectrum-CircleLoader-fill" })]
              ),
            ]),
          ]),
        ]
      );
  },
});
