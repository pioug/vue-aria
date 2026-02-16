import type { DraggableCollectionState, Key } from "./types";

export interface DraggableItemProps {
  id?: Key;
  isDisabled?: boolean;
  shouldSelectOnPress?: boolean;
}

export interface DraggableItemResult {
  dragProps: Record<string, unknown>;
  dragButtonProps: Record<string, unknown>;
}

export function useDraggableItem(
  props: DraggableItemProps,
  _state: DraggableCollectionState
): DraggableItemResult {
  return {
    dragProps: {
      draggable: !props.isDisabled,
      id: props.id,
    },
    dragButtonProps: {},
  };
}
