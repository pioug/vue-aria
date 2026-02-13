import { useLocale } from "@vue-aria/i18n";
import { computed, defineComponent, h, type PropType } from "vue";
import { SliderBase, type SliderBaseChildArguments } from "./SliderBase";
import { SliderThumb } from "./SliderThumb";
import type { RangeValue, SpectrumRangeSliderProps } from "./types";

export const RangeSlider = defineComponent({
  name: "SpectrumRangeSlider",
  props: {
    value: Object as PropType<RangeValue>,
    defaultValue: Object as PropType<RangeValue>,
    onChange: Function as PropType<(value: RangeValue) => void>,
    onChangeEnd: Function as PropType<(value: RangeValue) => void>,
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
    getValueLabel: Function as PropType<(value: RangeValue) => string>,
    startName: String,
    endName: String,
    form: String,
  },
  setup(props, { attrs }) {
    const locale = useLocale();
    const value = computed(() =>
      props.value != null ? [props.value.start, props.value.end] : undefined
    );
    const defaultValue = computed(() => {
      if (props.defaultValue != null) {
        return [props.defaultValue.start, props.defaultValue.end];
      }

      if (props.value == null) {
        return [props.minValue ?? 0, props.maxValue ?? 100];
      }

      return undefined;
    });

    return () =>
      h(
        SliderBase,
        {
          ...attrs,
          value: value.value,
          defaultValue: defaultValue.value,
          onChange: (next: number[]) => {
            const nextValue = {
              start: next[0] ?? 0,
              end: next[1] ?? 0,
            };
            props.onChange?.(nextValue);
          },
          onChangeEnd: (next: number[]) => {
            const nextValue = {
              start: next[0] ?? 0,
              end: next[1] ?? 0,
            };
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
            ? (next: number[]) =>
                props.getValueLabel?.({
                  start: next[0] ?? 0,
                  end: next[1] ?? 0,
                }) ?? ""
            : undefined,
          classes: "spectrum-Slider--range",
        },
        {
          default: ({ trackRef, inputRef, state }: SliderBaseChildArguments) => {
            const cssDirection = locale.value.direction === "rtl" ? "right" : "left";
            return [
              h("div", {
                class: "spectrum-Slider-track",
                style: {
                  width: `${state.getThumbPercent(0) * 100}%`,
                },
              }),
              h(SliderThumb, {
                index: 0,
                "aria-label": "Minimum",
                isDisabled: props.isDisabled,
                trackRef,
                inputRef,
                state,
                name: props.startName,
                form: props.form,
              }),
              h("div", {
                class: "spectrum-Slider-track",
                style: {
                  [cssDirection]: `${state.getThumbPercent(0) * 100}%`,
                  width: `${Math.abs(state.getThumbPercent(0) - state.getThumbPercent(1)) * 100}%`,
                },
              }),
              h(SliderThumb, {
                index: 1,
                "aria-label": "Maximum",
                isDisabled: props.isDisabled,
                trackRef,
                state,
                name: props.endName,
                form: props.form,
              }),
              h("div", {
                class: "spectrum-Slider-track",
                style: {
                  width: `${(1 - state.getThumbPercent(1)) * 100}%`,
                },
              }),
            ];
          },
        }
      );
  },
});
