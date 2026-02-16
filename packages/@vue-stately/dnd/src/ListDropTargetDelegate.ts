import type { DropTarget, DropTargetDelegate, ItemDropTarget } from "./types";

export class ListDropTargetDelegate implements DropTargetDelegate {
  getDropTargetForPoint(_x: number, _y: number): DropTarget | null {
    return null;
  }

  getItemDropTargetForPoint(_x: number, _y: number): ItemDropTarget | null {
    return null;
  }
}
