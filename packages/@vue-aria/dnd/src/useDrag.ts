import { computed, getCurrentScope, onScopeDispose, ref, toValue } from "vue";
import { useDescription } from "@vue-aria/utils";
import {
  DROP_EFFECT_TO_DROP_OPERATION,
  DROP_OPERATION,
  EFFECT_ALLOWED,
} from "./constants";
import { beginDragging } from "./DragManager";
import {
  getDragModality,
  globalDropEffect,
  setDragModality,
  setGlobalAllowedDropOperations,
  setGlobalDropEffect,
  writeToDataTransfer,
} from "./utils";
import type { MaybeReactive, ReadonlyRef } from "@vue-aria/types";
import type { DragItem, DropOperation } from "./types";
import type { DragPreviewRenderer } from "./DragPreview";

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
  preview?: DragPreviewRenderer | null;
  getAllowedDropOperations?: () => DropOperation[];
  hasDragButton?: boolean;
  isDisabled?: MaybeReactive<boolean>;
}

export interface DragResult {
  dragProps: Record<string, unknown>;
  dragButtonProps: Record<string, unknown>;
  isDragging: ReadonlyRef<boolean>;
}

const DRAG_DESCRIPTION_START = {
  keyboard: "Press Enter to start dragging.",
  touch: "Double tap to start dragging.",
  virtual: "Click to start dragging.",
} as const;

const DRAG_DESCRIPTION_END = {
  keyboard: "Dragging. Press Enter to cancel drag.",
  touch: "Dragging. Double tap to cancel drag.",
  virtual: "Dragging. Click to cancel drag.",
} as const;

function resolveDropOperation(effect: string | undefined): DropOperation {
  if (!effect) {
    return "cancel";
  }

  if (effect in DROP_EFFECT_TO_DROP_OPERATION) {
    return DROP_EFFECT_TO_DROP_OPERATION[effect as keyof typeof DROP_EFFECT_TO_DROP_OPERATION];
  }

  return "cancel";
}

function setDragPreviewImage(
  event: DragEvent,
  dataTransfer: DataTransfer,
  previewRenderer: DragPreviewRenderer,
  items: DragItem[]
): void {
  previewRenderer(items, (node, userX, userY) => {
    if (!node) {
      return;
    }

    const size = node.getBoundingClientRect();
    const currentTarget =
      event.currentTarget instanceof HTMLElement
        ? event.currentTarget
        : event.target instanceof HTMLElement
          ? event.target
          : null;
    const rect = currentTarget?.getBoundingClientRect() ?? size;

    let offsetX = event.clientX - rect.x;
    let offsetY = event.clientY - rect.y;
    if (
      offsetX > size.width ||
      offsetY > size.height ||
      offsetX < 0 ||
      offsetY < 0
    ) {
      offsetX = size.width / 2;
      offsetY = size.height / 2;
    }

    if (typeof userX === "number" && typeof userY === "number") {
      offsetX = userX;
      offsetY = userY;
    }

    offsetX = Math.max(0, Math.min(offsetX, size.width));
    offsetY = Math.max(0, Math.min(offsetY, size.height));
    const height = 2 * Math.round(size.height / 2);
    node.style.height = `${height}px`;

    dataTransfer.setDragImage(node, offsetX, offsetY);
  });
}

function isVirtualPointerEvent(event: PointerEvent): boolean {
  if (event.width < 1 && event.height < 1) {
    return true;
  }

  return event.pointerType === "mouse" && event.detail === 0;
}

function isVirtualClick(event: MouseEvent): boolean {
  return event.detail === 0;
}

function pointerTypeToModality(pointerType: string): "touch" | "virtual" {
  if (pointerType === "touch") {
    return "touch";
  }

  return "virtual";
}

export function useDrag(options: DragOptions): DragResult {
  const isDragging = ref(false);
  const draggingElement = ref<Element | null>(null);
  let lastX = 0;
  let lastY = 0;
  let modalityOnPointerDown: "touch" | "virtual" | null = null;

  const isDisabled = (): boolean =>
    options.isDisabled ? Boolean(toValue(options.isDisabled)) : false;

  const description = computed(() => {
    const modality = getDragModality();
    return isDragging.value
      ? DRAG_DESCRIPTION_END[modality]
      : DRAG_DESCRIPTION_START[modality];
  });
  const { descriptionProps } = useDescription(description);

  const setDragging = (element: Element | null): void => {
    draggingElement.value = element;
    isDragging.value = element != null;
  };

  const resolveTarget = (target: EventTarget | null): HTMLElement | null =>
    target instanceof HTMLElement ? target : null;

  const getAllowedDropOperations = (): DropOperation[] =>
    typeof options.getAllowedDropOperations === "function"
      ? options.getAllowedDropOperations()
      : ["move", "copy", "link"];

  const startVirtualDragging = (target: HTMLElement) => {
    const rect = target.getBoundingClientRect();
    const x = rect.x + rect.width / 2;
    const y = rect.y + rect.height / 2;

    options.onDragStart?.({
      type: "dragstart",
      x,
      y,
    });

    beginDragging({
      dragTarget: {
        element: target,
        items: options.getItems(),
        allowedDropOperations: getAllowedDropOperations(),
        onDragEnd(event) {
          setDragging(null);
          options.onDragEnd?.(event);
          setGlobalAllowedDropOperations(DROP_OPERATION.none);
          setGlobalDropEffect(undefined);
        },
      },
    });

    setDragging(target);
  };

  const onDragstart = (event: DragEvent) => {
    if (isDisabled()) {
      event.preventDefault();
      return;
    }

    if (event.defaultPrevented) {
      return;
    }

    event.stopPropagation();

    const target = resolveTarget(event.target);
    if (modalityOnPointerDown === "virtual" && target) {
      event.preventDefault();
      setDragModality("virtual");
      startVirtualDragging(target);
      modalityOnPointerDown = null;
      return;
    }

    setDragModality(modalityOnPointerDown ?? "virtual");
    modalityOnPointerDown = null;

    lastX = event.clientX;
    lastY = event.clientY;
    options.onDragStart?.({
      type: "dragstart",
      x: event.clientX,
      y: event.clientY,
    });

    const dataTransfer = event.dataTransfer;
    if (dataTransfer) {
      dataTransfer.clearData?.();
      const items = options.getItems();
      writeToDataTransfer(dataTransfer, items);

      let allowed = DROP_OPERATION.all;
      if (typeof options.getAllowedDropOperations === "function") {
        allowed = DROP_OPERATION.none;
        for (const operation of options.getAllowedDropOperations()) {
          allowed |= DROP_OPERATION[operation] ?? DROP_OPERATION.none;
        }
      }

      setGlobalAllowedDropOperations(allowed);
      const effectAllowed = EFFECT_ALLOWED[allowed] ?? "none";
      dataTransfer.effectAllowed = effectAllowed === "cancel" ? "none" : effectAllowed;

      if (typeof options.preview === "function") {
        setDragPreviewImage(event, dataTransfer, options.preview, items);
      }
    }

    const eventTarget =
      resolveTarget(event.target) ??
      resolveTarget(event.currentTarget) ??
      (typeof document !== "undefined" ? document.body : null);
    setDragging(eventTarget);
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

    options.onDragEnd?.({
      type: "dragend",
      x: event.clientX,
      y: event.clientY,
      dropOperation: resolveDropOperation(globalDropEffect ?? event.dataTransfer?.dropEffect),
    });

    setDragging(null);
    setGlobalAllowedDropOperations(DROP_OPERATION.none);
    setGlobalDropEffect(undefined);
  };

  if (getCurrentScope()) {
    onScopeDispose(() => {
      if (draggingElement.value && !draggingElement.value.isConnected) {
        options.onDragEnd?.({
          type: "dragend",
          x: 0,
          y: 0,
          dropOperation: resolveDropOperation(globalDropEffect),
        });
      }

      setDragging(null);
      setGlobalAllowedDropOperations(DROP_OPERATION.none);
      setGlobalDropEffect(undefined);
    });
  }

  const attachDescription = (props: Record<string, unknown>) => {
    Object.defineProperty(props, "aria-describedby", {
      configurable: true,
      enumerable: true,
      get: () => descriptionProps.value["aria-describedby"],
    });
  };

  const onPointerdown = (event: PointerEvent) => {
    if (isVirtualPointerEvent(event)) {
      modalityOnPointerDown = "virtual";
      setDragModality("virtual");
      return;
    }

    if (event.width < 1 && event.height < 1) {
      modalityOnPointerDown = "virtual";
      setDragModality("virtual");
      return;
    }

    const currentTarget = resolveTarget(event.currentTarget);
    if (currentTarget) {
      const rect = currentTarget.getBoundingClientRect();
      const offsetX = event.clientX - rect.x;
      const offsetY = event.clientY - rect.y;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      if (Math.abs(offsetX - centerX) <= 0.5 && Math.abs(offsetY - centerY) <= 0.5) {
        modalityOnPointerDown = "virtual";
        setDragModality("virtual");
        return;
      }
    }

    modalityOnPointerDown = pointerTypeToModality(event.pointerType);
    setDragModality(modalityOnPointerDown);
  };

  const onKeydownCapture = (event: KeyboardEvent) => {
    if (event.target !== event.currentTarget || event.key !== "Enter") {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
  };

  const onKeyupCapture = (event: KeyboardEvent) => {
    if (event.target !== event.currentTarget || event.key !== "Enter") {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    const target = resolveTarget(event.target);
    if (!target || isDisabled()) {
      return;
    }

    setDragModality("keyboard");
    startVirtualDragging(target);
  };

  const onClick = (event: MouseEvent) => {
    const target = resolveTarget(event.target);
    if (!target || isDisabled()) {
      return;
    }

    if (isVirtualClick(event) || modalityOnPointerDown === "virtual") {
      event.preventDefault();
      event.stopPropagation();
      setDragModality("virtual");
      startVirtualDragging(target);
      modalityOnPointerDown = null;
    }
  };

  const dragInteractionProps: Record<string, unknown> = {
    draggable: !isDisabled(),
    onDragstart,
    onDrag,
    onDragend,
  };

  if (!options.hasDragButton) {
    attachDescription(dragInteractionProps);
    dragInteractionProps.onPointerdown = onPointerdown;
    dragInteractionProps.onKeydownCapture = onKeydownCapture;
    dragInteractionProps.onKeyupCapture = onKeyupCapture;
    dragInteractionProps.onClick = onClick;
  }

  if (options.hasDragButton) {
    const dragButtonProps: Record<string, unknown> = {
      ...dragInteractionProps,
      onKeydownCapture,
      onKeyupCapture,
      onClick,
    };
    attachDescription(dragButtonProps);
    return {
      dragProps: {},
      dragButtonProps,
      isDragging,
    };
  }

  return {
    dragProps: dragInteractionProps,
    dragButtonProps: {},
    isDragging,
  };
}
