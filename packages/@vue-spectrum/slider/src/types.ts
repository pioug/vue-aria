export interface RangeValue {
  start: number;
  end: number;
}

export interface BaseSpectrumSliderProps<TValue> {
  value?: TValue;
  defaultValue?: TValue;
  onChange?: (value: TValue) => void;
  onChangeEnd?: (value: TValue) => void;
  minValue?: number;
  maxValue?: number;
  step?: number;
  orientation?: "horizontal" | "vertical";
  isDisabled?: boolean;
  label?: string;
  labelPosition?: "top" | "side";
  showValueLabel?: boolean;
  formatOptions?: Intl.NumberFormatOptions;
  getValueLabel?: (value: TValue) => string;
  contextualHelp?: unknown;
}

export interface SpectrumSliderProps extends BaseSpectrumSliderProps<number> {
  name?: string;
  form?: string;
  isFilled?: boolean;
  fillOffset?: number;
  trackGradient?: string[];
}

export interface SpectrumRangeSliderProps extends BaseSpectrumSliderProps<RangeValue> {
  startName?: string;
  endName?: string;
  form?: string;
}
