import { disableTextSelection, restoreTextSelection } from "./textSelection";
import { useGlobalListeners } from "@vue-aria/utils";
import { onScopeDispose } from "vue";

export type MovePointerType = "mouse" | "touch" | "keyboard" | "pen";

interface EventBase {
  shiftKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
}

interface MoveModifierBase {
  pointerType: MovePointerType;
  shiftKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
}

export interface MoveStartEvent extends MoveModifierBase {
  type: "movestart";
}

export interface MoveMoveEvent extends MoveModifierBase {
  type: "move";
  deltaX: number;
  deltaY: number;
}

export interface MoveEndEvent extends MoveModifierBase {
  type: "moveend";
}

export interface MoveEvents {
  onMoveStart?: (event: MoveStartEvent) => void;
  onMove?: (event: MoveMoveEvent) => void;
  onMoveEnd?: (event: MoveEndEvent) => void;
}

export interface MoveResult {
  moveProps: Record<string, unknown>;
}

export function useMove(props: MoveEvents): MoveResult {
  const { onMoveStart, onMove, onMoveEnd } = props;
  const state = {
    didMove: false,
    lastPosition: null as { pageX: number; pageY: number } | null,
    id: null as number | null,
  };

  const { addGlobalListener, removeGlobalListener, removeAllGlobalListeners } = useGlobalListeners();

  const move = (
    originalEvent: EventBase,
    pointerType: MovePointerType,
    deltaX: number,
    deltaY: number
  ) => {
    if (deltaX === 0 && deltaY === 0) {
      return;
    }

    if (!state.didMove) {
      state.didMove = true;
      onMoveStart?.({
        type: "movestart",
        pointerType,
        shiftKey: originalEvent.shiftKey,
        metaKey: originalEvent.metaKey,
        ctrlKey: originalEvent.ctrlKey,
        altKey: originalEvent.altKey,
      });
    }

    onMove?.({
      type: "move",
      pointerType,
      deltaX,
      deltaY,
      shiftKey: originalEvent.shiftKey,
      metaKey: originalEvent.metaKey,
      ctrlKey: originalEvent.ctrlKey,
      altKey: originalEvent.altKey,
    });
  };

  const end = (originalEvent: EventBase, pointerType: MovePointerType) => {
    restoreTextSelection();
    if (state.didMove) {
      onMoveEnd?.({
        type: "moveend",
        pointerType,
        shiftKey: originalEvent.shiftKey,
        metaKey: originalEvent.metaKey,
        ctrlKey: originalEvent.ctrlKey,
        altKey: originalEvent.altKey,
      });
    }
  };

  const start = () => {
    disableTextSelection();
    state.didMove = false;
  };

  const cleanup = () => {
    state.id = null;
    removeAllGlobalListeners();
  };

  onScopeDispose(cleanup);

  const moveProps: Record<string, unknown> = {};

  if (typeof PointerEvent === "undefined") {
    moveProps.onMousedown = (event: MouseEvent) => {
      if (event.button !== 0) {
        return;
      }

      start();
      event.stopPropagation();
      event.preventDefault();
      state.lastPosition = { pageX: event.pageX, pageY: event.pageY };

      const onMouseMove = (moveEvent: MouseEvent) => {
        if (moveEvent.button !== 0) {
          return;
        }

        move(
          moveEvent,
          "mouse",
          moveEvent.pageX - (state.lastPosition?.pageX ?? 0),
          moveEvent.pageY - (state.lastPosition?.pageY ?? 0)
        );
        state.lastPosition = { pageX: moveEvent.pageX, pageY: moveEvent.pageY };
      };

      const onMouseUp = (upEvent: MouseEvent) => {
        if (upEvent.button !== 0) {
          return;
        }

        end(upEvent, "mouse");
        removeGlobalListener(window, "mousemove", onMouseMove as EventListener, false);
        removeGlobalListener(window, "mouseup", onMouseUp as EventListener, false);
      };

      addGlobalListener(window, "mousemove", onMouseMove as EventListener, false);
      addGlobalListener(window, "mouseup", onMouseUp as EventListener, false);
    };

    moveProps.onTouchstart = (event: TouchEvent) => {
      if (event.changedTouches.length === 0 || state.id != null) {
        return;
      }

      const { pageX, pageY, identifier } = event.changedTouches[0];
      start();
      event.stopPropagation();
      event.preventDefault();
      state.lastPosition = { pageX, pageY };
      state.id = identifier;

      const onTouchMove = (moveEvent: TouchEvent) => {
        const touchIndex = Array.from(moveEvent.changedTouches).findIndex(
          ({ identifier: touchId }) => touchId === state.id
        );

        if (touchIndex < 0) {
          return;
        }

        const { pageX: nextPageX, pageY: nextPageY } = moveEvent.changedTouches[touchIndex];
        move(
          moveEvent,
          "touch",
          nextPageX - (state.lastPosition?.pageX ?? 0),
          nextPageY - (state.lastPosition?.pageY ?? 0)
        );
        state.lastPosition = { pageX: nextPageX, pageY: nextPageY };
      };

      const onTouchEnd = (endEvent: TouchEvent) => {
        const touchIndex = Array.from(endEvent.changedTouches).findIndex(
          ({ identifier: touchId }) => touchId === state.id
        );

        if (touchIndex < 0) {
          return;
        }

        end(endEvent, "touch");
        state.id = null;
        removeGlobalListener(window, "touchmove", onTouchMove as EventListener, false);
        removeGlobalListener(window, "touchend", onTouchEnd as EventListener, false);
        removeGlobalListener(window, "touchcancel", onTouchEnd as EventListener, false);
      };

      addGlobalListener(window, "touchmove", onTouchMove as EventListener, false);
      addGlobalListener(window, "touchend", onTouchEnd as EventListener, false);
      addGlobalListener(window, "touchcancel", onTouchEnd as EventListener, false);
    };
  } else {
    moveProps.onPointerdown = (event: PointerEvent) => {
      if (event.button !== 0 || state.id != null) {
        return;
      }

      start();
      event.stopPropagation();
      event.preventDefault();
      state.lastPosition = { pageX: event.pageX, pageY: event.pageY };
      state.id = event.pointerId;

      const onPointerMove = (moveEvent: PointerEvent) => {
        if (moveEvent.pointerId !== state.id) {
          return;
        }

        const pointerType = (moveEvent.pointerType || "mouse") as MovePointerType;
        move(
          moveEvent,
          pointerType,
          moveEvent.pageX - (state.lastPosition?.pageX ?? 0),
          moveEvent.pageY - (state.lastPosition?.pageY ?? 0)
        );
        state.lastPosition = { pageX: moveEvent.pageX, pageY: moveEvent.pageY };
      };

      const onPointerUp = (upEvent: PointerEvent) => {
        if (upEvent.pointerId !== state.id) {
          return;
        }

        const pointerType = (upEvent.pointerType || "mouse") as MovePointerType;
        end(upEvent, pointerType);
        state.id = null;
        removeGlobalListener(window, "pointermove", onPointerMove as EventListener, false);
        removeGlobalListener(window, "pointerup", onPointerUp as EventListener, false);
        removeGlobalListener(window, "pointercancel", onPointerUp as EventListener, false);
      };

      addGlobalListener(window, "pointermove", onPointerMove as EventListener, false);
      addGlobalListener(window, "pointerup", onPointerUp as EventListener, false);
      addGlobalListener(window, "pointercancel", onPointerUp as EventListener, false);
    };
  }

  const triggerKeyboardMove = (event: KeyboardEvent, deltaX: number, deltaY: number) => {
    start();
    move(event, "keyboard", deltaX, deltaY);
    end(event, "keyboard");
  };

  moveProps.onKeydown = (event: KeyboardEvent) => {
    switch (event.key) {
      case "Left":
      case "ArrowLeft":
        event.preventDefault();
        event.stopPropagation();
        triggerKeyboardMove(event, -1, 0);
        break;
      case "Right":
      case "ArrowRight":
        event.preventDefault();
        event.stopPropagation();
        triggerKeyboardMove(event, 1, 0);
        break;
      case "Up":
      case "ArrowUp":
        event.preventDefault();
        event.stopPropagation();
        triggerKeyboardMove(event, 0, -1);
        break;
      case "Down":
      case "ArrowDown":
        event.preventDefault();
        event.stopPropagation();
        triggerKeyboardMove(event, 0, 1);
        break;
      default:
        break;
    }
  };

  return { moveProps };
}
