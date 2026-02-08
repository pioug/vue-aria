import { computed, toValue, watchEffect } from "vue";
import { mergeProps } from "@vue-aria/utils";
import { useId } from "@vue-aria/ssr";
import type { Key, MaybeReactive, ReadonlyRef } from "@vue-aria/types";
import type {
  DragTypes,
  DropItem,
  DropOperation,
  DropTarget,
  DropTargetDelegate,
} from "./types";
import {
  clearGlobalDnDState,
  getTypes,
  globalDndState,
  isInternalDropOperation,
  registerDroppableCollection,
  setDropCollectionRef,
} from "./utils";
import {
  registerDropTarget,
} from "./DragManager";
import { useAutoScroll } from "./useAutoScroll";
import { useDrop, type DropActivateEvent, type DropEvent } from "./useDrop";

export interface DroppableCollectionGetOperationOptions {
  target: DropTarget;
  types: Set<string> | DragTypes;
  allowedOperations: DropOperation[];
  isInternal: boolean;
  draggingKeys: Set<Key>;
}

export interface DroppableCollectionDropEvent {
  type: "drop";
  x: number;
  y: number;
  target: DropTarget;
  items: DropItem[];
  dropOperation: DropOperation;
}

export interface DroppableCollectionActivateEvent {
  type: "dropactivate";
  x: number;
  y: number;
  target: DropTarget;
}

export interface DroppableCollectionState {
  target: DropTarget | null;
  setTarget: (target: DropTarget | null) => void;
  getDropOperation: (
    options: DroppableCollectionGetOperationOptions
  ) => DropOperation;
}

export interface DroppableCollectionOptions {
  dropTargetDelegate: DropTargetDelegate;
  onDrop?: (event: DroppableCollectionDropEvent) => void | Promise<void>;
  onDropActivate?: (event: DroppableCollectionActivateEvent) => void;
  onKeyDown?: (event: KeyboardEvent) => void;
}

export interface DroppableCollectionResult {
  collectionProps: ReadonlyRef<Record<string, unknown>>;
}

interface LocalDroppableCollectionState {
  nextTarget: DropTarget | null;
}

interface DragTargetLike {
  items: Array<Record<string, string>>;
  allowedDropOperations: DropOperation[];
}

function getDraggingKeys(): Set<Key> {
  return (globalDndState.draggingKeys as Set<Key> | undefined) ?? new Set<Key>();
}

function toDropEvent(
  event: DropEvent,
  target: DropTarget
): DroppableCollectionDropEvent {
  return {
    type: "drop",
    x: event.x,
    y: event.y,
    target,
    items: event.items,
    dropOperation: event.dropOperation,
  };
}

export function useDroppableCollection(
  props: DroppableCollectionOptions,
  state: DroppableCollectionState,
  ref: MaybeReactive<HTMLElement | null | undefined>
): DroppableCollectionResult {
  const localState: LocalDroppableCollectionState = {
    nextTarget: null,
  };
  const id = useId(undefined, "v-aria-droppable-collection");
  const autoScroll = useAutoScroll(ref);

  watchEffect(() => {
    registerDroppableCollection(state, id.value, ref);
  });

  const { dropProps } = useDrop({
    ref,
    onDropEnter() {
      if (localState.nextTarget != null) {
        state.setTarget(localState.nextTarget);
      }
    },
    onDropMove(event) {
      if (localState.nextTarget != null) {
        state.setTarget(localState.nextTarget);
      }
      autoScroll.move(event.x, event.y);
    },
    getDropOperationForPoint(types, allowedOperations, x, y) {
      const isInternal = isInternalDropOperation(ref);
      const draggingKeys = getDraggingKeys();
      const isValidDropTarget = (target: DropTarget) =>
        state.getDropOperation({
          target,
          types,
          allowedOperations,
          isInternal,
          draggingKeys,
        }) !== "cancel";

      const target = props.dropTargetDelegate.getDropTargetFromPoint(
        x,
        y,
        isValidDropTarget
      );
      if (!target) {
        localState.nextTarget = null;
        return "cancel";
      }

      const operation = state.getDropOperation({
        target,
        types,
        allowedOperations,
        isInternal,
        draggingKeys,
      });

      if (operation === "cancel") {
        localState.nextTarget = null;
        return "cancel";
      }

      localState.nextTarget = target;
      setDropCollectionRef(ref);
      return operation;
    },
    onDropExit() {
      setDropCollectionRef(null);
      state.setTarget(null);
      autoScroll.stop();
    },
    onDropActivate(event) {
      if (state.target?.type === "item") {
        props.onDropActivate?.({
          type: "dropactivate",
          x: event.x,
          y: event.y,
          target: state.target,
        });
      }
    },
    onDrop(event) {
      setDropCollectionRef(ref);
      const target = state.target ?? localState.nextTarget;
      if (target) {
        props.onDrop?.(toDropEvent(event, target));
      }

      if (globalDndState.draggingCollectionRef == null) {
        clearGlobalDnDState();
      }
    },
  });

  watchEffect((onCleanup) => {
    const element = toValue(ref);
    if (!element) {
      return;
    }

    const unregister = registerDropTarget({
      element,
      preventFocusOnDrop: true,
      getDropOperation(types, allowedOperations) {
        const target = state.target ?? ({ type: "root" } as DropTarget);
        return state.getDropOperation({
          target,
          types,
          allowedOperations,
          isInternal: isInternalDropOperation(ref),
          draggingKeys: getDraggingKeys(),
        });
      },
      onDropEnter(_event, drag) {
        setDropCollectionRef(ref);
        const target: DropTarget = { type: "root" };
        const operation = state.getDropOperation({
          target,
          types: getTypes(drag.items),
          allowedOperations: drag.allowedDropOperations,
          isInternal: isInternalDropOperation(ref),
          draggingKeys: getDraggingKeys(),
        });
        state.setTarget(operation === "cancel" ? null : target);
      },
      onDropExit() {
        setDropCollectionRef(null);
        state.setTarget(null);
      },
      onDropTargetEnter(target) {
        state.setTarget(target);
      },
      onDropActivate(event: DropActivateEvent, target) {
        if (target?.type === "item") {
          props.onDropActivate?.({
            type: "dropactivate",
            x: event.x,
            y: event.y,
            target,
          });
        }
      },
      onDrop(event, target) {
        setDropCollectionRef(ref);
        const nextTarget = target ?? state.target;
        if (nextTarget) {
          props.onDrop?.(toDropEvent(event, nextTarget));
        }
      },
      onKeyDown(event) {
        props.onKeyDown?.(event);
      },
    });

    onCleanup(unregister);
  });

  return {
    collectionProps: computed<Record<string, unknown>>(() =>
      mergeProps(dropProps, {
        id: id.value,
        "aria-describedby": null,
      })
    ),
  };
}
