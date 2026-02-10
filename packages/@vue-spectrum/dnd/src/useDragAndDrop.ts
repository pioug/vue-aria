import {
  createDragPreviewRenderer,
  DIRECTORY_DRAG_TYPE,
  isVirtualDragging,
  useDraggableCollection,
  useDraggableItem,
  useDropIndicator,
  useDroppableCollection,
  useDroppableItem,
  type Collection,
  type DragItem,
  type DragPreviewRenderer,
  type DraggableCollectionOptions,
  type DraggableItemProps,
  type DraggableItemResult,
  type DropIndicatorAria,
  type DropIndicatorProps,
  type DroppableCollectionOptions,
  type DroppableCollectionResult,
  type DroppableItemOptions,
  type DroppableItemResult,
} from "@vue-aria/dnd";
import {
  useDraggableCollectionState,
  useDroppableCollectionState,
  type DraggableCollectionState,
  type DraggableCollectionStateOptions,
  type DroppableCollectionState,
  type DroppableCollectionStateOptions,
} from "@vue-aria/dnd-state";
import type { Key, MaybeReactive } from "@vue-aria/types";
import { toValue } from "vue";
import type { VNodeChild } from "vue";

interface DraggableCollectionStateOpts<T>
  extends Omit<DraggableCollectionStateOptions<T>, "getItems"> {}

interface DragHooks<T = object> {
  useDraggableCollectionState?: (
    props: DraggableCollectionStateOpts<T>
  ) => DraggableCollectionState<T>;
  useDraggableCollection?: (
    props: DraggableCollectionOptions,
    state: DraggableCollectionState,
    ref: MaybeReactive<HTMLElement | null | undefined>
  ) => void;
  useDraggableItem?: (
    props: DraggableItemProps,
    state: DraggableCollectionState
  ) => DraggableItemResult;
  createDragPreviewRenderer?: typeof createDragPreviewRenderer;
}

interface DropHooks<T = object> {
  useDroppableCollectionState?: (
    props: DroppableCollectionStateOptions<T>
  ) => DroppableCollectionState<T>;
  useDroppableCollection?: (
    props: DroppableCollectionOptions,
    state: DroppableCollectionState,
    ref: MaybeReactive<HTMLElement | null | undefined>
  ) => DroppableCollectionResult;
  useDroppableItem?: (
    options: DroppableItemOptions,
    state: DroppableCollectionState,
    ref: MaybeReactive<HTMLElement | null | undefined>
  ) => DroppableItemResult;
  useDropIndicator?: (
    props: DropIndicatorProps,
    state: DroppableCollectionState,
    ref: MaybeReactive<HTMLElement | null | undefined>
  ) => DropIndicatorAria;
}

export interface DragAndDropHooks<T = object> {
  dragAndDropHooks: DragHooks<T> &
    DropHooks<T> & {
      isVirtualDragging?: () => boolean;
      renderPreview?: (keys: Set<Key>, draggedKey: Key) => VNodeChild;
    };
}

export interface DragAndDropOptions<T = object>
  extends Partial<Omit<DraggableCollectionStateOptions<T>, "collection" | "selectionManager" | "getItems">>,
    Partial<Omit<DroppableCollectionStateOptions<T>, "collection" | "selectionManager">> {
  getItems?: (keys: Set<Key>, items: T[]) => DragItem[];
  renderPreview?: (keys: Set<Key>, draggedKey: Key) => VNodeChild;
  onDropMove?: DroppableCollectionOptions["onDropMove"];
  onDropActivate?: DroppableCollectionOptions["onDropActivate"];
  onKeyDown?: DroppableCollectionOptions["onKeyDown"];
}

/**
 * Provides compatible drag-and-drop hooks for Vue Spectrum collection components.
 */
export function useDragAndDrop<T = object>(
  options: DragAndDropOptions<T>
): DragAndDropHooks<T> {
  const {
    onDrop,
    onInsert,
    onItemDrop,
    onReorder,
    onRootDrop,
    getItems,
    renderPreview,
  } = options;

  const isDraggable = typeof getItems === "function";
  const isDroppable = Boolean(onDrop || onInsert || onItemDrop || onReorder || onRootDrop);

  const hooks = {} as DragAndDropHooks<T>["dragAndDropHooks"];
  const droppableCollectionOverrides: Partial<DroppableCollectionOptions> = {
    acceptedDragTypes: options.acceptedDragTypes
      ? toValue(options.acceptedDragTypes)
      : undefined,
    shouldAcceptItemDrop: options.shouldAcceptItemDrop,
    onDropEnter: options.onDropEnter,
    onDropMove: options.onDropMove,
    onDropExit: options.onDropExit,
    onRootDrop: options.onRootDrop,
    onItemDrop: options.onItemDrop,
    onInsert: options.onInsert,
    onMove: options.onMove,
    onReorder: options.onReorder,
    onDrop: options.onDrop,
    onDropActivate: options.onDropActivate,
    onKeyDown: options.onKeyDown,
  };

  if (isDraggable) {
    hooks.useDraggableCollectionState = (props: DraggableCollectionStateOpts<T>) =>
      useDraggableCollectionState({
        ...props,
        ...options,
        getItems: getItems!,
      });
    hooks.useDraggableCollection = useDraggableCollection;
    hooks.useDraggableItem = useDraggableItem;
    hooks.createDragPreviewRenderer = createDragPreviewRenderer;
    hooks.renderPreview = renderPreview;
  }

  if (isDroppable) {
    hooks.useDroppableCollectionState = (props: DroppableCollectionStateOptions<T>) =>
      useDroppableCollectionState({
        ...props,
        ...options,
      });
    hooks.useDroppableItem = useDroppableItem;
    hooks.useDroppableCollection = (
      props: DroppableCollectionOptions,
      state: DroppableCollectionState,
      ref: MaybeReactive<HTMLElement | null | undefined>
    ) =>
      useDroppableCollection(
        {
          ...props,
          ...droppableCollectionOverrides,
        },
        state,
        ref
      );
    hooks.useDropIndicator = useDropIndicator;
  }

  if (isDraggable || isDroppable) {
    hooks.isVirtualDragging = isVirtualDragging;
  }

  return {
    dragAndDropHooks: hooks,
  };
}

export { DIRECTORY_DRAG_TYPE };

export type {
  Collection,
  DragItem,
  DragPreviewRenderer,
  DropIndicatorAria,
  DropIndicatorProps,
  DroppableCollectionOptions,
  DroppableCollectionResult,
  DroppableItemOptions,
  DroppableItemResult,
};
