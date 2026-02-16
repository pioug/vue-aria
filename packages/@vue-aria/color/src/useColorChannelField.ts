export interface AriaColorChannelFieldProps {
  value?: string;
  label?: string;
  channel: string;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  isRequired?: boolean;
  onChange?: (value: string) => void;
  "aria-label"?: string;
  "aria-labelledby"?: string;
}

export interface ColorChannelFieldAria {
  labelProps: Record<string, unknown>;
  inputProps: Record<string, unknown>;
  decrementButtonProps: Record<string, unknown>;
  incrementButtonProps: Record<string, unknown>;
}

export interface ColorChannelFieldState {
  colorValue?: {
    getChannelValue: (channel: string, value: string) => string;
  };
}

export function useColorChannelField(
  props: AriaColorChannelFieldProps,
  _state: ColorChannelFieldState,
  inputRef?: { current: HTMLInputElement | null }
): ColorChannelFieldAria {
  return {
    labelProps: {
      "aria-label": props["aria-label"] || props.label,
      "aria-labelledby": props["aria-labelledby"],
      "for": inputRef?.current ? "color-channel-field" : undefined,
    },
    inputProps: {
      id: "color-channel-field",
      value: props.value ?? "",
      readOnly: props.isReadOnly,
      disabled: props.isDisabled,
      required: props.isRequired,
      onInput: (event: { currentTarget: HTMLInputElement }) => props.onChange?.(event.currentTarget.value),
      ref: inputRef,
    },
    decrementButtonProps: {
      type: "button",
      "aria-label": `Decrease ${props.channel}`,
    },
    incrementButtonProps: {
      type: "button",
      "aria-label": `Increase ${props.channel}`,
    },
  };
}
