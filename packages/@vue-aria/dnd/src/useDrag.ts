import { ref, toValue } from "vue";
import { EFFECT_ALLOWED, DROP_EFFECT_TO_DROP_OPERATION, DROP_OPERATION } from "./constants";
import { writeToDataTransfer } from "./utils";
import type { MaybeReactive, ReadonlyRef } from "@vue-aria/types";
import type { DragItem, DropOperation } from "./types";

export interface DragStartEvent {
  type: "dragstart";
  x: number;
  y: number;
}

export interface DragMoveEvent {
  type: "dragmove";
  x: number;
  y: number;
}

export interface DragEndEvent {
  type: "dragend";
  x: number;
  y: number;
  dropOperation: DropOperation;
}

export interface DragOptions {
  onDragStart?: (event: DragStartEvent) => void;
  onDragMove?: (event: DragMoveEvent) => void;
  onDragEnd?: (event: DragEndEvent) => void;
  getItems: () => DragItem[];
  getAllowedDropOperations?: () => DropOperation[];
  hasDragButton?: boolean;
  isDisabled?: MaybeReactive<boolean>;
}

export interface DragResult {
  dragProps: Record<string, unknown>;
  dragButtonProps: Record<string, unknown>;
  isDragging: ReadonlyRef<boolean>;
}

function resolveDropOperation(effect: string | undefined): DropOperation {
  if (!effect) {
    return "cancel";
  }

  if (effect in DROP_EFFECT_TO_DROP_OPERATION) {
    return DROP_EFFECT_TO_DROP_OPERATION[effect as keyof typeof DROP_EFFECT_TO_DROP_OPERATION];
  }

  return "cancel";
}

export function useDrag(options: DragOptions): DragResult {
  const isDragging = ref(false);
  let lastX = 0;
  let lastY = 0;

  const isDisabled = (): boolean =>
    options.isDisabled ? Boolean(toValue(options.isDisabled)) : false;

  const onDragstart = (event: DragEvent) => {
    if (isDisabled()) {
      event.preventDefault();
      return;
    }

    if (event.defaultPrevented) {
      return;
    }

    event.stopPropagation();

    lastX = event.clientX;
    lastY = event.clientY;
    isDragging.value = true;

    const dataTransfer = event.dataTransfer;
    if (dataTransfer) {
      dataTransfer.clearData?.();
      writeToDataTransfer(dataTransfer, options.getItems());

      let allowed = DROP_OPERATION.all;
      if (typeof options.getAllowedDropOperations === "function") {
        allowed = DROP_OPERATION.none;
        for (const operation of options.getAllowedDropOperations()) {
          allowed |= DROP_OPERATION[operation] ?? DROP_OPERATION.none;
        }
      }

      const effectAllowed = EFFECT_ALLOWED[allowed] ?? "none";
      dataTransfer.effectAllowed = effectAllowed === "cancel" ? "none" : effectAllowed;
    }

    options.onDragStart?.({
      type: "dragstart",
      x: event.clientX,
      y: event.clientY,
    });
  };

  const onDrag = (event: DragEvent) => {
    if (!isDragging.value || isDisabled()) {
      return;
    }

    event.stopPropagation();

    if (event.clientX === lastX && event.clientY === lastY) {
      return;
    }

    lastX = event.clientX;
    lastY = event.clientY;

    options.onDragMove?.({
      type: "dragmove",
      x: event.clientX,
      y: event.clientY,
    });
  };

  const onDragend = (event: DragEvent) => {
    if (!isDragging.value) {
      return;
    }

    event.stopPropagation();
    isDragging.value = false;

    options.onDragEnd?.({
      type: "dragend",
      x: event.clientX,
      y: event.clientY,
      dropOperation: resolveDropOperation(event.dataTransfer?.dropEffect),
    });
  };

  const dragInteractionProps: Record<string, unknown> = {
    draggable: !isDisabled(),
    onDragstart,
    onDrag,
    onDragend,
  };

  if (options.hasDragButton) {
    return {
      dragProps: {},
      dragButtonProps: dragInteractionProps,
      isDragging,
    };
  }

  return {
    dragProps: dragInteractionProps,
    dragButtonProps: {},
    isDragging,
  };
}
