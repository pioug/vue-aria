import type { PropType } from "vue";

export type Color = string;
export type ColorSpace = "hex" | "rgb" | "hsl";
export type ColorFormat = "hex" | "hex8" | "rgb" | "hsl";

export interface SpectrumColorBaseProps {
  id?: string | undefined;
  label?: string | undefined;
  description?: string | undefined;
  errorMessage?: string | undefined;
  isDisabled?: boolean | undefined;
  isReadOnly?: boolean | undefined;
  isRequired?: boolean | undefined;
  isInvalid?: boolean | undefined;
  validationState?: "valid" | "invalid" | undefined;
  "aria-label"?: string | undefined;
  "aria-labelledby"?: string | undefined;
  "aria-describedby"?: string | undefined;
  ariaLabel?: string | undefined;
  ariaLabelledby?: string | undefined;
  ariaDescribedby?: string | undefined;
  slot?: string | undefined;
  isHidden?: boolean | undefined;
  UNSAFE_className?: string | undefined;
  UNSAFE_style?: Record<string, string | number> | undefined;
}

export interface SpectrumColorFieldProps extends SpectrumColorBaseProps {
  value?: Color | null | undefined;
  defaultValue?: Color | null | undefined;
  onChange?: ((color: Color | null) => void) | undefined;
  placeholder?: string | undefined;
  autoFocus?: boolean | undefined;
  name?: string | undefined;
  form?: string | undefined;
  format?: ColorFormat | undefined;
}

export interface SpectrumColorSliderProps extends SpectrumColorBaseProps {
  value?: number | undefined;
  defaultValue?: number | undefined;
  onChange?: ((value: number) => void) | undefined;
  onChangeEnd?: ((value: number) => void) | undefined;
  minValue?: number | undefined;
  maxValue?: number | undefined;
  step?: number | undefined;
  channel?: "hue" | "saturation" | "lightness" | "alpha" | "red" | "green" | "blue" | undefined;
}

export interface SpectrumColorAreaProps extends SpectrumColorBaseProps {
  value?: Color | null | undefined;
  defaultValue?: Color | null | undefined;
  onChange?: ((color: Color) => void) | undefined;
}

export interface SpectrumColorWheelProps extends SpectrumColorBaseProps {
  value?: Color | null | undefined;
  defaultValue?: Color | null | undefined;
  onChange?: ((color: Color) => void) | undefined;
}

export interface SpectrumColorSwatchProps {
  color?: Color | undefined;
  label?: string | undefined;
  "aria-label"?: string | undefined;
  isDisabled?: boolean | undefined;
  size?: "S" | "M" | "L" | undefined;
  slot?: string | undefined;
  isHidden?: boolean | undefined;
  UNSAFE_className?: string | undefined;
  UNSAFE_style?: Record<string, string | number> | undefined;
}

export interface SpectrumColorSwatchPickerItem {
  key: string;
  color: Color;
  label?: string | undefined;
  isDisabled?: boolean | undefined;
}

export interface SpectrumColorSwatchPickerProps extends SpectrumColorBaseProps {
  items: SpectrumColorSwatchPickerItem[];
  value?: Color | null | undefined;
  defaultValue?: Color | null | undefined;
  onChange?: ((color: Color) => void) | undefined;
  selectedKey?: string | null | undefined;
  defaultSelectedKey?: string | null | undefined;
  onSelectionChange?: ((key: string | null) => void) | undefined;
}

export interface SpectrumColorEditorProps extends SpectrumColorBaseProps {
  value?: Color | null | undefined;
  defaultValue?: Color | null | undefined;
  onChange?: ((color: Color) => void) | undefined;
  showAlpha?: boolean | undefined;
}

export interface SpectrumColorPickerProps extends SpectrumColorBaseProps {
  value?: Color | null | undefined;
  defaultValue?: Color | null | undefined;
  onChange?: ((color: Color) => void) | undefined;
  isOpen?: boolean | undefined;
  defaultOpen?: boolean | undefined;
  onOpenChange?: ((isOpen: boolean) => void) | undefined;
  showEditor?: boolean | undefined;
}

export interface SpectrumColorThumbProps {
  color?: Color | undefined;
  x?: number | undefined;
  y?: number | undefined;
  "aria-label"?: string | undefined;
  ariaLabel?: string | undefined;
  isHidden?: boolean | undefined;
  size?: number | undefined;
  UNSAFE_className?: string | undefined;
  UNSAFE_style?: Record<string, string | number> | undefined;
}

export const colorBasePropOptions = {
  id: {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  label: {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  description: {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  errorMessage: {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  isDisabled: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined,
  },
  isReadOnly: {
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
  "aria-label": {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  "aria-labelledby": {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  "aria-describedby": {
    type: String as PropType<string | undefined>,
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
  slot: {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  isHidden: {
    type: Boolean as PropType<boolean | undefined>,
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
} as const;

export const colorFieldPropOptions = {
  ...colorBasePropOptions,
  value: {
    type: String as PropType<Color | null | undefined>,
    default: undefined,
  },
  defaultValue: {
    type: String as PropType<Color | null | undefined>,
    default: undefined,
  },
  onChange: {
    type: Function as PropType<((color: Color | null) => void) | undefined>,
    default: undefined,
  },
  placeholder: {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  autoFocus: {
    type: Boolean as PropType<boolean | undefined>,
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
  format: {
    type: String as PropType<ColorFormat | undefined>,
    default: undefined,
  },
} as const;

export const colorSliderPropOptions = {
  ...colorBasePropOptions,
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
  channel: {
    type: String as PropType<SpectrumColorSliderProps["channel"]>,
    default: undefined,
  },
} as const;

export const colorAreaPropOptions = {
  ...colorBasePropOptions,
  value: {
    type: String as PropType<Color | null | undefined>,
    default: undefined,
  },
  defaultValue: {
    type: String as PropType<Color | null | undefined>,
    default: undefined,
  },
  onChange: {
    type: Function as PropType<((color: Color) => void) | undefined>,
    default: undefined,
  },
} as const;

export const colorWheelPropOptions = {
  ...colorBasePropOptions,
  value: {
    type: String as PropType<Color | null | undefined>,
    default: undefined,
  },
  defaultValue: {
    type: String as PropType<Color | null | undefined>,
    default: undefined,
  },
  onChange: {
    type: Function as PropType<((color: Color) => void) | undefined>,
    default: undefined,
  },
} as const;

export const colorSwatchPropOptions = {
  color: {
    type: String as PropType<Color | undefined>,
    default: undefined,
  },
  label: {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  "aria-label": {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  isDisabled: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined,
  },
  size: {
    type: String as PropType<"S" | "M" | "L" | undefined>,
    default: undefined,
  },
  slot: {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  isHidden: {
    type: Boolean as PropType<boolean | undefined>,
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
} as const;

export const colorSwatchPickerPropOptions = {
  ...colorBasePropOptions,
  items: {
    type: Array as PropType<SpectrumColorSwatchPickerItem[]>,
    default: () => [],
  },
  value: {
    type: String as PropType<Color | null | undefined>,
    default: undefined,
  },
  defaultValue: {
    type: String as PropType<Color | null | undefined>,
    default: undefined,
  },
  onChange: {
    type: Function as PropType<((color: Color) => void) | undefined>,
    default: undefined,
  },
  selectedKey: {
    type: String as PropType<string | null | undefined>,
    default: undefined,
  },
  defaultSelectedKey: {
    type: String as PropType<string | null | undefined>,
    default: undefined,
  },
  onSelectionChange: {
    type: Function as PropType<((key: string | null) => void) | undefined>,
    default: undefined,
  },
} as const;

export const colorEditorPropOptions = {
  ...colorBasePropOptions,
  value: {
    type: String as PropType<Color | null | undefined>,
    default: undefined,
  },
  defaultValue: {
    type: String as PropType<Color | null | undefined>,
    default: undefined,
  },
  onChange: {
    type: Function as PropType<((color: Color) => void) | undefined>,
    default: undefined,
  },
  showAlpha: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined,
  },
} as const;

export const colorPickerPropOptions = {
  ...colorBasePropOptions,
  value: {
    type: String as PropType<Color | null | undefined>,
    default: undefined,
  },
  defaultValue: {
    type: String as PropType<Color | null | undefined>,
    default: undefined,
  },
  onChange: {
    type: Function as PropType<((color: Color) => void) | undefined>,
    default: undefined,
  },
  isOpen: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined,
  },
  defaultOpen: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined,
  },
  onOpenChange: {
    type: Function as PropType<((isOpen: boolean) => void) | undefined>,
    default: undefined,
  },
  showEditor: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined,
  },
} as const;

export const colorThumbPropOptions = {
  color: {
    type: String as PropType<Color | undefined>,
    default: undefined,
  },
  x: {
    type: Number as PropType<number | undefined>,
    default: undefined,
  },
  y: {
    type: Number as PropType<number | undefined>,
    default: undefined,
  },
  "aria-label": {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  ariaLabel: {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  isHidden: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined,
  },
  size: {
    type: Number as PropType<number | undefined>,
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
} as const;
