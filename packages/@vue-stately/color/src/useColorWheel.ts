export interface AriaColorWheelOptions {
  value?: string;
  innerRadius?: number;
  outerRadius?: number;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  isRequired?: boolean;
  onChange?: (color: string) => void;
  onChangeEnd?: (color: string) => void;
  name?: string;
  form?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
}

export interface ColorWheelAria {
  trackProps: Record<string, unknown>;
  thumbProps: Record<string, unknown>;
  inputProps: Record<string, unknown>;
}

export function useColorWheel(
  props: AriaColorWheelOptions,
  _state: { setValue?: (value: string) => void },
  inputRef?: { current: HTMLInputElement | null }
): ColorWheelAria {
  return {
    trackProps: {
      role: "presentation",
      "data-inner-radius": props.innerRadius,
      "data-outer-radius": props.outerRadius,
      "aria-label": props["aria-label"],
      "aria-labelledby": props["aria-labelledby"],
    },
    thumbProps: {
      role: "slider",
      tabIndex: props.isDisabled ? undefined : 0,
    },
    inputProps: {
      ref: inputRef,
      type: "range",
      name: props.name,
      form: props.form,
      readOnly: props.isReadOnly,
      value: props.value ?? "",
    },
  };
}
