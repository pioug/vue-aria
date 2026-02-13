export type Placement =
  | "bottom"
  | "bottom left"
  | "bottom right"
  | "bottom start"
  | "bottom end"
  | "top"
  | "top left"
  | "top right"
  | "top start"
  | "top end"
  | "left"
  | "left top"
  | "left bottom"
  | "start"
  | "start top"
  | "start bottom"
  | "right"
  | "right top"
  | "right bottom"
  | "end"
  | "end top"
  | "end bottom";

export type Axis = "top" | "bottom" | "left" | "right";
export type SizeAxis = "width" | "height";
export type PlacementAxis = Axis | "center";

export interface PositionProps {
  placement?: Placement;
  containerPadding?: number;
  offset?: number;
  crossOffset?: number;
  shouldFlip?: boolean;
  isOpen?: boolean;
}
