import { getCurrentScope, onScopeDispose } from "vue";
import type { MoveEvent, PointerType } from "@vue-aria/types";

export interface UseMoveOptions {
  onMoveStart?: (event: MoveEvent) => void;
  onMove?: (event: MoveEvent) => void;
  onMoveEnd?: (event: MoveEvent) => void;
}

export interface UseMoveResult {
  moveProps: Record<string, unknown>;
}

interface Position {
  pageX: number;
  pageY: number;
}

const ARROW_KEY_TO_DELTA: Record<string, { deltaX: number; deltaY: number }> = {
  ArrowLeft: { deltaX: -1, deltaY: 0 },
  Left: { deltaX: -1, deltaY: 0 },
  ArrowRight: { deltaX: 1, deltaY: 0 },
  Right: { deltaX: 1, deltaY: 0 },
  ArrowUp: { deltaX: 0, deltaY: -1 },
  Up: { deltaX: 0, deltaY: -1 },
  ArrowDown: { deltaX: 0, deltaY: 1 },
  Down: { deltaX: 0, deltaY: 1 },
};

function toPointerType(event: PointerEvent): PointerType {
  if (event.pointerType === "touch") {
    return "touch";
  }
  if (event.pointerType === "pen") {
    return "pen";
  }
  return "mouse";
}

function createMoveEvent(
  type: MoveEvent["type"],
  originalEvent: Event,
  pointerType: PointerType,
  deltaX = 0,
  deltaY = 0
): MoveEvent {
  const keyboardEvent = originalEvent as KeyboardEvent;
  return {
    type,
    pointerType,
    deltaX: type === "move" ? deltaX : undefined,
    deltaY: type === "move" ? deltaY : undefined,
    shiftKey: Boolean(keyboardEvent.shiftKey),
    ctrlKey: Boolean(keyboardEvent.ctrlKey),
    metaKey: Boolean(keyboardEvent.metaKey),
    altKey: Boolean(keyboardEvent.altKey),
    originalEvent,
  };
}

export function useMove(options: UseMoveOptions = {}): UseMoveResult {
  const state = {
    didMove: false,
    pointerId: null as number | null,
    pointerType: null as PointerType | null,
    lastPosition: null as Position | null,
  };

  let removePointerMoveListener: (() => void) | null = null;
  let removePointerUpListener: (() => void) | null = null;
  let removePointerCancelListener: (() => void) | null = null;

  const clearGlobalListeners = () => {
    removePointerMoveListener?.();
    removePointerMoveListener = null;
    removePointerUpListener?.();
    removePointerUpListener = null;
    removePointerCancelListener?.();
    removePointerCancelListener = null;
  };

  const move = (
    originalEvent: Event,
    pointerType: PointerType,
    deltaX: number,
    deltaY: number
  ) => {
    if (deltaX === 0 && deltaY === 0) {
      return;
    }

    if (!state.didMove) {
      state.didMove = true;
      options.onMoveStart?.(
        createMoveEvent("movestart", originalEvent, pointerType, deltaX, deltaY)
      );
    }

    options.onMove?.(createMoveEvent("move", originalEvent, pointerType, deltaX, deltaY));
  };

  const end = (originalEvent: Event, pointerType: PointerType) => {
    if (state.didMove) {
      options.onMoveEnd?.(createMoveEvent("moveend", originalEvent, pointerType));
    }
    state.didMove = false;
    state.pointerId = null;
    state.pointerType = null;
    state.lastPosition = null;
    clearGlobalListeners();
  };

  const onPointerMove = (event: PointerEvent) => {
    if (state.pointerId == null || event.pointerId !== state.pointerId) {
      return;
    }

    const lastPosition = state.lastPosition ?? { pageX: event.pageX, pageY: event.pageY };
    const deltaX = event.pageX - lastPosition.pageX;
    const deltaY = event.pageY - lastPosition.pageY;
    move(event, state.pointerType ?? toPointerType(event), deltaX, deltaY);
    state.lastPosition = { pageX: event.pageX, pageY: event.pageY };
  };

  const onPointerEnd = (event: PointerEvent) => {
    if (state.pointerId == null || event.pointerId !== state.pointerId) {
      return;
    }
    end(event, state.pointerType ?? toPointerType(event));
  };

  const attachGlobalListeners = () => {
    if (typeof window === "undefined") {
      return;
    }

    window.addEventListener("pointermove", onPointerMove, false);
    removePointerMoveListener = () =>
      window.removeEventListener("pointermove", onPointerMove, false);
    window.addEventListener("pointerup", onPointerEnd, false);
    removePointerUpListener = () =>
      window.removeEventListener("pointerup", onPointerEnd, false);
    window.addEventListener("pointercancel", onPointerEnd, false);
    removePointerCancelListener = () =>
      window.removeEventListener("pointercancel", onPointerEnd, false);
  };

  if (getCurrentScope()) {
    onScopeDispose(clearGlobalListeners);
  }

  const onPointerdown = (event: PointerEvent) => {
    if (event.button !== 0 || state.pointerId != null) {
      return;
    }

    event.stopPropagation();
    event.preventDefault();

    state.didMove = false;
    state.pointerId = event.pointerId;
    state.pointerType = toPointerType(event);
    state.lastPosition = { pageX: event.pageX, pageY: event.pageY };
    attachGlobalListeners();
  };

  const onKeydown = (event: KeyboardEvent) => {
    const delta = ARROW_KEY_TO_DELTA[event.key];
    if (!delta) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    options.onMoveStart?.(createMoveEvent("movestart", event, "keyboard"));
    options.onMove?.(
      createMoveEvent("move", event, "keyboard", delta.deltaX, delta.deltaY)
    );
    options.onMoveEnd?.(createMoveEvent("moveend", event, "keyboard"));
  };

  return {
    moveProps: {
      onPointerdown,
      onKeydown,
    },
  };
}
