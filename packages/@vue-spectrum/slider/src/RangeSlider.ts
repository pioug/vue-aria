import { computed, defineComponent, h, type PropType } from "vue";
import { useLocalizedStringFormatter } from "@vue-aria/i18n";
import { classNames } from "@vue-spectrum/utils";
import {
  SliderBase,
  type SpectrumSliderBaseProps,
  type SpectrumSliderLabelPosition,
  type SpectrumSliderOrientation,
} from "./SliderBase";
import { sliderMessages } from "./intlMessages";
import { SliderThumb } from "./SliderThumb";

export interface NumberRangeValue {
  start: number;
  end: number;
}

export interface SpectrumRangeSliderProps
  extends Omit<
    SpectrumSliderBaseProps,
    | "value"
    | "defaultValue"
    | "onChange"
    | "onChangeEnd"
    | "getValueLabel"
    | "renderTrack"
  > {
  value?: NumberRangeValue | undefined;
  defaultValue?: NumberRangeValue | undefined;
  onChange?: ((value: NumberRangeValue) => void) | undefined;
  onChangeEnd?: ((value: NumberRangeValue) => void) | undefined;
  getValueLabel?: ((value: NumberRangeValue) => string) | undefined;
  startName?: string | undefined;
  endName?: string | undefined;
  form?: string | undefined;
}

export const RangeSlider = defineComponent({
  name: "RangeSlider",
  inheritAttrs: false,
  props: {
    value: {
      type: Object as PropType<NumberRangeValue | undefined>,
      default: undefined,
    },
    defaultValue: {
      type: Object as PropType<NumberRangeValue | undefined>,
      default: undefined,
    },
    onChange: {
      type: Function as PropType<((value: NumberRangeValue) => void) | undefined>,
      default: undefined,
    },
    onChangeEnd: {
      type: Function as PropType<((value: NumberRangeValue) => void) | undefined>,
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
    step: {
      type: Number as PropType<number | undefined>,
      default: undefined,
    },
    pageSize: {
      type: Number as PropType<number | undefined>,
      default: undefined,
    },
    orientation: {
      type: String as PropType<SpectrumSliderOrientation | undefined>,
      default: undefined,
    },
    direction: {
      type: String as PropType<"ltr" | "rtl" | undefined>,
      default: undefined,
    },
    label: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    labelPosition: {
      type: String as PropType<SpectrumSliderLabelPosition | undefined>,
      default: undefined,
    },
    showValueLabel: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    getValueLabel: {
      type: Function as PropType<((value: NumberRangeValue) => string) | undefined>,
      default: undefined,
    },
    formatOptions: {
      type: Object as PropType<Intl.NumberFormatOptions | undefined>,
      default: undefined,
    },
    isDisabled: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    isRequired: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    isInvalid: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    validationState: {
      type: String as PropType<"valid" | "invalid" | undefined>,
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
    ariaDescribedby: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    ariaDetails: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    ariaErrormessage: {
      type: String as PropType<string | undefined>,
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
    startName: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    endName: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    form: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
  },
  setup(props, { attrs }) {
    const stringFormatter = useLocalizedStringFormatter(sliderMessages);

    const defaultThumbValues = computed(() => {
      if (props.defaultValue) {
        return [props.defaultValue.start, props.defaultValue.end];
      }

      if (props.value) {
        return undefined;
      }

      return [props.minValue ?? 0, props.maxValue ?? 100];
    });

    return () =>
      h(
        SliderBase,
        {
          ...(attrs as Record<string, unknown>),
          value: props.value ? [props.value.start, props.value.end] : undefined,
          defaultValue: defaultThumbValues.value,
          onChange: props.onChange
            ? (value: number[]) => {
                props.onChange?.({
                  start: value[0] ?? 0,
                  end: value[1] ?? 0,
                });
              }
            : undefined,
          onChangeEnd: props.onChangeEnd
            ? (value: number[]) => {
                props.onChangeEnd?.({
                  start: value[0] ?? 0,
                  end: value[1] ?? 0,
                });
              }
            : undefined,
          minValue: props.minValue,
          maxValue: props.maxValue,
          step: props.step,
          pageSize: props.pageSize,
          orientation: props.orientation,
          direction: props.direction,
          label: props.label,
          labelPosition: props.labelPosition,
          showValueLabel: props.showValueLabel,
          getValueLabel: props.getValueLabel
            ? (value: readonly number[]) =>
                props.getValueLabel?.({
                  start: value[0] ?? 0,
                  end: value[1] ?? 0,
                }) ?? ""
            : undefined,
          formatOptions: props.formatOptions,
          isDisabled: props.isDisabled,
          isRequired: props.isRequired,
          isInvalid: props.isInvalid,
          validationState: props.validationState,
          ariaLabel: props.ariaLabel,
          ariaLabelledby: props.ariaLabelledby,
          ariaDescribedby: props.ariaDescribedby,
          ariaDetails: props.ariaDetails,
          ariaErrormessage: props.ariaErrormessage,
          classes: classNames("spectrum-Slider--range"),
          slot: props.slot,
          UNSAFE_className: props.UNSAFE_className,
          UNSAFE_style: props.UNSAFE_style,
          renderTrack: ({ trackRef, inputRef, state, direction }) => {
            const startPercent = state.getThumbPercent(0);
            const endPercent = state.getThumbPercent(1);
            const cssDirection = direction === "rtl" ? "right" : "left";

            return [
              h("div", {
                class: classNames("spectrum-Slider-track"),
                style: {
                  width: `${startPercent * 100}%`,
                },
              }),
              h(SliderThumb, {
                index: 0,
                ariaLabel: stringFormatter.value.format("minimum"),
                isDisabled: state.isDisabled.value,
                trackRef,
                inputRef,
                state,
                name: props.startName,
                form: props.form,
                direction,
              }),
              h("div", {
                class: classNames("spectrum-Slider-track"),
                style: {
                  [cssDirection]: `${startPercent * 100}%`,
                  width: `${Math.abs(startPercent - endPercent) * 100}%`,
                },
              }),
              h(SliderThumb, {
                index: 1,
                ariaLabel: stringFormatter.value.format("maximum"),
                isDisabled: state.isDisabled.value,
                trackRef,
                state,
                name: props.endName,
                form: props.form,
                direction,
              }),
              h("div", {
                class: classNames("spectrum-Slider-track"),
                style: {
                  width: `${(1 - endPercent) * 100}%`,
                },
              }),
            ];
          },
        }
      );
  },
});
