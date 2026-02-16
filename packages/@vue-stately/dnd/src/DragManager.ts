import { DragTypes, writeToDataTransfer } from "./utils";
import type { DragItem, DraggableCollectionState, DropTarget, DragEndEvent } from "./types";

let currentDragTypes: DragTypes | null = null;

export function registerDropTarget(_target: DropTarget): void {
  // Compatibility hook intentionally no-op.
}

export function registerDropItem(_item: unknown): void {
  // Compatibility hook intentionally no-op.
}

export function beginDragging(state: { items: DragItem[]; dataTransfer?: DataTransfer }, dragTextFormatter: { format: (_key: string) => string }) {
  const items = state.items ?? [];
  const types = new DragTypes(items.map((item) => item.type));
  currentDragTypes = types;
  if (state.dataTransfer) {
    writeToDataTransfer(state.dataTransfer, items);
  }
  return {
    getItems: () => items,
    getDragTypes: () => types,
  };
}

export function useDragSession(): DragEndEvent | null {
  return null;
}

export function isVirtualDragging(): boolean {
  return false;
}

export function isValidDropTarget(_element: Element): boolean {
  return true;
}
