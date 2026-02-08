import { computed, toValue, watchEffect } from "vue";
import { mergeProps } from "@vue-aria/utils";
import { useId } from "@vue-aria/ssr";
import { useLocale } from "@vue-aria/i18n";
import type { Key, MaybeReactive, ReadonlyRef } from "@vue-aria/types";
import type {
  Collection,
  DragTypes,
  DropItem,
  DropOperation,
  DropTarget,
  DropTargetDelegate,
  KeyboardDelegate,
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
import { navigate } from "./DropTargetKeyboardNavigation";

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
  keyboardDelegate?: KeyboardDelegate;
  collection?: Collection;
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

type NavigationDirection = "left" | "right" | "up" | "down";

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

function getDropOperation(
  state: DroppableCollectionState,
  ref: MaybeReactive<HTMLElement | null | undefined>,
  target: DropTarget,
  types: Set<string> | DragTypes,
  allowedOperations: DropOperation[]
): DropOperation {
  return state.getDropOperation({
    target,
    types,
    allowedOperations,
    isInternal: isInternalDropOperation(ref),
    draggingKeys: getDraggingKeys(),
  });
}

function getNextTarget(
  props: DroppableCollectionOptions,
  direction: NavigationDirection,
  target: DropTarget | null,
  rtl: boolean,
  wrap = true
): DropTarget | null {
  if (!props.keyboardDelegate || !props.collection) {
    return null;
  }

  return navigate(
    props.keyboardDelegate,
    props.collection,
    target,
    direction,
    rtl,
    wrap
  );
}

function nextValidTarget(
  props: DroppableCollectionOptions,
  state: DroppableCollectionState,
  ref: MaybeReactive<HTMLElement | null | undefined>,
  types: Set<string>,
  allowedOperations: DropOperation[],
  getNext: (target: DropTarget | null, wrap?: boolean) => DropTarget | null,
  wrap = true,
  initialTarget: DropTarget | null = state.target
): DropTarget | null {
  let target: DropTarget | null = initialTarget;
  let seenRoot = 0;

  do {
    const nextTarget = getNext(target, wrap);
    if (!nextTarget) {
      return null;
    }

    target = nextTarget;
    const operation = getDropOperation(
      state,
      ref,
      nextTarget,
      types,
      allowedOperations
    );
    if (nextTarget.type === "root") {
      seenRoot += 1;
    }

    if (operation !== "cancel") {
      return nextTarget;
    }
  } while (seenRoot < 2);

  return null;
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
  const locale = useLocale();
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
        return getDropOperation(
          state,
          ref,
          target,
          types,
          allowedOperations
        );
      },
      onDropEnter(_event, drag) {
        setDropCollectionRef(ref);
        const types = getTypes(drag.items);
        const rtl = locale.value.direction === "rtl";

        const target =
          nextValidTarget(
            props,
            state,
            ref,
            types,
            drag.allowedDropOperations,
            (currentTarget, wrap) =>
              getNextTarget(props, "down", currentTarget, rtl, wrap),
            true,
            null
          ) ??
          (() => {
            const rootTarget: DropTarget = { type: "root" };
            const operation = getDropOperation(
              state,
              ref,
              rootTarget,
              types,
              drag.allowedDropOperations
            );
            return operation === "cancel" ? null : rootTarget;
          })();

        state.setTarget(target);
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
      onKeyDown(event, drag) {
        if (drag) {
          const types = getTypes(drag.items);
          const rtl = locale.value.direction === "rtl";
          const getNext = (
            direction: NavigationDirection,
            wrap = true
          ) =>
            nextValidTarget(
              props,
              state,
              ref,
              types,
              drag.allowedDropOperations,
              (currentTarget, shouldWrap) =>
                getNextTarget(
                  props,
                  direction,
                  currentTarget,
                  rtl,
                  shouldWrap ?? wrap
                ),
              wrap
            );

          switch (event.key) {
            case "ArrowDown": {
              if (props.keyboardDelegate?.getKeyBelow) {
                const target = getNext("down");
                if (target) {
                  state.setTarget(target);
                }
              }
              break;
            }
            case "ArrowUp": {
              if (props.keyboardDelegate?.getKeyAbove) {
                const target = getNext("up");
                if (target) {
                  state.setTarget(target);
                }
              }
              break;
            }
            case "ArrowLeft": {
              if (props.keyboardDelegate?.getKeyLeftOf) {
                const target = getNext("left");
                if (target) {
                  state.setTarget(target);
                }
              }
              break;
            }
            case "ArrowRight": {
              if (props.keyboardDelegate?.getKeyRightOf) {
                const target = getNext("right");
                if (target) {
                  state.setTarget(target);
                }
              }
              break;
            }
            case "Home": {
              if (props.keyboardDelegate?.getFirstKey) {
                const target = nextValidTarget(
                  props,
                  state,
                  ref,
                  types,
                  drag.allowedDropOperations,
                  (currentTarget, wrap) =>
                    getNextTarget(props, "down", currentTarget, rtl, wrap),
                  true,
                  null
                );
                if (target) {
                  state.setTarget(target);
                }
              }
              break;
            }
            case "End": {
              if (props.keyboardDelegate?.getLastKey) {
                const target = nextValidTarget(
                  props,
                  state,
                  ref,
                  types,
                  drag.allowedDropOperations,
                  (currentTarget, wrap) =>
                    getNextTarget(props, "up", currentTarget, rtl, wrap),
                  true,
                  null
                );
                if (target) {
                  state.setTarget(target);
                }
              }
              break;
            }
          }
        }

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
