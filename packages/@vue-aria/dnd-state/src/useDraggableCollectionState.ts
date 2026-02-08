import { ref, toValue } from "vue";
import type { Key, MaybeReactive } from "@vue-aria/types";
import type {
  Collection,
  DragEndEvent,
  DragItem,
  DragMoveEvent,
  DragPreviewRenderer,
  DragStartEvent,
  DropOperation,
} from "@vue-aria/dnd";

export interface DraggableCollectionSelectionManager {
  selectionMode: MaybeReactive<string>;
  selectedKeys: MaybeReactive<Iterable<Key>>;
  isDisabled: (key: Key) => boolean;
  isSelected: (key: Key) => boolean;
  setFocused: (isFocused: boolean) => void;
}

export interface DraggableCollectionStartEvent extends DragStartEvent {
  keys: Set<Key>;
}

export interface DraggableCollectionMoveEvent extends DragMoveEvent {
  keys: Set<Key>;
}

export interface DraggableCollectionEndEvent extends DragEndEvent {
  keys: Set<Key>;
  isInternal: boolean;
}

export interface DraggableCollectionStateOptions<T = unknown> {
  collection: Collection<T>;
  selectionManager: DraggableCollectionSelectionManager;
  getItems: (keys: Set<Key>, items: T[]) => DragItem[];
  isDisabled?: MaybeReactive<boolean | undefined>;
  preview?: MaybeReactive<DragPreviewRenderer | null | undefined>;
  getAllowedDropOperations?: () => DropOperation[];
  onDragStart?: (event: DraggableCollectionStartEvent) => void;
  onDragMove?: (event: DraggableCollectionMoveEvent) => void;
  onDragEnd?: (event: DraggableCollectionEndEvent) => void;
}

export interface DraggableCollectionState<T = unknown> {
  collection: Collection<T>;
  selectionManager: DraggableCollectionSelectionManager;
  draggedKey: Key | null;
  draggingKeys: Set<Key>;
  isDisabled?: boolean;
  isDragging: (key: Key) => boolean;
  getKeysForDrag: (key: Key) => Set<Key>;
  getItems: (key: Key) => DragItem[];
  preview?: DragPreviewRenderer | null;
  getAllowedDropOperations?: () => DropOperation[];
  startDrag: (key: Key, event: DragStartEvent) => void;
  moveDrag: (event: DragMoveEvent) => void;
  endDrag: (event: DraggableCollectionEndEvent) => void;
}

function resolveSelectedKeys(selectionManager: DraggableCollectionSelectionManager): Set<Key> {
  return new Set(toValue(selectionManager.selectedKeys) ?? []);
}

function resolveBoolean(value: MaybeReactive<boolean | undefined> | undefined): boolean {
  if (value === undefined) {
    return false;
  }

  return Boolean(toValue(value));
}

function getDragKeys<T>(
  collection: Collection<T>,
  selectionManager: DraggableCollectionSelectionManager,
  key: Key
): Set<Key> {
  const keys = new Set<Key>();
  const selectedKeys = resolveSelectedKeys(selectionManager);

  if (selectionManager.isSelected(key)) {
    for (const currentKey of selectedKeys) {
      const node = collection.getItem(currentKey);
      if (!node) {
        continue;
      }

      let isChild = false;
      let parentKey = node.parentKey;
      while (parentKey != null) {
        if (selectedKeys.has(parentKey)) {
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
  } else {
    keys.add(key);
  }

  return keys;
}

export function useDraggableCollectionState<T = unknown>(
  options: DraggableCollectionStateOptions<T>
): DraggableCollectionState<T> {
  const draggingKeys = ref<Set<Key>>(new Set<Key>());
  const draggedKey = ref<Key | null>(null);

  return {
    collection: options.collection,
    selectionManager: options.selectionManager,
    get draggedKey() {
      return draggedKey.value;
    },
    get draggingKeys() {
      return draggingKeys.value;
    },
    get isDisabled() {
      return resolveBoolean(options.isDisabled);
    },
    isDragging(key) {
      return draggingKeys.value.has(key);
    },
    getKeysForDrag(key) {
      return getDragKeys(options.collection, options.selectionManager, key);
    },
    getItems(key) {
      const keys = getDragKeys(options.collection, options.selectionManager, key);
      const items: T[] = [];
      for (const currentKey of keys) {
        const value = options.collection.getItem(currentKey)?.value;
        if (value != null) {
          items.push(value);
        }
      }

      return options.getItems(keys, items);
    },
    get preview() {
      return toValue(options.preview) ?? null;
    },
    getAllowedDropOperations: options.getAllowedDropOperations,
    startDrag(key, event) {
      const keys = getDragKeys(options.collection, options.selectionManager, key);
      draggingKeys.value = keys;
      draggedKey.value = key;
      options.selectionManager.setFocused(false);
      options.onDragStart?.({
        ...event,
        keys,
      });
    },
    moveDrag(event) {
      options.onDragMove?.({
        ...event,
        keys: draggingKeys.value,
      });
    },
    endDrag(event) {
      options.onDragEnd?.({
        ...event,
        keys: draggingKeys.value,
        isInternal: event.isInternal,
      });

      draggingKeys.value = new Set<Key>();
      draggedKey.value = null;
    },
  };
}
