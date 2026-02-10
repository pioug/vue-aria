import { computed, defineComponent, h, type PropType } from "vue";
import { useLocale } from "@vue-aria/i18n";
import { classNames, type ClassValue } from "@vue-spectrum/utils";
import {
  SliderBase,
  type SpectrumSliderBaseProps,
  type SpectrumSliderLabelPosition,
  type SpectrumSliderOrientation,
} from "./SliderBase";
import { SliderThumb } from "./SliderThumb";

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export interface SpectrumSliderProps
  extends Omit<
    SpectrumSliderBaseProps,
    | "value"
    | "defaultValue"
    | "onChange"
    | "onChangeEnd"
    | "getValueLabel"
    | "renderTrack"
  > {
  value?: number | undefined;
  defaultValue?: number | undefined;
  onChange?: ((value: number) => void) | undefined;
  onChangeEnd?: ((value: number) => void) | undefined;
  getValueLabel?: ((value: number) => string) | undefined;
  isFilled?: boolean | undefined;
  fillOffset?: number | undefined;
  trackGradient?: string[] | undefined;
  name?: string | undefined;
  form?: string | undefined;
}

export const Slider = defineComponent({
  name: "Slider",
  inheritAttrs: false,
  props: {
    value: {
      type: Number as PropType<number | undefined>,
      default: undefined,
    },
    defaultValue: {
      type: Number as PropType<number | undefined>,
      default: undefined,
    },
    onChange: {
      type: Function as PropType<((value: number) => void) | undefined>,
      default: undefined,
    },
    onChangeEnd: {
      type: Function as PropType<((value: number) => void) | undefined>,
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
      type: Function as PropType<((value: number) => string) | undefined>,
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
    isFilled: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    fillOffset: {
      type: Number as PropType<number | undefined>,
      default: undefined,
    },
    trackGradient: {
      type: Array as PropType<string[] | undefined>,
      default: undefined,
    },
    name: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    form: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
  },
  setup(props, { attrs }) {
    const locale = useLocale();
    const classes = computed<ClassValue | undefined>(() =>
      classNames({
        "spectrum-Slider--filled": Boolean(props.isFilled) && props.fillOffset == null,
      })
    );

    const sliderStyle = computed<Record<string, string | number> | undefined>(() => {
      if (!props.trackGradient || props.trackGradient.length === 0) {
        return props.UNSAFE_style;
      }

      const direction =
        props.direction ?? locale.value.direction ?? "ltr";

      return {
        ...(props.UNSAFE_style ?? {}),
        "--spectrum-slider-track-gradient": `linear-gradient(to ${
          direction === "ltr" ? "right" : "left"
        }, ${props.trackGradient.join(", ")})`,
      };
    });

    return () =>
      h(
        SliderBase,
        {
          ...(attrs as Record<string, unknown>),
          value: props.value !== undefined ? [props.value] : undefined,
          defaultValue:
            props.defaultValue !== undefined ? [props.defaultValue] : undefined,
          onChange: props.onChange
            ? (value: number[]) => {
                props.onChange?.(value[0] ?? 0);
              }
            : undefined,
          onChangeEnd: props.onChangeEnd
            ? (value: number[]) => {
                props.onChangeEnd?.(value[0] ?? 0);
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
            ? (value: readonly number[]) => props.getValueLabel?.(value[0] ?? 0) ?? ""
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
          classes: classes.value,
          slot: props.slot,
          UNSAFE_className: props.UNSAFE_className,
          UNSAFE_style: sliderStyle.value,
          renderTrack: ({ trackRef, inputRef, state, direction }) => {
            const thumbPercent = state.getThumbPercent(0);
            const cssDirection = direction === "rtl" ? "right" : "left";
            const fillOffset =
              props.fillOffset != null
                ? clamp(
                    props.fillOffset,
                    state.getThumbMinValue(0),
                    state.getThumbMaxValue(0)
                  )
                : undefined;

            const filledTrack =
              Boolean(props.isFilled) && fillOffset != null
                ? (() => {
                    const min = state.getThumbMinValue(0);
                    const max = state.getThumbMaxValue(0);
                    const offsetPercent =
                      max <= min ? 0 : (fillOffset - min) / (max - min);
                    const width = thumbPercent - offsetPercent;
                    const isRightOfOffset = width > 0;
                    const offset = isRightOfOffset
                      ? offsetPercent
                      : thumbPercent;

                    return h("div", {
                      class: classNames("spectrum-Slider-fill", {
                        "spectrum-Slider-fill--right": isRightOfOffset,
                      }),
                      style: {
                        [cssDirection]: `${offset * 100}%`,
                        width: `${Math.abs(width) * 100}%`,
                      },
                    });
                  })()
                : null;

            return [
              h("div", {
                class: classNames("spectrum-Slider-track"),
                style: {
                  width: `${thumbPercent * 100}%`,
                  "--spectrum-track-background-size":
                    thumbPercent > 0 ? `${(1 / thumbPercent) * 100}%` : undefined,
                  "--spectrum-track-background-position":
                    direction === "ltr" ? "0" : "100",
                },
              }),
              h(SliderThumb, {
                index: 0,
                isDisabled: state.isDisabled.value,
                trackRef,
                inputRef,
                state,
                name: props.name,
                form: props.form,
                direction,
              }),
              filledTrack,
              h("div", {
                class: classNames("spectrum-Slider-track"),
                style: {
                  width: `${(1 - thumbPercent) * 100}%`,
                  "--spectrum-track-background-size":
                    thumbPercent < 1
                      ? `${(1 / (1 - thumbPercent)) * 100}%`
                      : undefined,
                  "--spectrum-track-background-position":
                    direction === "ltr" ? "100" : "0",
                },
              }),
            ];
          },
        }
      );
  },
});
