import { ref } from "vue";
import type {
  Collection,
  DragTypes,
  DroppableCollectionMoveEvent,
  DroppableCollectionProps,
  ItemDropTarget,
  Key,
  Node,
} from "@react-types/shared";
import { MultipleSelectionManager } from "@vue-stately/selection";
import type { DropOperation, DropTarget, DroppableCollectionState } from "./types";

interface DropOperationEvent {
  target: any;
  types: DragTypes;
  allowedOperations: DropOperation[];
  isInternal: boolean;
  draggingKeys: Set<Key>;
}

type CollectionDropTarget = DropTarget & {
  key?: Key;
  dropPosition?: "before" | "after" | "on";
};

export interface DroppableCollectionStateOptions extends Omit<DroppableCollectionProps, "onDropMove" | "onDropActivate"> {
  /** A collection of items. */
  collection: Collection<Node<unknown>>;
  /** An interface for reading and updating multiple selection state. */
  selectionManager: MultipleSelectionManager;
  /** Whether the drop events should be disabled. */
  isDisabled?: boolean;
}

/**
 * Manages state for a droppable collection.
 */
export function useDroppableCollectionState(
  props: DroppableCollectionStateOptions
): DroppableCollectionState {
  const {
    acceptedDragTypes = "all",
    isDisabled,
    onInsert,
    onRootDrop,
    onItemDrop,
    onReorder,
    onMove,
    shouldAcceptItemDrop,
    collection,
    selectionManager,
    onDropEnter,
    getDropOperation,
  } = props;

  const currentTarget = ref<CollectionDropTarget | null>(null);
  const targetRef = ref<CollectionDropTarget | null>(null);

  const getOppositeDropTarget = (target: ItemDropTarget): ItemDropTarget | null => {
    if (target.dropPosition === "before") {
      const node = collection.getItem(target.key);
      return node && node.prevKey != null ? { type: "item", key: node.prevKey, dropPosition: "after" } : null;
    }
    if (target.dropPosition === "after") {
      const node = collection.getItem(target.key);
      return node && node.nextKey != null ? { type: "item", key: node.nextKey, dropPosition: "before" } : null;
    }
    return null;
  };

  const defaultGetDropOperation = (event: DropOperationEvent): DropOperation => {
    const { target, types, allowedOperations, isInternal, draggingKeys } = event;

    if (isDisabled || !target) {
      return "none";
    }

    const dragTypes = types?.toArray ? types.toArray() : [];
    if (acceptedDragTypes === "all" || (acceptedDragTypes?.some && acceptedDragTypes.some((type) => dragTypes.includes(type)))) {
      const isValidInsert =
        onInsert &&
        target.type === "item" &&
        !isInternal &&
        (target.dropPosition === "before" || target.dropPosition === "after");

      const isValidReorder =
        onReorder &&
        target.type === "item" &&
        isInternal &&
        (target.dropPosition === "before" || target.dropPosition === "after") &&
        isDraggingWithinParent(collection, target as ItemDropTarget, draggingKeys);

      const isItemDropAllowed =
        target.type !== "item" ||
        target.dropPosition !== "on" ||
        !shouldAcceptItemDrop ||
        shouldAcceptItemDrop(target, types);

      const isValidMove =
        onMove &&
        target.type === "item" &&
        isInternal &&
        isItemDropAllowed;

      const isValidRootDrop = onRootDrop && target.type === "root" && !isInternal;

      const isValidOnItemDrop =
        onItemDrop &&
        target.type === "item" &&
        target.dropPosition === "on" &&
        !(isInternal && target.key != null && draggingKeys.has(target.key)) &&
        isItemDropAllowed;

      if (isValidInsert || isValidReorder || isValidMove || isValidRootDrop || isValidOnItemDrop) {
        if (getDropOperation) {
          return getDropOperation(target, types, allowedOperations) as DropOperation;
        }
        return allowedOperations[0] ?? "none";
      }
    }

    return "none";
  };

  return {
    collection,
    selectionManager,
    isDisabled,
    get target() {
      return currentTarget.value;
    },
    setTarget(newTarget: CollectionDropTarget | null) {
      if (isDropTarget(targetRef.value, newTarget)) {
        return;
      }

      const previousTarget = targetRef.value;
      if (previousTarget && typeof props.onDropExit === "function") {
        props.onDropExit({ type: "dropexit", x: 0, y: 0, target: previousTarget });
      }

      if (newTarget && typeof onDropEnter === "function") {
        onDropEnter({ type: "dropenter", x: 0, y: 0, target: newTarget });
      }

      targetRef.value = newTarget;
      currentTarget.value = newTarget;
    },
    isDropTarget(dropTarget: CollectionDropTarget | null) {
      return isDropTarget(targetRef.value, dropTarget);
    },
    getDropOperation(event: DroppableCollectionMoveEvent): DropOperation {
      return defaultGetDropOperation(event as unknown as DropOperationEvent);
    },
  };
}

function isDropTarget(target: CollectionDropTarget | null, dropTarget: CollectionDropTarget | null): boolean {
  if (!target || !dropTarget) {
    return false;
  }
  if (isEqualDropTarget(dropTarget, target)) {
    return true;
  }
  if (
    dropTarget.type === "item" &&
    target.type === "item" &&
    dropTarget.key !== target.key &&
    dropTarget.dropPosition !== target.dropPosition &&
    target.dropPosition !== "on" &&
    dropTarget.dropPosition !== "on"
  ) {
    return isEqualDropTarget(getOppositeDropTarget(dropTarget), target)
      || isEqualDropTarget(dropTarget, getOppositeDropTarget(target as ItemDropTarget));
  }
  return false;
}

function isEqualDropTarget(a?: CollectionDropTarget | null, b?: CollectionDropTarget | null): boolean {
  if (!a) {
    return !b;
  }
  if (a.type === "root") {
    return b?.type === "root";
  }
  if (a.type === "item") {
    return b?.type === "item" && b?.key === a.key && b?.dropPosition === a.dropPosition;
  }
  return false;
}

function isDraggingWithinParent(
  collection: Collection<Node<unknown>>,
  target: ItemDropTarget,
  draggingKeys: Set<Key>
) {
  const targetNode = collection.getItem(target.key);

  for (const key of draggingKeys) {
    const node = collection.getItem(key);
    if (node?.parentKey !== targetNode?.parentKey) {
      return false;
    }
  }
  return true;
}
