import { useNumberFormatter } from "@vue-aria/i18n";
import { useSlider } from "@vue-aria/slider";
import { useSliderState, type SliderState } from "@vue-stately/slider";
import {
  computed,
  defineComponent,
  h,
  provide,
  ref,
  useAttrs,
  type CSSProperties,
  type PropType,
  type Ref,
  type VNodeChild,
} from "vue";
import { sliderContextKey } from "./sliderContext";

export interface SliderBaseProps {
  value?: number[];
  defaultValue?: number[];
  onChange?: (value: number[]) => void;
  onChangeEnd?: (value: number[]) => void;
  minValue?: number;
  maxValue?: number;
  step?: number;
  orientation?: "horizontal" | "vertical";
  isDisabled?: boolean;
  label?: string;
  labelPosition?: "top" | "side";
  showValueLabel?: boolean;
  formatOptions?: Intl.NumberFormatOptions;
  getValueLabel?: (value: number[]) => string;
  classes?: string | string[] | Record<string, boolean>;
  style?: CSSProperties;
}

export interface SliderBaseChildArguments {
  inputRef: Ref<HTMLInputElement | null>;
  trackRef: { current: Element | null };
  state: SliderState;
}

export const SliderBase = defineComponent({
  name: "SpectrumSliderBase",
  props: {
    value: Array as PropType<number[]>,
    defaultValue: Array as PropType<number[]>,
    onChange: Function as PropType<(value: number[]) => void>,
    onChangeEnd: Function as PropType<(value: number[]) => void>,
    minValue: {
      type: Number,
      default: 0,
    },
    maxValue: {
      type: Number,
      default: 100,
    },
    step: {
      type: Number,
      default: 1,
    },
    orientation: {
      type: String as PropType<"horizontal" | "vertical">,
      default: "horizontal",
    },
    isDisabled: Boolean,
    label: String,
    labelPosition: {
      type: String as PropType<"top" | "side">,
      default: "top",
    },
    showValueLabel: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    formatOptions: Object as PropType<Intl.NumberFormatOptions>,
    getValueLabel: Function as PropType<(value: number[]) => string>,
    classes: [String, Array, Object] as PropType<string | string[] | Record<string, boolean>>,
    style: Object as PropType<CSSProperties>,
  },
  setup(props, { slots }) {
    const attrs = useAttrs();
    let formatOptions = props.formatOptions;
    const alwaysDisplaySign = Math.abs(Math.sign(props.minValue) - Math.sign(props.maxValue)) === 2;
    if (alwaysDisplaySign) {
      if (formatOptions != null) {
        if (!("signDisplay" in formatOptions)) {
          formatOptions = {
            ...formatOptions,
            signDisplay: "exceptZero",
          };
        }
      } else {
        formatOptions = { signDisplay: "exceptZero" };
      }
    }

    const numberFormatter = useNumberFormatter(formatOptions ?? {});
    const trackRef = { current: null as Element | null };
    const inputRef = ref<HTMLInputElement | null>(null);

    const state = useSliderState<number[]>({
      get value() {
        return props.value;
      },
      get defaultValue() {
        return props.defaultValue;
      },
      onChange: (value: number[]) => {
        props.onChange?.(value);
      },
      onChangeEnd: (value: number[]) => {
        props.onChangeEnd?.(value);
      },
      get minValue() {
        return props.minValue;
      },
      get maxValue() {
        return props.maxValue;
      },
      get step() {
        return props.step;
      },
      get orientation() {
        return props.orientation;
      },
      get isDisabled() {
        return props.isDisabled;
      },
      numberFormatter,
    } as any);

    const slider = useSlider(
      {
        get orientation() {
          return props.orientation;
        },
        get isDisabled() {
          return props.isDisabled;
        },
        get label() {
          return props.label;
        },
        "aria-label": attrs["aria-label"] as string | undefined,
        "aria-labelledby": attrs["aria-labelledby"] as string | undefined,
        "aria-describedby": attrs["aria-describedby"] as string | undefined,
        "aria-details": attrs["aria-details"] as string | undefined,
      },
      state as any,
      trackRef
    );

    provide(sliderContextKey, {
      state,
      trackRef,
      inputRef,
    });

    const showValueLabel = computed(() =>
      props.showValueLabel !== undefined ? props.showValueLabel : Boolean(props.label)
    );

    const displayValue = computed(() => {
      if (props.getValueLabel) {
        return props.getValueLabel(state.values);
      }

      if (state.values.length === 1) {
        return state.getThumbValueLabel(0);
      }

      if (state.values.length === 2) {
        return `${state.getThumbValueLabel(0)} – ${state.getThumbValueLabel(1)}`;
      }

      return state.values.map((value) => numberFormatter.format(value)).join(", ");
    });

    const maxLabelLength = computed(() => {
      if (typeof props.getValueLabel === "function") {
        switch (state.values.length) {
          case 1:
            return Math.max(
              props.getValueLabel([props.minValue]).length,
              props.getValueLabel([props.maxValue]).length
            );
          case 2:
            return Math.max(
              props.getValueLabel([props.minValue, props.minValue]).length,
              props.getValueLabel([props.minValue, props.maxValue]).length,
              props.getValueLabel([props.maxValue, props.minValue]).length,
              props.getValueLabel([props.maxValue, props.maxValue]).length
            );
          default:
            throw new Error("Only sliders with 1 or 2 handles are supported!");
        }
      }

      const formattedMin = [...numberFormatter.format(props.minValue)].length;
      const formattedMax = [...numberFormatter.format(props.maxValue)].length;
      let computedLength = Math.max(formattedMin, formattedMax);

      switch (state.values.length) {
        case 1:
          return computedLength;
        case 2:
          computedLength = 3 + 2 * Math.max(computedLength, formattedMin, formattedMax);
          return computedLength;
        default:
          throw new Error("Only sliders with 1 or 2 handles are supported!");
      }
    });

    return () => {
      const labelNode =
        props.label != null
          ? h("label", { ...slider.labelProps, class: "spectrum-Slider-label" }, props.label)
          : null;

      const valueNode = showValueLabel.value
        ? h(
            "output",
            {
              ...slider.outputProps,
              class: "spectrum-Slider-value",
              style:
                maxLabelLength.value != null
                  ? {
                      width: `${maxLabelLength.value}ch`,
                      minWidth: `${maxLabelLength.value}ch`,
                    }
                  : undefined,
            },
            displayValue.value
          )
        : null;

      return h(
        "div",
        {
          ...slider.groupProps,
          class: [
            "spectrum-Slider",
            props.labelPosition === "top" ? "spectrum-Slider--positionTop" : "spectrum-Slider--positionSide",
            props.isDisabled ? "is-disabled" : null,
            props.classes,
            attrs.class,
          ],
          style: [props.style, attrs.style as CSSProperties | undefined],
        },
        [
          props.label
            ? h("div", { class: "spectrum-Slider-labelContainer", role: "presentation" }, [
                labelNode,
                slots.contextualHelp
                  ? h("div", { class: "spectrum-Slider-contextualHelp" }, slots.contextualHelp())
                  : null,
                props.labelPosition === "top" ? valueNode : null,
              ])
            : null,
          h(
            "div",
            {
              ...slider.trackProps,
              class: "spectrum-Slider-controls",
              role: "presentation",
              ref: ((el: Element | null) => {
                trackRef.current = el;
              }) as any,
            },
            (slots.default?.({
              inputRef,
              trackRef,
              state,
            } as SliderBaseChildArguments) as VNodeChild) ?? []
          ),
          props.labelPosition === "side"
            ? h(
                "div",
                { class: "spectrum-Slider-valueLabelContainer", role: "presentation" },
                [valueNode]
              )
            : null,
        ]
      );
    };
  },
});
