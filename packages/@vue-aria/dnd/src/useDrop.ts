import type { DropOperation, DropTarget, Key } from "./types";

export interface DropOptions {
  acceptedDragTypes?: string[];
  onDrop?: (e: { dropOperation?: DropOperation; keys?: Set<Key>; dropTarget?: DropTarget }) => void;
}

export interface DropResult {
  dropProps: Record<string, unknown>;
  isDropTarget: boolean;
}

export function useDrop(options: DropOptions): DropResult {
  const {onDrop} = options;
  return {
    dropProps: {
      onDrop,
      onDragOver: () => true,
    },
    isDropTarget: true,
  };
}
