import { useDragModality } from "./utils";
import type { DragItem, DropOperation, Key } from "./types";

export interface DragOptions {
  getItems: () => DragItem[];
  key?: Key;
  isDisabled?: boolean;
  onDragStart?: () => void;
  onDragMove?: () => void;
  onDragEnd?: (_result: { dropOperation?: DropOperation }) => void;
}

export interface DragResult {
  dragProps: Record<string, unknown>;
  dragButtonProps: Record<string, unknown>;
  dragState: {
    isDragging: boolean;
    dragKeys: Set<Key>;
    dragType: string;
  };
}

export function useDrag(options: DragOptions): DragResult {
  const {getItems, onDragStart, onDragMove, onDragEnd, isDisabled} = options;
  const state = {
    isDragging: false,
    dragKeys: new Set<Key>(),
    dragType: useDragModality(),
  };

  if (onDragStart && !isDisabled) {
    const items = getItems?.() ?? [];
    if (items.length > 0) {
      state.dragKeys = new Set([items[0].type ? "0" : "0"]);
      onDragStart();
      onDragMove?.();
      onDragEnd?.({});
    }
  }

  return {
    dragProps: {
      onDragStart,
      onDragEnd: onDragEnd ? () => onDragEnd({}) : undefined,
      onDragMove,
      disabled: isDisabled,
    },
    dragButtonProps: {},
    dragState: state,
  };
}
