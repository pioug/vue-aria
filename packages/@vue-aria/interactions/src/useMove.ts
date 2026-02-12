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

function resolvePointerPosition(event: PointerEvent): Position {
  const pageX = event.pageX;
  const pageY = event.pageY;
  if (
    Number.isFinite(pageX) &&
    Number.isFinite(pageY) &&
    !(pageX === 0 && pageY === 0 && (event.clientX !== 0 || event.clientY !== 0))
  ) {
    return { pageX, pageY };
  }

  return {
    pageX: event.clientX,
    pageY: event.clientY,
  };
}

function resolveMousePosition(event: MouseEvent): Position {
  const pageX = event.pageX;
  const pageY = event.pageY;
  if (
    Number.isFinite(pageX) &&
    Number.isFinite(pageY) &&
    !(pageX === 0 && pageY === 0 && (event.clientX !== 0 || event.clientY !== 0))
  ) {
    return { pageX, pageY };
  }

  return {
    pageX: event.clientX,
    pageY: event.clientY,
  };
}

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
  const hasPointerEvents = typeof PointerEvent !== "undefined";
  const state = {
    didMove: false,
    pointerId: null as number | null,
    pointerType: null as PointerType | null,
    lastPosition: null as Position | null,
  };

  let removePointerMoveListener: (() => void) | null = null;
  let removePointerUpListener: (() => void) | null = null;
  let removePointerCancelListener: (() => void) | null = null;
  let removeMouseMoveListener: (() => void) | null = null;
  let removeMouseUpListener: (() => void) | null = null;
  let removeTouchMoveListener: (() => void) | null = null;
  let removeTouchEndListener: (() => void) | null = null;
  let removeTouchCancelListener: (() => void) | null = null;

  const clearGlobalListeners = () => {
    removePointerMoveListener?.();
    removePointerMoveListener = null;
    removePointerUpListener?.();
    removePointerUpListener = null;
    removePointerCancelListener?.();
    removePointerCancelListener = null;
    removeMouseMoveListener?.();
    removeMouseMoveListener = null;
    removeMouseUpListener?.();
    removeMouseUpListener = null;
    removeTouchMoveListener?.();
    removeTouchMoveListener = null;
    removeTouchEndListener?.();
    removeTouchEndListener = null;
    removeTouchCancelListener?.();
    removeTouchCancelListener = null;
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

    const position = resolvePointerPosition(event);
    const lastPosition = state.lastPosition ?? position;
    const deltaX = position.pageX - lastPosition.pageX;
    const deltaY = position.pageY - lastPosition.pageY;
    move(event, state.pointerType ?? toPointerType(event), deltaX, deltaY);
    state.lastPosition = position;
  };

  const onPointerEnd = (event: PointerEvent) => {
    if (state.pointerId == null || event.pointerId !== state.pointerId) {
      return;
    }
    end(event, state.pointerType ?? toPointerType(event));
  };

  const onMouseMove = (event: MouseEvent) => {
    if (state.pointerId !== -1) {
      return;
    }

    const position = resolveMousePosition(event);
    const lastPosition = state.lastPosition ?? position;
    const deltaX = position.pageX - lastPosition.pageX;
    const deltaY = position.pageY - lastPosition.pageY;
    move(event, "mouse", deltaX, deltaY);
    state.lastPosition = position;
  };

  const onMouseEnd = (event: MouseEvent) => {
    if (state.pointerId !== -1) {
      return;
    }
    end(event, "mouse");
  };

  const findTrackedTouch = (
    touches: TouchList | ArrayLike<Touch>
  ): Touch | undefined => {
    if (state.pointerId == null || state.pointerType !== "touch") {
      return undefined;
    }

    for (let index = 0; index < touches.length; index += 1) {
      const touch = touches[index];
      if (touch && touch.identifier === state.pointerId) {
        return touch;
      }
    }
    return undefined;
  };

  const onTouchMove = (event: TouchEvent) => {
    const touch = findTrackedTouch(event.changedTouches);
    if (!touch) {
      return;
    }

    const position: Position = { pageX: touch.pageX, pageY: touch.pageY };
    const lastPosition = state.lastPosition ?? position;
    const deltaX = position.pageX - lastPosition.pageX;
    const deltaY = position.pageY - lastPosition.pageY;
    move(event, "touch", deltaX, deltaY);
    state.lastPosition = position;
  };

  const onTouchEnd = (event: TouchEvent) => {
    const touch = findTrackedTouch(event.changedTouches);
    if (!touch) {
      return;
    }
    end(event, "touch");
  };

  const attachPointerListeners = () => {
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

  const attachMouseListeners = () => {
    if (typeof window === "undefined") {
      return;
    }

    window.addEventListener("mousemove", onMouseMove, false);
    removeMouseMoveListener = () =>
      window.removeEventListener("mousemove", onMouseMove, false);
    window.addEventListener("mouseup", onMouseEnd, false);
    removeMouseUpListener = () =>
      window.removeEventListener("mouseup", onMouseEnd, false);
  };

  const attachTouchListeners = () => {
    if (typeof window === "undefined") {
      return;
    }

    window.addEventListener("touchmove", onTouchMove, false);
    removeTouchMoveListener = () =>
      window.removeEventListener("touchmove", onTouchMove, false);
    window.addEventListener("touchend", onTouchEnd, false);
    removeTouchEndListener = () =>
      window.removeEventListener("touchend", onTouchEnd, false);
    window.addEventListener("touchcancel", onTouchEnd, false);
    removeTouchCancelListener = () =>
      window.removeEventListener("touchcancel", onTouchEnd, false);
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
    state.lastPosition = resolvePointerPosition(event);
    attachPointerListeners();
  };

  const onMousedown = (event: MouseEvent) => {
    if (event.button !== 0 || state.pointerId != null) {
      return;
    }

    event.stopPropagation();
    event.preventDefault();

    state.didMove = false;
    state.pointerId = -1;
    state.pointerType = "mouse";
    state.lastPosition = resolveMousePosition(event);
    attachMouseListeners();
  };

  const onTouchstart = (event: TouchEvent) => {
    if (state.pointerId != null) {
      return;
    }

    const touch = event.changedTouches[0];
    if (!touch) {
      return;
    }

    state.didMove = false;
    state.pointerId = touch.identifier;
    state.pointerType = "touch";
    state.lastPosition = {
      pageX: touch.pageX,
      pageY: touch.pageY,
    };
    attachTouchListeners();
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
    moveProps: hasPointerEvents
      ? {
          onPointerdown,
          onKeydown,
        }
      : {
          onMousedown,
          onTouchstart,
          onKeydown,
        },
  };
}
