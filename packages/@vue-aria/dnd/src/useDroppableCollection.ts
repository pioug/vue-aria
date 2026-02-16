import type { DroppableCollectionState, Key, DropTarget } from "./types";

export interface DroppableCollectionProps {
  onDragEnter?: (target: DropTarget) => void;
}

export interface DroppableCollectionOptions extends DroppableCollectionProps {
  getCollectionNodes?: () => unknown[];
}

export interface DroppableCollectionResult {
  dropProps: Record<string, unknown>;
  dropState: {
    isDropTarget: boolean;
    dropTargets: DropTarget[];
  };
}

export function useDroppableCollection(
  props: DroppableCollectionOptions,
  _state: DroppableCollectionState,
  _ref: { current: HTMLElement | null }
): DroppableCollectionResult {
  return {
    dropProps: {
      onDragEnter: props?.onDragEnter,
    },
    dropState: {
      isDropTarget: true,
      dropTargets: [],
    },
  };
}
