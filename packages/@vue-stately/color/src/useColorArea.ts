import { useId } from "@vue-aria/utils";

export type ColorValueLike = {
  toString: (format?: "css" | string) => string;
};

export type ColorChannel = "hue" | "saturation" | "lightness" | "red" | "green" | "blue" | "alpha";

export interface AriaColorAreaOptions {
  value?: string;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  isRequired?: boolean;
  validationBehavior?: "aria" | "native";
  onChange?: (color: string) => void;
  onChangeEnd?: (color: string) => void;
  inputXRef?: { current: HTMLInputElement | null };
  inputYRef?: { current: HTMLInputElement | null };
  containerRef?: { current: Element | null };
  "aria-label"?: string;
  "aria-labelledby"?: string;
}

export interface ColorAreaAria {
  colorAreaProps: Record<string, unknown>;
  thumbProps: Record<string, unknown>;
  xInputProps: Record<string, unknown>;
  yInputProps: Record<string, unknown>;
}

export function useColorArea(props: AriaColorAreaOptions, _state: { setValue?: (value: string) => void }): ColorAreaAria {
  const colorAreaId = useId();
  const onChange = (value: string) => {
    props.onChange?.(value);
    props.onChangeEnd?.(value);
  };

  return {
    colorAreaProps: {
      id: colorAreaId,
      role: "application",
      "aria-label": props["aria-label"],
      "aria-labelledby": props["aria-labelledby"],
      onPointerMove: () => props.isReadOnly || onChange(props.value ?? ""),
    },
    thumbProps: {
      role: "slider",
      "aria-valuemin": 0,
      "aria-valuemax": 1,
      "aria-valuenow": 0,
      tabIndex: props.isDisabled ? undefined : 0,
    },
    xInputProps: {
      name: "x",
      value: props.value ?? "",
      readOnly: props.isReadOnly,
      type: "range",
    },
    yInputProps: {
      name: "y",
      value: props.value ?? "",
      readOnly: props.isReadOnly,
      type: "range",
    },
  };
}
