import type { AriaLabelingProps, DOMProps, Orientation, StyleProps } from "@vue-types/shared";

export interface SpectrumDividerProps extends DOMProps, AriaLabelingProps, StyleProps {
  size?: "S" | "M" | "L";
  orientation?: Orientation;
  slot?: string;
}
