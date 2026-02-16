import { useId } from "@vue-aria/utils";

export type AriaColorSwatchColor = string;
export interface AriaColorSwatchProps {
  color?: AriaColorSwatchColor;
  colorName?: string;
  id?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
}

export interface ColorSwatchAria {
  colorSwatchProps: Record<string, unknown>;
  color: AriaColorSwatchColor;
}

export function useColorSwatch(props: AriaColorSwatchProps): ColorSwatchAria {
  const id = props.id ?? useId();
  const color = props.color ?? "transparent";
  const resolvedName = props.colorName ?? color;

  return {
    colorSwatchProps: {
      id,
      role: "img",
      "aria-roledescription": "Color swatch",
      "aria-label": [resolvedName, props["aria-label"]].filter(Boolean).join(", "),
      "aria-labelledby": props["aria-labelledby"],
      style: {
        backgroundColor: color,
        forcedColorAdjust: "none",
      },
    },
    color,
  };
}
