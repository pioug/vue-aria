import { ref } from "vue";
import type {
  Collection,
  DraggableCollectionProps,
  Node,
} from "@react-types/shared";
import { MultipleSelectionManager } from "@vue-stately/selection";
import type {
  DragItem,
  DraggableCollectionState,
  DraggableCollectionEndEvent,
  DraggableCollectionMoveEvent,
  DraggableCollectionStartEvent,
  Key,
} from "./types";

export interface DraggableCollectionStateOptions<T = object> extends DraggableCollectionProps<T> {
  /** A collection of items. */
  collection: Collection<Node<unknown>>;
  /** An interface for reading and updating multiple selection state. */
  selectionManager: MultipleSelectionManager;
  /** Whether the drag events should be disabled. */
  isDisabled?: boolean;
}

/**
 * Provides state management for a draggable collection.
 */
export function useDraggableCollectionState<T = object>(
  props: DraggableCollectionStateOptions<T>
): DraggableCollectionState {
  const {
    getItems,
    isDisabled,
    collection,
    selectionManager,
    onDragStart,
    onDragMove,
    onDragEnd,
    preview,
    getAllowedDropOperations,
  } = props;

  const draggingKeys = ref(new Set<Key>());
  const draggedKey = ref<Key | null>(null);

  const getKeysForDrag = (key: Key): Set<Key> => {
    const keys = new Set<Key>();

    if (selectionManager.isSelected(key)) {
      for (const currentKey of selectionManager.selectedKeys) {
        const node = collection.getItem(currentKey);
        if (node) {
          let isChild = false;
          let parentKey = node.parentKey;
          while (parentKey != null) {
            if (selectionManager.selectedKeys.has(parentKey)) {
              isChild = true;
              break;
            }
            const parentNode = collection.getItem(parentKey);
            parentKey = parentNode ? parentNode.parentKey : null;
          }
          if (!isChild) {
            keys.add(currentKey);
          }
        }
      }
    } else {
      keys.add(key);
    }

    return keys;
  };

  return {
    collection,
    selectionManager,
    get draggedKey() {
      return draggedKey.value;
    },
    get draggingKeys() {
      return draggingKeys.value;
    },
    isDragging(key: Key) {
      return draggingKeys.value.has(key);
    },
    getKeysForDrag,
    getItems(key: Key) {
      const keys = getKeysForDrag(key);
      const items: DragItem[] = [];

      for (const currentKey of keys) {
        const value = collection.getItem(currentKey)?.value;
        if (value != null) {
          items.push(value as DragItem);
        }
      }

      return getItems(keys, items);
    },
    isDisabled,
    preview,
    getAllowedDropOperations,
    startDrag(key: Key, event: DraggableCollectionStartEvent) {
      const keys = getKeysForDrag(key);
      draggingKeys.value = keys;
      draggedKey.value = key;
      selectionManager.setFocused(false);

      if (typeof onDragStart === "function") {
        onDragStart({
          ...(event as DraggableCollectionStartEvent & { keys: Set<Key> }),
          keys,
        });
      }
    },
    moveDrag(event: DraggableCollectionMoveEvent) {
      if (typeof onDragMove === "function") {
        onDragMove({
          ...(event as DraggableCollectionMoveEvent & { keys: Set<Key> }),
          keys: draggingKeys.value,
        });
      }
    },
    endDrag(event: DraggableCollectionEndEvent) {
      const nextEvent = event as DraggableCollectionEndEvent & { isInternal?: boolean };
      const { isInternal, ...rest } = nextEvent;

      if (typeof onDragEnd === "function") {
        onDragEnd({
          ...(rest as DraggableCollectionEndEvent),
          keys: draggingKeys.value,
          isInternal,
        });
      }

      draggingKeys.value = new Set();
      draggedKey.value = null;
    },
  };
}
