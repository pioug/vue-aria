import { ref, toValue } from "vue";
import type { Key, MaybeReactive } from "@vue-aria/types";
import type {
  AcceptedDragTypes,
  Collection,
  CollectionInsertEvent,
  CollectionItemDropEvent,
  CollectionMoveEvent,
  IDragTypes,
  DropOperation,
  DroppableCollectionDropEvent,
  DroppableCollectionEnterEvent,
  DroppableCollectionExitEvent,
  DropTarget,
  ItemDropTarget,
  RootDropEvent,
} from "@vue-aria/dnd";

function resolveBoolean(value: MaybeReactive<boolean | undefined> | undefined): boolean {
  if (value === undefined) {
    return false;
  }

  return Boolean(toValue(value));
}

function resolveAcceptedDragTypes(
  value: MaybeReactive<AcceptedDragTypes | undefined> | undefined
): AcceptedDragTypes {
  if (value === undefined) {
    return "all";
  }

  return toValue(value) ?? "all";
}

function dragTypesHas(types: Set<string> | IDragTypes, type: string | symbol): boolean {
  if (types instanceof Set) {
    return typeof type === "string" ? types.has(type) : false;
  }

  return types.has(type);
}

function toTypeSet(
  types: Set<string> | IDragTypes,
  acceptedDragTypes: AcceptedDragTypes
): Set<string | symbol> {
  if (types instanceof Set) {
    return new Set(types);
  }

  if (acceptedDragTypes === "all") {
    return new Set();
  }

  const result = new Set<string | symbol>();
  for (const type of acceptedDragTypes) {
    if (types.has(type)) {
      result.add(type);
    }
  }

  return result;
}

function isEqualDropTarget(a?: DropTarget | null, b?: DropTarget | null): boolean {
  if (!a) {
    return !b;
  }

  switch (a.type) {
    case "root":
      return b?.type === "root";
    case "item":
      return b?.type === "item" && b.key === a.key && b.dropPosition === a.dropPosition;
  }
}

function isDraggingWithinParent<T>(
  collection: Collection<T>,
  target: ItemDropTarget,
  draggingKeys: Set<Key>
): boolean {
  const targetNode = collection.getItem(target.key);
  for (const key of draggingKeys) {
    const node = collection.getItem(key);
    if (node?.parentKey !== targetNode?.parentKey) {
      return false;
    }
  }

  return true;
}

export interface DropOperationEvent {
  target: DropTarget;
  types: Set<string> | IDragTypes;
  allowedOperations: DropOperation[];
  isInternal: boolean;
  draggingKeys: Set<Key>;
}

export interface DroppableCollectionSelectionManager {
  selectedKeys?: MaybeReactive<Iterable<Key> | undefined>;
  setFocused?: (isFocused: boolean) => void;
  isSelected?: (key: Key) => boolean;
}

export interface DroppableCollectionStateOptions<T = unknown> {
  acceptedDragTypes?: MaybeReactive<AcceptedDragTypes | undefined>;
  isDisabled?: MaybeReactive<boolean | undefined>;
  onInsert?: (event: CollectionInsertEvent) => void | Promise<void>;
  onRootDrop?: (event: RootDropEvent) => void | Promise<void>;
  onItemDrop?: (event: CollectionItemDropEvent) => void | Promise<void>;
  onReorder?: (event: CollectionMoveEvent) => void | Promise<void>;
  onMove?: (event: CollectionMoveEvent) => void | Promise<void>;
  shouldAcceptItemDrop?: (
    target: DropTarget,
    types: Set<string | symbol>
  ) => boolean;
  collection: Collection<T>;
  selectionManager: DroppableCollectionSelectionManager;
  onDropEnter?: (event: DroppableCollectionEnterEvent) => void;
  onDropExit?: (event: DroppableCollectionExitEvent) => void;
  getDropOperation?: (
    target: DropTarget,
    types: Set<string> | IDragTypes,
    allowedOperations: DropOperation[]
  ) => DropOperation;
  onDrop?: (event: DroppableCollectionDropEvent) => void | Promise<void>;
}

export interface DroppableCollectionState<T = unknown> {
  collection: Collection<T>;
  selectionManager: DroppableCollectionSelectionManager;
  target: DropTarget | null;
  isDisabled?: boolean;
  setTarget: (target: DropTarget | null) => void;
  isDropTarget: (target: DropTarget | null) => boolean;
  getDropOperation: (event: DropOperationEvent) => DropOperation;
}

export function useDroppableCollectionState<T = unknown>(
  options: DroppableCollectionStateOptions<T>
): DroppableCollectionState<T> {
  const target = ref<DropTarget | null>(null);
  const targetRef = ref<DropTarget | null>(null);

  const getOppositeTarget = (itemTarget: ItemDropTarget): ItemDropTarget | null => {
    if (itemTarget.dropPosition === "before") {
      const node = options.collection.getItem(itemTarget.key);
      return node && node.prevKey != null
        ? { type: "item", key: node.prevKey, dropPosition: "after" }
        : null;
    }

    if (itemTarget.dropPosition === "after") {
      const node = options.collection.getItem(itemTarget.key);
      return node && node.nextKey != null
        ? { type: "item", key: node.nextKey, dropPosition: "before" }
        : null;
    }

    return null;
  };

  const isDropTarget = (dropTarget: DropTarget | null): boolean => {
    const current = targetRef.value;
    if (!current || !dropTarget) {
      return false;
    }

    if (isEqualDropTarget(dropTarget, current)) {
      return true;
    }

    if (
      dropTarget.type === "item" &&
      current.type === "item" &&
      dropTarget.key !== current.key &&
      dropTarget.dropPosition !== current.dropPosition &&
      dropTarget.dropPosition !== "on" &&
      current.dropPosition !== "on"
    ) {
      return (
        isEqualDropTarget(getOppositeTarget(dropTarget), current) ||
        isEqualDropTarget(dropTarget, getOppositeTarget(current))
      );
    }

    return false;
  };

  return {
    collection: options.collection,
    selectionManager: options.selectionManager,
    get target() {
      return target.value;
    },
    get isDisabled() {
      return resolveBoolean(options.isDisabled);
    },
    setTarget(nextTarget) {
      if (isDropTarget(nextTarget)) {
        return;
      }

      const current = targetRef.value;
      if (current && typeof options.onDropExit === "function") {
        options.onDropExit({
          type: "dropexit",
          x: 0,
          y: 0,
          target: current,
        });
      }

      if (nextTarget && typeof options.onDropEnter === "function") {
        options.onDropEnter({
          type: "dropenter",
          x: 0,
          y: 0,
          target: nextTarget,
        });
      }

      targetRef.value = nextTarget ?? null;
      target.value = nextTarget ?? null;
    },
    isDropTarget,
    getDropOperation(event) {
      if (resolveBoolean(options.isDisabled) || !event.target) {
        return "cancel";
      }

      const acceptedDragTypes = resolveAcceptedDragTypes(options.acceptedDragTypes);
      const acceptsType =
        acceptedDragTypes === "all" ||
        acceptedDragTypes.some((type) => dragTypesHas(event.types, type));

      if (!acceptsType) {
        return "cancel";
      }

      const isItemDropAllowed =
        event.target.type !== "item" ||
        event.target.dropPosition !== "on" ||
        !options.shouldAcceptItemDrop ||
        options.shouldAcceptItemDrop(
          event.target,
          toTypeSet(event.types, acceptedDragTypes)
        );

      const isValidInsert =
        Boolean(options.onInsert) &&
        event.target.type === "item" &&
        !event.isInternal &&
        (event.target.dropPosition === "before" ||
          event.target.dropPosition === "after");

      const isValidReorder =
        Boolean(options.onReorder) &&
        event.target.type === "item" &&
        event.isInternal &&
        (event.target.dropPosition === "before" ||
          event.target.dropPosition === "after") &&
        isDraggingWithinParent(options.collection, event.target, event.draggingKeys);

      const isValidMove =
        Boolean(options.onMove) &&
        event.target.type === "item" &&
        event.isInternal &&
        isItemDropAllowed;

      const isValidRootDrop =
        Boolean(options.onRootDrop) &&
        event.target.type === "root" &&
        !event.isInternal;

      const isValidOnItemDrop =
        Boolean(options.onItemDrop) &&
        event.target.type === "item" &&
        event.target.dropPosition === "on" &&
        !(event.isInternal && event.draggingKeys.has(event.target.key)) &&
        isItemDropAllowed;

      if (
        options.onDrop ||
        isValidInsert ||
        isValidReorder ||
        isValidMove ||
        isValidRootDrop ||
        isValidOnItemDrop
      ) {
        if (typeof options.getDropOperation === "function") {
          return options.getDropOperation(
            event.target,
            event.types,
            event.allowedOperations
          );
        }

        return event.allowedOperations[0] ?? "cancel";
      }

      return "cancel";
    },
  };
}
