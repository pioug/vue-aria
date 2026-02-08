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
  DIRECTORY_DRAG_TYPE,
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

export interface DroppableCollectionEnterEvent {
  type: "dropenter";
  x: number;
  y: number;
  target: DropTarget;
}

export interface DroppableCollectionMoveEvent {
  type: "dropmove";
  x: number;
  y: number;
  target: DropTarget;
}

export interface DroppableCollectionExitEvent {
  type: "dropexit";
  x: number;
  y: number;
  target: DropTarget;
}

export interface RootDropEvent {
  items: DropItem[];
  dropOperation: DropOperation;
}

export interface CollectionItemDropEvent {
  items: DropItem[];
  dropOperation: DropOperation;
  isInternal: boolean;
  target: DropTarget;
}

export interface CollectionInsertEvent {
  items: DropItem[];
  dropOperation: DropOperation;
  target: DropTarget;
}

export interface CollectionMoveEvent {
  keys: Set<Key>;
  dropOperation: DropOperation;
  target: DropTarget;
}

export interface DroppableCollectionState {
  target: DropTarget | null;
  setTarget: (target: DropTarget | null) => void;
  getDropOperation: (
    options: DroppableCollectionGetOperationOptions
  ) => DropOperation;
}

export type AcceptedDragTypes = "all" | Array<string | symbol>;

export interface DroppableCollectionOptions {
  dropTargetDelegate: DropTargetDelegate;
  keyboardDelegate?: KeyboardDelegate;
  collection?: Collection;
  acceptedDragTypes?: AcceptedDragTypes;
  shouldAcceptItemDrop?: (target: DropTarget, types: Set<string | symbol>) => boolean;
  onDropEnter?: (event: DroppableCollectionEnterEvent) => void;
  onDropMove?: (event: DroppableCollectionMoveEvent) => void;
  onDropExit?: (event: DroppableCollectionExitEvent) => void;
  onRootDrop?: (event: RootDropEvent) => void | Promise<void>;
  onItemDrop?: (event: CollectionItemDropEvent) => void | Promise<void>;
  onInsert?: (event: CollectionInsertEvent) => void | Promise<void>;
  onMove?: (event: CollectionMoveEvent) => void | Promise<void>;
  onReorder?: (event: CollectionMoveEvent) => void | Promise<void>;
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

function createDropEnterEvent(
  x: number,
  y: number,
  target: DropTarget
): DroppableCollectionEnterEvent {
  return {
    type: "dropenter",
    x,
    y,
    target,
  };
}

function createDropMoveEvent(
  x: number,
  y: number,
  target: DropTarget
): DroppableCollectionMoveEvent {
  return {
    type: "dropmove",
    x,
    y,
    target,
  };
}

function createDropExitEvent(
  x: number,
  y: number,
  target: DropTarget
): DroppableCollectionExitEvent {
  return {
    type: "dropexit",
    x,
    y,
    target,
  };
}

function getItemTypes(item: DropItem): Set<string | symbol> {
  if (item.kind === "directory") {
    return new Set([DIRECTORY_DRAG_TYPE]);
  }

  if (item.kind === "file") {
    return new Set([item.type]);
  }

  return item.types;
}

function filterDropItems(
  props: DroppableCollectionOptions,
  target: DropTarget,
  items: DropItem[]
): DropItem[] {
  const acceptedDragTypes = props.acceptedDragTypes ?? "all";
  const shouldAcceptItemDrop = props.shouldAcceptItemDrop;
  if (acceptedDragTypes === "all" && !shouldAcceptItemDrop) {
    return items;
  }

  return items.filter((item) => {
    const itemTypes = getItemTypes(item);

    const acceptsType =
      acceptedDragTypes === "all"
        ? true
        : acceptedDragTypes.some((type) => itemTypes.has(type));
    if (!acceptsType) {
      return false;
    }

    if (
      target.type === "item" &&
      target.dropPosition === "on" &&
      typeof shouldAcceptItemDrop === "function"
    ) {
      return shouldAcceptItemDrop(target, itemTypes);
    }

    return true;
  });
}

async function defaultOnDrop(
  props: DroppableCollectionOptions,
  ref: MaybeReactive<HTMLElement | null | undefined>,
  event: DroppableCollectionDropEvent
): Promise<void> {
  const filteredItems = filterDropItems(props, event.target, event.items);
  if (filteredItems.length === 0) {
    return;
  }

  const draggingKeys = getDraggingKeys();
  const isInternal = isInternalDropOperation(ref);

  if (event.target.type === "root") {
    await props.onRootDrop?.({
      items: filteredItems,
      dropOperation: event.dropOperation,
    });
    return;
  }

  if (event.target.dropPosition === "on") {
    await props.onItemDrop?.({
      items: filteredItems,
      dropOperation: event.dropOperation,
      isInternal,
      target: event.target,
    });
  }

  if (isInternal) {
    await props.onMove?.({
      keys: draggingKeys,
      dropOperation: event.dropOperation,
      target: event.target,
    });
  }

  if (event.target.dropPosition !== "on") {
    if (isInternal) {
      await props.onReorder?.({
        keys: draggingKeys,
        dropOperation: event.dropOperation,
        target: event.target,
      });
    } else {
      await props.onInsert?.({
        items: filteredItems,
        dropOperation: event.dropOperation,
        target: event.target,
      });
    }
  }
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

function isValidTarget(
  state: DroppableCollectionState,
  ref: MaybeReactive<HTMLElement | null | undefined>,
  target: DropTarget,
  types: Set<string>,
  allowedOperations: DropOperation[]
): boolean {
  return (
    getDropOperation(state, ref, target, types, allowedOperations) !== "cancel"
  );
}

function resolvePageTarget(
  props: DroppableCollectionOptions,
  state: DroppableCollectionState,
  ref: MaybeReactive<HTMLElement | null | undefined>,
  types: Set<string>,
  allowedOperations: DropOperation[],
  rtl: boolean,
  direction: "up" | "down"
): DropTarget | null {
  if (!props.keyboardDelegate || !props.collection) {
    return null;
  }

  if (direction === "down") {
    if (!props.keyboardDelegate.getKeyPageBelow) {
      return null;
    }

    const lastKey = props.keyboardDelegate.getLastKey?.() ?? null;
    const baseKey =
      state.target?.type === "item"
        ? state.target.key
        : props.keyboardDelegate.getFirstKey?.() ?? null;

    if (baseKey == null) {
      return null;
    }

    let pageKey = props.keyboardDelegate.getKeyPageBelow(baseKey);
    let dropPosition: "before" | "on" | "after" =
      state.target?.type === "item" ? state.target.dropPosition : "after";
    if (pageKey == null || (lastKey != null && baseKey === lastKey)) {
      pageKey = lastKey;
      dropPosition = "after";
    }

    if (pageKey == null) {
      return null;
    }

    const candidate: DropTarget = {
      type: "item",
      key: pageKey,
      dropPosition,
    };

    if (isValidTarget(state, ref, candidate, types, allowedOperations)) {
      return candidate;
    }

    return (
      nextValidTarget(
        props,
        state,
        ref,
        types,
        allowedOperations,
        (target, wrap) =>
          getNextTarget(props, "down", target, rtl, wrap),
        false,
        candidate
      ) ??
      nextValidTarget(
        props,
        state,
        ref,
        types,
        allowedOperations,
        (target, wrap) =>
          getNextTarget(props, "up", target, rtl, wrap),
        false,
        candidate
      )
    );
  }

  if (!props.keyboardDelegate.getKeyPageAbove) {
    return null;
  }

  if (!state.target) {
    return nextValidTarget(
      props,
      state,
      ref,
      types,
      allowedOperations,
      (target, wrap) => getNextTarget(props, "up", target, rtl, wrap),
      true,
      null
    );
  }

  const firstKey = props.keyboardDelegate.getFirstKey?.() ?? null;
  if (state.target.type === "item" && firstKey != null && state.target.key === firstKey) {
    const rootTarget: DropTarget = { type: "root" };
    if (isValidTarget(state, ref, rootTarget, types, allowedOperations)) {
      return rootTarget;
    }
  }

  if (state.target.type !== "item") {
    return null;
  }

  let pageKey = props.keyboardDelegate.getKeyPageAbove(state.target.key);
  let dropPosition = state.target.dropPosition;
  if (pageKey == null) {
    pageKey = firstKey;
    dropPosition = "before";
  }

  if (pageKey == null) {
    return null;
  }

  const candidate: DropTarget = {
    type: "item",
    key: pageKey,
    dropPosition,
  };

  if (isValidTarget(state, ref, candidate, types, allowedOperations)) {
    return candidate;
  }

  return (
    nextValidTarget(
      props,
      state,
      ref,
      types,
      allowedOperations,
      (target, wrap) => getNextTarget(props, "up", target, rtl, wrap),
      false,
      candidate
    ) ??
    nextValidTarget(
      props,
      state,
      ref,
      types,
      allowedOperations,
      (target, wrap) => getNextTarget(props, "down", target, rtl, wrap),
      false,
      candidate
    )
  );
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
    onDropEnter(event) {
      const target = localState.nextTarget;
      if (target != null) {
        state.setTarget(target);
        props.onDropEnter?.(createDropEnterEvent(event.x, event.y, target));
      }
    },
    onDropMove(event) {
      const target = localState.nextTarget;
      if (target != null) {
        state.setTarget(target);
        props.onDropMove?.(createDropMoveEvent(event.x, event.y, target));
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
        const rootTarget: DropTarget = { type: "root" };
        const rootOperation = state.getDropOperation({
          target: rootTarget,
          types,
          allowedOperations,
          isInternal,
          draggingKeys,
        });
        if (rootOperation === "cancel") {
          localState.nextTarget = null;
          return "cancel";
        }

        localState.nextTarget = rootTarget;
        setDropCollectionRef(ref);
        return rootOperation;
      }

      localState.nextTarget = target;
      setDropCollectionRef(ref);
      return operation;
    },
    onDropExit() {
      const target = state.target ?? localState.nextTarget;
      if (target != null) {
        props.onDropExit?.(createDropExitEvent(0, 0, target));
      }
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
        const dropEvent = toDropEvent(event, target);
        if (props.onDrop) {
          props.onDrop(dropEvent);
        } else {
          void defaultOnDrop(props, ref, dropEvent);
        }
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
        if (target != null) {
          props.onDropEnter?.(createDropEnterEvent(0, 0, target));
        }
      },
      onDropExit() {
        if (state.target != null) {
          props.onDropExit?.(createDropExitEvent(0, 0, state.target));
        }
        setDropCollectionRef(null);
        state.setTarget(null);
      },
      onDropTargetEnter(target) {
        state.setTarget(target);
        if (target != null) {
          props.onDropEnter?.(createDropEnterEvent(0, 0, target));
        }
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
          const dropEvent = toDropEvent(event, nextTarget);
          if (props.onDrop) {
            props.onDrop(dropEvent);
          } else {
            void defaultOnDrop(props, ref, dropEvent);
          }
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
            case "PageDown": {
              const target = resolvePageTarget(
                props,
                state,
                ref,
                types,
                drag.allowedDropOperations,
                rtl,
                "down"
              );
              if (target) {
                state.setTarget(target);
              }
              break;
            }
            case "PageUp": {
              const target = resolvePageTarget(
                props,
                state,
                ref,
                types,
                drag.allowedDropOperations,
                rtl,
                "up"
              );
              if (target) {
                state.setTarget(target);
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
