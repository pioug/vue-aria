import { ref, toValue, watchEffect } from "vue";
import { mergeProps } from "@vue-aria/utils";
import type { Key, MaybeReactive, ReadonlyRef } from "@vue-aria/types";
import {
  DROP_EFFECT_TO_DROP_OPERATION,
  DROP_OPERATION,
  DROP_OPERATION_ALLOWED,
  DROP_OPERATION_TO_DROP_EFFECT,
} from "./constants";
import { registerDropTarget } from "./DragManager";
import {
  DragTypes,
  globalAllowedDropOperations,
  globalDndState,
  readFromDataTransfer,
  setGlobalDnDState,
  setGlobalDropEffect,
} from "./utils";
import { useVirtualDrop } from "./useVirtualDrop";
import type {
  DragTypes as IDragTypes,
  DropItem,
  DropOperation,
} from "./types";

const DROP_ACTIVATE_TIMEOUT = 800;

type DropOperationBits = number;

export interface DropEnterEvent {
  type: "dropenter";
  x: number;
  y: number;
}

export interface DropMoveEvent {
  type: "dropmove";
  x: number;
  y: number;
}

export interface DropExitEvent {
  type: "dropexit";
  x: number;
  y: number;
}

export interface DropActivateEvent {
  type: "dropactivate";
  x: number;
  y: number;
}

export interface DropEvent {
  type: "drop";
  x: number;
  y: number;
  items: DropItem[];
  dropOperation: DropOperation;
}

export interface DropOptions {
  ref: MaybeReactive<HTMLElement | null | undefined>;
  getDropOperation?: (
    types: IDragTypes,
    allowedOperations: DropOperation[]
  ) => DropOperation;
  getDropOperationForPoint?: (
    types: IDragTypes,
    allowedOperations: DropOperation[],
    x: number,
    y: number
  ) => DropOperation;
  onDropEnter?: (event: DropEnterEvent) => void;
  onDropMove?: (event: DropMoveEvent) => void;
  onDropActivate?: (event: DropActivateEvent) => void;
  onDropExit?: (event: DropExitEvent) => void;
  onDrop?: (event: DropEvent) => void;
  hasDropButton?: boolean;
  isDisabled?: MaybeReactive<boolean>;
}

export interface DropResult {
  dropProps: Record<string, unknown>;
  isDropTarget: ReadonlyRef<boolean>;
  dropButtonProps?: Record<string, unknown>;
}

function resolveElement(options: DropOptions, event: DragEvent): HTMLElement | null {
  const currentTarget = event.currentTarget;
  if (currentTarget instanceof HTMLElement) {
    return currentTarget;
  }

  const resolved = toValue(options.ref);
  return resolved ?? null;
}

function resolveRelativePoint(options: DropOptions, event: DragEvent): { x: number; y: number } {
  const element = resolveElement(options, event);
  if (!element) {
    return { x: event.clientX, y: event.clientY };
  }

  const rect = element.getBoundingClientRect();
  return {
    x: event.clientX - rect.x,
    y: event.clientY - rect.y,
  };
}

function getTargetElement(options: DropOptions, event: DragEvent): EventTarget | null {
  if (event.target != null) {
    return event.target;
  }

  return resolveElement(options, event);
}

function isDisabled(options: DropOptions): boolean {
  return options.isDisabled ? Boolean(toValue(options.isDisabled)) : false;
}

function allowedOperationsToArray(bits: DropOperationBits): DropOperation[] {
  const operations: DropOperation[] = [];

  if ((bits & DROP_OPERATION.move) !== 0) {
    operations.push("move");
  }
  if ((bits & DROP_OPERATION.copy) !== 0) {
    operations.push("copy");
  }
  if ((bits & DROP_OPERATION.link) !== 0) {
    operations.push("link");
  }

  return operations;
}

function isMac(): boolean {
  if (typeof navigator === "undefined") {
    return false;
  }

  const platform = navigator.platform ?? "";
  return /mac/i.test(platform);
}

function isIPad(): boolean {
  if (typeof navigator === "undefined") {
    return false;
  }

  if (/ipad/i.test(navigator.userAgent)) {
    return true;
  }

  return /mac/i.test(navigator.platform) && navigator.maxTouchPoints > 1;
}

function getAllowedOperations(event: DragEvent): DropOperationBits {
  const effectAllowed = event.dataTransfer?.effectAllowed ?? "all";
  let allowedOperations =
    DROP_OPERATION_ALLOWED[effectAllowed as keyof typeof DROP_OPERATION_ALLOWED];
  if (typeof allowedOperations !== "number") {
    allowedOperations = DROP_OPERATION.all;
  }

  if (globalAllowedDropOperations) {
    allowedOperations &= globalAllowedDropOperations;
  }

  let allowedModifiers = DROP_OPERATION.none;
  if (isMac()) {
    if (event.altKey) {
      allowedModifiers |= DROP_OPERATION.copy;
    }
    if (event.ctrlKey && !isIPad()) {
      allowedModifiers |= DROP_OPERATION.link;
    }
    if (event.metaKey) {
      allowedModifiers |= DROP_OPERATION.move;
    }
  } else {
    if (event.altKey) {
      allowedModifiers |= DROP_OPERATION.link;
    }
    if (event.shiftKey) {
      allowedModifiers |= DROP_OPERATION.move;
    }
    if (event.ctrlKey) {
      allowedModifiers |= DROP_OPERATION.copy;
    }
  }

  if (allowedModifiers) {
    return allowedOperations & allowedModifiers;
  }

  return allowedOperations;
}

function getDropOperation(
  allowedOperations: DropOperationBits,
  requestedOperation: DropOperation
): DropOperation {
  const requestedMask = DROP_OPERATION[requestedOperation] ?? DROP_OPERATION.none;
  if ((allowedOperations & requestedMask) !== 0) {
    return requestedOperation;
  }

  return "cancel";
}

function resolveDropOperation(dropEffect: string | undefined): DropOperation {
  if (!dropEffect) {
    return "cancel";
  }

  if (dropEffect in DROP_EFFECT_TO_DROP_OPERATION) {
    return DROP_EFFECT_TO_DROP_OPERATION[dropEffect as keyof typeof DROP_EFFECT_TO_DROP_OPERATION];
  }

  return "cancel";
}

function normalizeDragTypes(types: Set<string> | IDragTypes): IDragTypes {
  if (!(types instanceof Set)) {
    return types;
  }

  return {
    has(type: string | symbol) {
      return typeof type === "string" && types.has(type);
    },
  };
}

export function useDrop(options: DropOptions): DropResult {
  const isDropTarget = ref(false);

  const state = {
    x: 0,
    y: 0,
    dragOverElements: new Set<EventTarget>(),
    dropEffect: "none" as DataTransfer["dropEffect"],
    allowedOperations: DROP_OPERATION.all as DropOperationBits,
    dropActivateTimer: null as ReturnType<typeof setTimeout> | null,
  };

  const clearDropActivateTimer = () => {
    if (state.dropActivateTimer != null) {
      clearTimeout(state.dropActivateTimer);
      state.dropActivateTimer = null;
    }
  };

  const fireDropEnter = (event: DragEvent) => {
    isDropTarget.value = true;
    const point = resolveRelativePoint(options, event);
    options.onDropEnter?.({
      type: "dropenter",
      x: point.x,
      y: point.y,
    });
  };

  const fireDropExit = (event: DragEvent) => {
    isDropTarget.value = false;
    const point = resolveRelativePoint(options, event);
    options.onDropExit?.({
      type: "dropexit",
      x: point.x,
      y: point.y,
    });
  };

  const onDragenter = (event: DragEvent) => {
    if (isDisabled(options)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const targetElement = getTargetElement(options, event);
    if (targetElement) {
      state.dragOverElements.add(targetElement);
    }
    if (state.dragOverElements.size > 1) {
      return;
    }

    const allowedOperationsBits = getAllowedOperations(event);
    const allowedOperations = allowedOperationsToArray(allowedOperationsBits);
    let dropOperation = allowedOperations[0] ?? "cancel";

    if (typeof options.getDropOperation === "function" && event.dataTransfer) {
      const types = new DragTypes(event.dataTransfer);
      dropOperation = getDropOperation(
        allowedOperationsBits,
        options.getDropOperation(types, allowedOperations)
      );
    }

    if (typeof options.getDropOperationForPoint === "function" && event.dataTransfer) {
      const types = new DragTypes(event.dataTransfer);
      const point = resolveRelativePoint(options, event);
      dropOperation = getDropOperation(
        allowedOperationsBits,
        options.getDropOperationForPoint(types, allowedOperations, point.x, point.y)
      );
    }

    state.x = event.clientX;
    state.y = event.clientY;
    state.allowedOperations = allowedOperationsBits;
    state.dropEffect = DROP_OPERATION_TO_DROP_EFFECT[dropOperation] ?? "none";

    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = state.dropEffect;
    }

    if (dropOperation !== "cancel") {
      fireDropEnter(event);
    }
  };

  const onDragover = (event: DragEvent) => {
    if (isDisabled(options)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const allowedOperations = getAllowedOperations(event);
    if (
      event.clientX === state.x &&
      event.clientY === state.y &&
      allowedOperations === state.allowedOperations
    ) {
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = state.dropEffect;
      }
      return;
    }

    state.x = event.clientX;
    state.y = event.clientY;

    const previousDropEffect = state.dropEffect;

    if (allowedOperations !== state.allowedOperations) {
      const allowedOps = allowedOperationsToArray(allowedOperations);
      let nextOperation = allowedOps[0] ?? "cancel";
      if (typeof options.getDropOperation === "function" && event.dataTransfer) {
        const types = new DragTypes(event.dataTransfer);
        nextOperation = getDropOperation(
          allowedOperations,
          options.getDropOperation(types, allowedOps)
        );
      }
      state.dropEffect = DROP_OPERATION_TO_DROP_EFFECT[nextOperation] ?? "none";
    }

    if (typeof options.getDropOperationForPoint === "function" && event.dataTransfer) {
      const types = new DragTypes(event.dataTransfer);
      const point = resolveRelativePoint(options, event);
      const nextOperation = getDropOperation(
        allowedOperations,
        options.getDropOperationForPoint(
          types,
          allowedOperationsToArray(allowedOperations),
          point.x,
          point.y
        )
      );
      state.dropEffect = DROP_OPERATION_TO_DROP_EFFECT[nextOperation] ?? "none";
    }

    state.allowedOperations = allowedOperations;
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = state.dropEffect;
    }

    if (state.dropEffect === "none" && previousDropEffect !== "none") {
      fireDropExit(event);
    } else if (state.dropEffect !== "none" && previousDropEffect === "none") {
      fireDropEnter(event);
    }

    if (options.onDropMove && state.dropEffect !== "none") {
      const point = resolveRelativePoint(options, event);
      options.onDropMove({
        type: "dropmove",
        x: point.x,
        y: point.y,
      });
    }

    clearDropActivateTimer();

    if (options.onDropActivate && state.dropEffect !== "none") {
      const point = resolveRelativePoint(options, event);
      state.dropActivateTimer = setTimeout(() => {
        options.onDropActivate?.({
          type: "dropactivate",
          x: point.x,
          y: point.y,
        });
      }, DROP_ACTIVATE_TIMEOUT);
    }
  };

  const onDragleave = (event: DragEvent) => {
    if (isDisabled(options)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const targetElement = getTargetElement(options, event);
    if (targetElement) {
      state.dragOverElements.delete(targetElement);
    }

    const container = resolveElement(options, event);
    for (const element of [...state.dragOverElements]) {
      if (
        element instanceof Node &&
        container instanceof Node &&
        !container.contains(element)
      ) {
        state.dragOverElements.delete(element);
      }
    }

    if (state.dragOverElements.size > 0) {
      return;
    }

    if (state.dropEffect !== "none") {
      fireDropExit(event);
    }

    clearDropActivateTimer();
  };

  const onDrop = (event: DragEvent) => {
    if (isDisabled(options)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    setGlobalDropEffect(state.dropEffect);

    if (options.onDrop) {
      const point = resolveRelativePoint(options, event);
      options.onDrop({
        type: "drop",
        x: point.x,
        y: point.y,
        items: readFromDataTransfer(event.dataTransfer),
        dropOperation: resolveDropOperation(state.dropEffect),
      });
    }

    const snapshot = {
      draggingCollectionRef: globalDndState.draggingCollectionRef,
      draggingKeys: new Set<Key>(globalDndState.draggingKeys ?? new Set<Key>()),
      dropCollectionRef: globalDndState.dropCollectionRef ?? null,
    };

    state.dragOverElements.clear();
    if (state.dropEffect !== "none" || isDropTarget.value) {
      fireDropExit(event);
    }
    clearDropActivateTimer();
    state.dropEffect = "none";

    if (snapshot.draggingCollectionRef == null) {
      setGlobalDropEffect(undefined);
    } else {
      setGlobalDnDState(snapshot);
    }
  };

  watchEffect((onCleanup) => {
    const element = toValue(options.ref);
    if (!element || isDisabled(options)) {
      return;
    }

    const unregister = registerDropTarget({
      element,
      getDropOperation(types, allowedOperations) {
        if (typeof options.getDropOperation === "function") {
          return options.getDropOperation(
            normalizeDragTypes(types),
            allowedOperations
          );
        }

        return allowedOperations[0] ?? "cancel";
      },
      onDropEnter(event) {
        isDropTarget.value = true;
        options.onDropEnter?.(event);
      },
      onDropExit(event) {
        isDropTarget.value = false;
        options.onDropExit?.(event);
      },
      onDrop(event) {
        options.onDrop?.(event);
      },
      onDropActivate(event) {
        options.onDropActivate?.(event);
      },
    });

    onCleanup(unregister);
  });

  if (isDisabled(options)) {
    return {
      dropProps: {},
      dropButtonProps: { isDisabled: true },
      isDropTarget,
    };
  }

  const baseDropProps: Record<string, unknown> = {
    onDragenter,
    onDragover,
    onDragleave,
    onDrop,
  };

  const { dropProps: virtualDropProps } = useVirtualDrop();

  if (options.hasDropButton) {
    return {
      dropProps: baseDropProps,
      dropButtonProps: virtualDropProps.value,
      isDropTarget,
    };
  }

  return {
    dropProps: mergeProps(baseDropProps, virtualDropProps.value),
    isDropTarget,
  };
}
