import { clamp } from "@vue-aria/utils";
import { useLocale } from "@vue-aria/i18n";
import { computed, defineComponent, h, type PropType } from "vue";
import { SliderBase, type SliderBaseChildArguments } from "./SliderBase";
import { SliderThumb } from "./SliderThumb";
import type { SpectrumSliderProps } from "./types";

export const Slider = defineComponent({
  name: "SpectrumSlider",
  props: {
    value: Number,
    defaultValue: Number,
    onChange: Function as PropType<(value: number) => void>,
    onChangeEnd: Function as PropType<(value: number) => void>,
    minValue: Number,
    maxValue: Number,
    step: Number,
    orientation: String as PropType<"horizontal" | "vertical">,
    isDisabled: Boolean,
    label: String,
    labelPosition: String as PropType<"top" | "side">,
    showValueLabel: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    formatOptions: Object as PropType<Intl.NumberFormatOptions>,
    getValueLabel: Function as PropType<(value: number) => string>,
    name: String,
    form: String,
    isFilled: Boolean,
    fillOffset: Number,
    trackGradient: Array as PropType<string[]>,
  },
  setup(props, { attrs }) {
    const locale = useLocale();
    const value = computed(() => (props.value != null ? [props.value] : undefined));
    const defaultValue = computed(() =>
      props.defaultValue != null ? [props.defaultValue] : undefined
    );

    return () =>
      h(
        SliderBase,
        {
          ...attrs,
          value: value.value,
          defaultValue: defaultValue.value,
          onChange: (next: number[]) => {
            const nextValue = next[0] ?? 0;
            props.onChange?.(nextValue);
          },
          onChangeEnd: (next: number[]) => {
            const nextValue = next[0] ?? 0;
            props.onChangeEnd?.(nextValue);
          },
          minValue: props.minValue,
          maxValue: props.maxValue,
          step: props.step,
          orientation: props.orientation,
          isDisabled: props.isDisabled,
          label: props.label,
          labelPosition: props.labelPosition,
          showValueLabel: props.showValueLabel,
          formatOptions: props.formatOptions,
          getValueLabel: props.getValueLabel
            ? (next: number[]) => props.getValueLabel?.(next[0] ?? 0) ?? ""
            : undefined,
          classes: {
            "spectrum-Slider--filled": props.isFilled && props.fillOffset == null,
          },
          style:
            props.trackGradient && props.trackGradient.length > 0
              ? {
                  "--spectrum-slider-track-gradient": `linear-gradient(to ${
                    locale.value.direction === "ltr" ? "right" : "left"
                  }, ${props.trackGradient.join(", ")})`,
                }
              : undefined,
        },
        {
          default: ({ trackRef, inputRef, state }: SliderBaseChildArguments) => {
            const fillOffset =
              props.fillOffset != null
                ? clamp(props.fillOffset, state.getThumbMinValue(0), state.getThumbMaxValue(0))
                : undefined;
            const cssDirection = locale.value.direction === "rtl" ? "right" : "left";

            const lowerTrack = h("div", {
              class: "spectrum-Slider-track",
              style: {
                width: `${state.getThumbPercent(0) * 100}%`,
                "--spectrum-track-background-size": `${(1 / state.getThumbPercent(0)) * 100}%`,
                "--spectrum-track-background-position":
                  locale.value.direction === "ltr" ? "0" : "100%",
              },
            });

            const upperTrack = h("div", {
              class: "spectrum-Slider-track",
              style: {
                width: `${(1 - state.getThumbPercent(0)) * 100}%`,
                "--spectrum-track-background-size": `${
                  (1 / (1 - state.getThumbPercent(0))) * 100
                }%`,
                "--spectrum-track-background-position":
                  locale.value.direction === "ltr" ? "100%" : "0",
              },
            });

            let filledTrack = null;
            if (props.isFilled && fillOffset != null) {
              const width = state.getThumbPercent(0) - state.getValuePercent(fillOffset);
              const isRightOfOffset = width > 0;
              const offset = isRightOfOffset
                ? state.getValuePercent(fillOffset)
                : state.getThumbPercent(0);

              filledTrack = h("div", {
                class: [
                  "spectrum-Slider-fill",
                  isRightOfOffset ? "spectrum-Slider-fill--right" : null,
                ],
                style: {
                  [cssDirection]: `${offset * 100}%`,
                  width: `${Math.abs(width) * 100}%`,
                },
              });
            }

            return [
              lowerTrack,
              h(SliderThumb, {
                index: 0,
                isDisabled: props.isDisabled,
                trackRef,
                inputRef,
                state,
                name: props.name,
                form: props.form,
              }),
              filledTrack,
              upperTrack,
            ];
          },
        }
      );
  },
});
