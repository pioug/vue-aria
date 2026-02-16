import type { DroppableCollectionState, Key } from "./types";

export interface DroppableItemOptions {
  id?: Key;
  isDisabled?: boolean;
}

export interface DroppableItemResult {
  dropProps: Record<string, unknown>;
}

export function useDroppableItem(
  options: DroppableItemOptions,
  _state: DroppableCollectionState,
  _ref: { current: HTMLElement | null }
): DroppableItemResult {
  return {
    dropProps: {
      "data-drop-target": !options.isDisabled,
      "data-drop-id": options.id,
    },
  };
}
