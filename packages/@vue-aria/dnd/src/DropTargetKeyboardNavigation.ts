import type { DropPosition, DropTarget } from "./types";

export function navigate(
  event: KeyboardEvent,
  _target: DropTarget,
  position: DropPosition = "inside"
): DropPosition {
  if (event.key === "ArrowLeft") return "before";
  if (event.key === "ArrowRight") return "after";
  return position;
}
