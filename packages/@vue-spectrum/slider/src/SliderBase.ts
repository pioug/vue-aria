import {
  computed,
  defineComponent,
  h,
  nextTick,
  ref,
  type PropType,
  type Ref,
  type VNodeChild,
} from "vue";
import { useLocale } from "@vue-aria/i18n";
import {
  useSlider,
  useSliderState,
  type UseSliderStateResult,
} from "@vue-aria/slider";
import { filterDOMProps, mergeProps } from "@vue-aria/utils";
import { useProviderContext } from "@vue-spectrum/provider";
import { classNames, useStyleProps, type ClassValue } from "@vue-spectrum/utils";

export type SpectrumSliderOrientation = "horizontal" | "vertical";
export type SpectrumSliderLabelPosition = "top" | "side";

export interface SliderBaseChildArguments {
  inputRef: Ref<HTMLInputElement | null>;
  trackRef: Ref<HTMLElement | null>;
  state: UseSliderStateResult;
  orientation: SpectrumSliderOrientation;
  direction: "ltr" | "rtl";
}

export interface SpectrumSliderBaseProps {
  value?: readonly number[] | undefined;
  defaultValue?: readonly number[] | undefined;
  onChange?: ((value: number[]) => void) | undefined;
  onChangeEnd?: ((value: number[]) => void) | undefined;
  minValue?: number | undefined;
  maxValue?: number | undefined;
  step?: number | undefined;
  pageSize?: number | undefined;
  orientation?: SpectrumSliderOrientation | undefined;
  direction?: "ltr" | "rtl" | undefined;
  label?: string | undefined;
  labelPosition?: SpectrumSliderLabelPosition | undefined;
  showValueLabel?: boolean | undefined;
  getValueLabel?: ((value: readonly number[]) => string) | undefined;
  formatOptions?: Intl.NumberFormatOptions | undefined;
  isDisabled?: boolean | undefined;
  isRequired?: boolean | undefined;
  isInvalid?: boolean | undefined;
  validationState?: "valid" | "invalid" | undefined;
  ariaLabel?: string | undefined;
  ariaLabelledby?: string | undefined;
  ariaDescribedby?: string | undefined;
  ariaDetails?: string | undefined;
  ariaErrormessage?: string | undefined;
  classes?: ClassValue | undefined;
  internalStyle?: Record<string, string | number> | undefined;
  slot?: string | undefined;
  UNSAFE_className?: string | undefined;
  UNSAFE_style?: Record<string, string | number> | undefined;
  renderTrack: (opts: SliderBaseChildArguments) => VNodeChild;
}

function toNumberArray(value: readonly number[] | undefined): number[] | undefined {
  return value ? [...value] : undefined;
}

function hasOppositeSigns(min: number, max: number): boolean {
  return Math.abs(Math.sign(min) - Math.sign(max)) === 2;
}

function getNumberTextLength(formatter: Intl.NumberFormat, value: number): number {
  return [...formatter.format(value)].length;
}

export const SliderBase = defineComponent({
  name: "SliderBase",
  inheritAttrs: false,
  props: {
    value: {
      type: Array as PropType<readonly number[] | undefined>,
      default: undefined,
    },
    defaultValue: {
      type: Array as PropType<readonly number[] | undefined>,
      default: undefined,
    },
    onChange: {
      type: Function as PropType<((value: number[]) => void) | undefined>,
      default: undefined,
    },
    onChangeEnd: {
      type: Function as PropType<((value: number[]) => void) | undefined>,
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
      type: Function as PropType<((value: readonly number[]) => string) | undefined>,
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
    classes: {
      type: [String, Array, Object] as PropType<ClassValue | undefined>,
      default: undefined,
    },
    internalStyle: {
      type: Object as PropType<Record<string, string | number> | undefined>,
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
    renderTrack: {
      type: Function as PropType<(opts: SliderBaseChildArguments) => VNodeChild>,
      required: true,
    },
  },
  setup(props, { attrs, expose }) {
    const provider = useProviderContext();
    const locale = useLocale();
    const attrsRecord = attrs as Record<string, unknown>;
    const rootRef = ref<HTMLDivElement | null>(null);
    const trackRef = ref<HTMLElement | null>(null);
    const inputRef = ref<HTMLInputElement | null>(null);

    const minValue = computed(() => props.minValue ?? 0);
    const maxValue = computed(() => props.maxValue ?? 100);
    const orientation = computed<SpectrumSliderOrientation>(
      () => props.orientation ?? "horizontal"
    );
    const direction = computed<"ltr" | "rtl">(
      () => props.direction ?? provider?.value.direction ?? locale.value.direction
    );
    const isDisabled = computed<boolean>(
      () => props.isDisabled ?? provider?.value.isDisabled ?? false
    );
    const labelPosition = computed<SpectrumSliderLabelPosition>(
      () => props.labelPosition ?? "top"
    );

    const resolvedFormatOptions = computed<Intl.NumberFormatOptions | undefined>(() => {
      if (!hasOppositeSigns(minValue.value, maxValue.value)) {
        return props.formatOptions;
      }

      if (!props.formatOptions) {
        return { signDisplay: "exceptZero" };
      }

      if ("signDisplay" in props.formatOptions) {
        return props.formatOptions;
      }

      return {
        ...props.formatOptions,
        signDisplay: "exceptZero",
      };
    });

    const formatter = computed(
      () => new Intl.NumberFormat(undefined, resolvedFormatOptions.value)
    );

    const state = useSliderState({
      value:
        props.value !== undefined
          ? computed(() => toNumberArray(props.value))
          : undefined,
      defaultValue:
        props.defaultValue !== undefined
          ? computed(() => toNumberArray(props.defaultValue))
          : undefined,
      minValue,
      maxValue,
      step: computed(() => props.step),
      pageSize: computed(() => props.pageSize),
      orientation,
      isDisabled,
      onChange: (value) => {
        props.onChange?.([...value]);
      },
      onChangeEnd: (value) => {
        props.onChangeEnd?.([...value]);
      },
    });

    const sliderState: UseSliderStateResult = {
      ...state,
      getThumbValueLabel: (index) => {
        const value = state.values.value[index] ?? 0;
        return formatter.value.format(value);
      },
    };

    const slider = useSlider(
      {
        label: computed(() => props.label),
        orientation,
        direction,
        isDisabled,
        "aria-label": computed(
          () => props.ariaLabel ?? (attrsRecord["aria-label"] as string | undefined)
        ),
        "aria-labelledby": computed(
          () =>
            props.ariaLabelledby ??
            (attrsRecord["aria-labelledby"] as string | undefined)
        ),
        "aria-describedby": computed(
          () =>
            props.ariaDescribedby ??
            (attrsRecord["aria-describedby"] as string | undefined)
        ),
        "aria-details": computed(
          () => props.ariaDetails ?? (attrsRecord["aria-details"] as string | undefined)
        ),
      },
      sliderState,
      trackRef
    );

    const showValueLabel = computed(() => {
      if (props.showValueLabel !== undefined) {
        return props.showValueLabel;
      }
      return Boolean(props.label);
    });

    const displayValue = computed(() => {
      const values = state.values.value;
      if (typeof props.getValueLabel === "function") {
        return props.getValueLabel(values);
      }

      if (values.length === 1) {
        return sliderState.getThumbValueLabel(0);
      }

      if (values.length === 2) {
        return `${sliderState.getThumbValueLabel(0)} \u2013 ${sliderState.getThumbValueLabel(1)}`;
      }

      throw new Error("Only sliders with one or two handles are supported.");
    });

    const maxLabelLength = computed<number | null>(() => {
      if (typeof props.getValueLabel === "function") {
        const getValueLabel = props.getValueLabel;
        const min = minValue.value;
        const max = maxValue.value;
        const values = state.values.value;

        if (values.length === 1) {
          return Math.max(
            getValueLabel([min]).length,
            getValueLabel([max]).length
          );
        }

        if (values.length === 2) {
          return Math.max(
            getValueLabel([min, min]).length,
            getValueLabel([min, max]).length,
            getValueLabel([max, min]).length,
            getValueLabel([max, max]).length
          );
        }

        throw new Error("Only sliders with one or two handles are supported.");
      }

      const minLength = getNumberTextLength(formatter.value, minValue.value);
      const maxLength = getNumberTextLength(formatter.value, maxValue.value);
      const longest = Math.max(minLength, maxLength);
      const values = state.values.value;

      if (values.length === 1) {
        return longest;
      }

      if (values.length === 2) {
        return 3 + 2 * longest;
      }

      throw new Error("Only sliders with one or two handles are supported.");
    });

    expose({
      UNSAFE_getDOMNode: () => rootRef.value,
      focus: () => {
        void nextTick(() => {
          inputRef.value?.focus();
        });
      },
    });

    return () => {
      const filteredDomProps = filterDOMProps({
        ...attrsRecord,
        slot: props.slot,
      });
      const { styleProps } = useStyleProps({
        ...attrsRecord,
        UNSAFE_className: props.UNSAFE_className,
        UNSAFE_style: props.UNSAFE_style,
      } as Record<string, unknown> & {
        UNSAFE_className?: string;
        UNSAFE_style?: Record<string, string | number>;
      });
      const rootStyle = {
        ...(props.internalStyle ?? {}),
        ...(styleProps.style ?? {}),
        ...((filteredDomProps.style as Record<string, string | number> | undefined) ?? {}),
      };

      const labelNode = props.label
        ? h(
            "label",
            mergeProps(slider.labelProps.value, {
              class: classNames("spectrum-Slider-label"),
            }),
            props.label
          )
        : null;

      const outputNode =
        showValueLabel.value && maxLabelLength.value !== null
          ? h(
              "output",
              mergeProps(slider.outputProps.value, {
                class: classNames("spectrum-Slider-value"),
                style: {
                  width: `${maxLabelLength.value}ch`,
                  minWidth: `${maxLabelLength.value}ch`,
                },
              }),
              displayValue.value
            )
          : null;

      return h(
        "div",
        mergeProps(filteredDomProps, styleProps, slider.groupProps.value, {
          ref: (value: unknown) => {
            rootRef.value = value as HTMLDivElement | null;
          },
          class: classNames(
            "spectrum-Slider",
            {
              "spectrum-Slider--positionTop": labelPosition.value === "top",
              "spectrum-Slider--positionSide": labelPosition.value === "side",
              "is-disabled": isDisabled.value,
            },
            props.classes,
            styleProps.class as ClassValue | undefined,
            filteredDomProps.class as ClassValue | undefined
          ),
          style: rootStyle,
        }),
        [
          props.label
            ? h(
                "div",
                {
                  class: classNames("spectrum-Slider-labelContainer"),
                  role: "presentation",
                },
                [
                  labelNode,
                  labelPosition.value === "top" ? outputNode : null,
                ]
              )
            : null,
          h(
            "div",
            mergeProps(slider.trackProps.value, {
              ref: (value: unknown) => {
                trackRef.value = value as HTMLElement | null;
              },
              class: classNames("spectrum-Slider-controls"),
              role: "presentation",
            }),
            [
              props.renderTrack({
                inputRef,
                trackRef,
                state: sliderState,
                orientation: orientation.value,
                direction: direction.value,
              }),
            ]
          ),
          labelPosition.value === "side"
            ? h(
                "div",
                {
                  class: classNames("spectrum-Slider-valueLabelContainer"),
                  role: "presentation",
                },
                [outputNode]
              )
            : null,
        ]
      );
    };
  },
});
