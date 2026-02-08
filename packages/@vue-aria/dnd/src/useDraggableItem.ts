import { useDescription } from "@vue-aria/utils";
import { computed } from "vue";
import type { Key } from "@vue-aria/types";
import type { DragItem, DropOperation } from "./types";
import type { DragPreviewRenderer } from "./DragPreview";
import {
  clearGlobalDnDState,
  isInternalDropOperation,
  setDraggingKeys,
  useDragModality,
} from "./utils";
import type { DragEndEvent, DragMoveEvent, DragStartEvent } from "./useDrag";
import { useDrag } from "./useDrag";

export interface DraggableItemProps {
  key: Key;
  hasDragButton?: boolean;
  hasAction?: boolean;
}

interface DraggableItemCollectionNode {
  textValue?: string;
}

interface DraggableItemCollection {
  getItem: (key: Key) => DraggableItemCollectionNode | null;
  getTextValue?: (key: Key) => string;
}

interface DraggableItemSelectionManager {
  selectionMode: string;
  isDisabled: (key: Key) => boolean;
  isSelected: (key: Key) => boolean;
}

export interface DraggableItemEndEvent extends DragEndEvent {
  keys: Set<Key>;
  isInternal: boolean;
}

export interface DraggableItemState {
  isDisabled?: boolean;
  selectionManager: DraggableItemSelectionManager;
  collection: DraggableItemCollection;
  draggingKeys: Set<Key>;
  preview?: DragPreviewRenderer | null;
  getItems: (key: Key) => DragItem[];
  getAllowedDropOperations?: () => DropOperation[];
  startDrag: (key: Key, event: DragStartEvent) => void;
  moveDrag: (event: DragMoveEvent) => void;
  endDrag: (event: DraggableItemEndEvent) => void;
  getKeysForDrag: (key: Key) => Set<Key>;
}

export interface DraggableItemResult {
  dragProps: Record<string, unknown>;
  dragButtonProps: Record<string, unknown>;
}

function formatSelectedCount(count: number): string {
  const noun = count === 1 ? "item" : "items";
  return `${count} selected ${noun}`;
}

function getDragDescription(
  modality: "keyboard" | "touch" | "virtual",
  options: {
    hasAction: boolean;
    isSelected: boolean;
    selectedCount: number;
  }
): string {
  if (modality === "touch") {
    if (options.isSelected) {
      return `Long press to drag ${formatSelectedCount(options.selectedCount)}.`;
    }
    return "Long press to start dragging.";
  }

  if (modality === "keyboard") {
    const keyHint = options.hasAction ? "Alt + Enter" : "Enter";
    if (options.isSelected) {
      return `Press ${keyHint} to drag ${formatSelectedCount(options.selectedCount)}.`;
    }
    return `Press ${keyHint} to start dragging.`;
  }

  return "Click to start dragging.";
}

function getDragButtonLabel(
  options: {
    itemText: string;
    isSelected: boolean;
    selectedCount: number;
  }
): string {
  if (options.isSelected) {
    return `Drag ${formatSelectedCount(options.selectedCount)}`;
  }

  if (options.itemText.length > 0) {
    return `Drag ${options.itemText}`;
  }

  return "Drag item";
}

export function useDraggableItem(
  props: DraggableItemProps,
  state: DraggableItemState
): DraggableItemResult {
  const isDisabled = Boolean(state.isDisabled) || state.selectionManager.isDisabled(props.key);
  const { dragProps, dragButtonProps } = useDrag({
    getItems: () => state.getItems(props.key),
    preview: state.preview,
    getAllowedDropOperations: state.getAllowedDropOperations,
    hasDragButton: props.hasDragButton,
    onDragStart(event) {
      state.startDrag(props.key, event);
      setDraggingKeys(state.draggingKeys);
    },
    onDragMove(event) {
      state.moveDrag(event);
    },
    onDragEnd(event) {
      const isInternal =
        event.dropOperation === "cancel" ? false : isInternalDropOperation();
      state.endDrag({
        ...event,
        keys: state.draggingKeys,
        isInternal,
      });
      clearGlobalDnDState();
    },
  });

  const item = state.collection.getItem(props.key);
  const selectedCount = state.getKeysForDrag(props.key).size;
  const isSelected =
    selectedCount > 1 && state.selectionManager.isSelected(props.key);
  const hasAction = props.hasAction === true;
  const modality = useDragModality();

  let dragButtonLabel: string | undefined;
  let description: string | undefined;

  if (!props.hasDragButton && state.selectionManager.selectionMode !== "none") {
    description = getDragDescription(modality, {
      hasAction,
      isSelected,
      selectedCount,
    });
    delete dragProps.onClick;
  } else {
    const itemText = state.collection.getTextValue?.(props.key) ?? item?.textValue ?? "";
    dragButtonLabel = getDragButtonLabel({
      itemText,
      isSelected,
      selectedCount,
    });
  }

  const descriptionRef = computed(() => description);
  const { descriptionProps } = useDescription(descriptionRef);
  if (description) {
    Object.defineProperty(dragProps, "aria-describedby", {
      configurable: true,
      enumerable: true,
      get: () => descriptionProps.value["aria-describedby"],
    });
  }

  if (!props.hasDragButton && hasAction) {
    const onKeyDownCapture = dragProps.onKeyDownCapture as
      | ((event: KeyboardEvent) => void)
      | undefined;
    const onKeyUpCapture = dragProps.onKeyUpCapture as
      | ((event: KeyboardEvent) => void)
      | undefined;

    if (modality === "touch") {
      delete dragProps["aria-describedby"];
    }

    dragProps.onKeyDownCapture = (event: KeyboardEvent) => {
      if (event.altKey) {
        onKeyDownCapture?.(event);
      }
    };

    dragProps.onKeyUpCapture = (event: KeyboardEvent) => {
      if (event.altKey) {
        onKeyUpCapture?.(event);
      }
    };
  }

  return {
    dragProps: isDisabled ? {} : dragProps,
    dragButtonProps: {
      ...dragButtonProps,
      isDisabled,
      "aria-label": dragButtonLabel,
    },
  };
}
