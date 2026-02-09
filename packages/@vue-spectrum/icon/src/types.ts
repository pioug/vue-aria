export type IconSize = "XXS" | "XS" | "S" | "M" | "L" | "XL" | "XXL";
export type IconColorValue = string;

export interface BaseSpectrumIconProps {
  ariaLabel?: string;
  ariaHidden?: boolean | "true" | "false";
}

export interface IconProps extends BaseSpectrumIconProps {
  size?: IconSize;
  color?: IconColorValue;
}

export interface UIIconProps extends BaseSpectrumIconProps {}

export interface IllustrationProps extends BaseSpectrumIconProps {
  ariaLabelledby?: string;
}
