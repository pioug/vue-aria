import clsx from "clsx";
import { computed, defineComponent, h, type PropType } from "vue";
import {
  ColorArea as SpectrumColorArea,
  ColorSlider as SpectrumColorSlider,
  ColorSwatch as SpectrumColorSwatch,
  ColorSwatchPicker as SpectrumColorSwatchPicker,
  ColorWheel as SpectrumColorWheel,
  type SpectrumColorAreaProps,
  type SpectrumColorSliderProps,
  type SpectrumColorSwatchProps,
  type SpectrumColorSwatchPickerProps,
  type SpectrumColorWheelProps,
} from "@vue-spectrum/color";
import { useProviderProps } from "@vue-spectrum/provider";

export interface S2ColorAreaProps extends SpectrumColorAreaProps {}
export interface S2ColorSliderProps extends SpectrumColorSliderProps {}
export interface S2ColorSwatchProps extends SpectrumColorSwatchProps {}
export interface S2ColorSwatchPickerProps extends SpectrumColorSwatchPickerProps {}
export interface S2ColorWheelProps extends SpectrumColorWheelProps {}

const styledProps = {
  UNSAFE_className: {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  UNSAFE_style: {
    type: Object as PropType<Record<string, string | number> | undefined>,
    default: undefined,
  },
} as const;

function resolveStyledForwardedProps(
  attrs: Record<string, unknown>,
  className: string,
  props: {
    UNSAFE_className?: string | undefined;
    UNSAFE_style?: Record<string, string | number> | undefined;
  }
) {
  const attrsClassName =
    typeof attrs.UNSAFE_className === "string" ? (attrs.UNSAFE_className as string) : undefined;
  const attrsStyle =
    (attrs.UNSAFE_style as Record<string, string | number> | undefined) ?? undefined;

  return useProviderProps({
    ...attrs,
    UNSAFE_className: clsx(className, attrsClassName, props.UNSAFE_className),
    UNSAFE_style: {
      ...(attrsStyle ?? {}),
      ...(props.UNSAFE_style ?? {}),
    },
  });
}

function createStyledColorWrapper(name: string, className: string, component: unknown) {
  return defineComponent({
    name,
    inheritAttrs: false,
    props: styledProps,
    setup(props, { attrs, slots }) {
      const forwardedProps = computed(() =>
        resolveStyledForwardedProps(attrs as Record<string, unknown>, className, props)
      );

      return () => h(component as any, forwardedProps.value as Record<string, unknown>, slots);
    },
  });
}

export const ColorArea = createStyledColorWrapper(
  "S2ColorArea",
  "s2-ColorArea",
  SpectrumColorArea
);
export const ColorSlider = createStyledColorWrapper(
  "S2ColorSlider",
  "s2-ColorSlider",
  SpectrumColorSlider
);
export const ColorSwatch = createStyledColorWrapper(
  "S2ColorSwatch",
  "s2-ColorSwatch",
  SpectrumColorSwatch
);
export const ColorSwatchPicker = createStyledColorWrapper(
  "S2ColorSwatchPicker",
  "s2-ColorSwatchPicker",
  SpectrumColorSwatchPicker
);
export const ColorWheel = createStyledColorWrapper(
  "S2ColorWheel",
  "s2-ColorWheel",
  SpectrumColorWheel
);
