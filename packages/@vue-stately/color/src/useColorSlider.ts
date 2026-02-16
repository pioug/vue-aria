import { useId } from "@vue-aria/utils";

export interface AriaColorSliderOptions {
  value?: string;
  label?: string;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  isRequired?: boolean;
  orientation?: "horizontal" | "vertical";
  channel?: string;
  trackRef?: { current: Element | null };
  inputRef?: { current: HTMLInputElement | null };
  "aria-label"?: string;
  name?: string;
  form?: string;
}

export interface ColorSliderAria {
  labelProps: Record<string, unknown>;
  trackProps: Record<string, unknown>;
  thumbProps: Record<string, unknown>;
  inputProps: Record<string, unknown>;
  outputProps: Record<string, unknown>;
}

export function useColorSlider(props: AriaColorSliderOptions, _state: { value?: number; getDisplayColor?: () => string }): ColorSliderAria {
  const id = useId();
  return {
    labelProps: {
      id,
      children: props.label,
      "aria-label": props["aria-label"],
    },
    trackProps: {
      role: "presentation",
      "data-channel": props.channel,
      "aria-orientation": props.orientation ?? "horizontal",
    },
    thumbProps: {
      role: "slider",
      tabIndex: props.isDisabled ? undefined : 0,
      "aria-valuenow": props.value,
      "aria-labelledby": id,
    },
    inputProps: {
      type: "range",
      name: props.name,
      form: props.form,
      readOnly: props.isReadOnly,
      value: props.value ?? "0",
    },
    outputProps: {
      "aria-live": "off",
    },
  };
}
