import type { DropPosition } from "./types";

export interface DropIndicatorProps {
  position?: DropPosition;
  isDropTarget?: boolean;
}

export interface DropIndicatorAria {
  dropIndicatorProps: Record<string, unknown>;
}

export function useDropIndicator(props: DropIndicatorProps): DropIndicatorAria {
  return {
    dropIndicatorProps: {
      role: "presentation",
      "data-drop-position": props.position ?? "inside",
      "data-drop-target": props.isDropTarget ? "true" : "false",
    },
  };
}
