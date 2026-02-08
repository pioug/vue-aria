import { getCurrentScope, onScopeDispose, toValue, watchEffect } from "vue";
import type { MaybeReactive } from "@vue-aria/types";

export interface UseInteractOutsideOptions {
  ref: MaybeReactive<Element | null | undefined>;
  onInteractOutside?: (event: PointerEvent | MouseEvent | TouchEvent) => void;
  onInteractOutsideStart?: (event: PointerEvent | MouseEvent | TouchEvent) => void;
  isDisabled?: MaybeReactive<boolean>;
}

function isDisabled(options: UseInteractOutsideOptions): boolean {
  return options.isDisabled ? Boolean(toValue(options.isDisabled)) : false;
}

function isValidEvent(
  event: PointerEvent | MouseEvent | TouchEvent,
  target: Element
): boolean {
  const maybeButtonEvent = event as MouseEvent;
  if (typeof maybeButtonEvent.button === "number" && maybeButtonEvent.button > 0) {
    return false;
  }

  const eventTarget = event.target;
  if (eventTarget instanceof Element) {
    const ownerDocument = eventTarget.ownerDocument;
    if (!ownerDocument || !ownerDocument.documentElement.contains(eventTarget)) {
      return false;
    }

    if (eventTarget.closest("[data-react-aria-top-layer]")) {
      return false;
    }
  }

  const path = typeof event.composedPath === "function" ? event.composedPath() : [];
  return !path.includes(target);
}

export function useInteractOutside(options: UseInteractOutsideOptions): void {
  const state = {
    isPointerDown: false,
    ignoreEmulatedMouseEvents: false,
  };

  const setup = () => {
    const target = toValue(options.ref);
    if (!target || isDisabled(options)) {
      return () => {};
    }

    const ownerDocument = target.ownerDocument ?? document;

    if (typeof PointerEvent !== "undefined") {
      const onPointerDown = (event: PointerEvent) => {
        if (isValidEvent(event, target)) {
          options.onInteractOutsideStart?.(event);
          state.isPointerDown = true;
        }
      };

      const onClick = (event: MouseEvent) => {
        if (state.isPointerDown && isValidEvent(event, target)) {
          options.onInteractOutside?.(event);
        }
        state.isPointerDown = false;
      };

      ownerDocument.addEventListener("pointerdown", onPointerDown, true);
      ownerDocument.addEventListener("click", onClick, true);

      return () => {
        ownerDocument.removeEventListener("pointerdown", onPointerDown, true);
        ownerDocument.removeEventListener("click", onClick, true);
      };
    }

    const onMouseDown = (event: MouseEvent) => {
      if (isValidEvent(event, target)) {
        options.onInteractOutsideStart?.(event);
        state.isPointerDown = true;
      }
    };

    const onMouseUp = (event: MouseEvent) => {
      if (state.ignoreEmulatedMouseEvents) {
        state.ignoreEmulatedMouseEvents = false;
      } else if (state.isPointerDown && isValidEvent(event, target)) {
        options.onInteractOutside?.(event);
      }
      state.isPointerDown = false;
    };

    const onTouchStart = (event: TouchEvent) => {
      if (isValidEvent(event, target)) {
        options.onInteractOutsideStart?.(event);
        state.isPointerDown = true;
      }
    };

    const onTouchEnd = (event: TouchEvent) => {
      state.ignoreEmulatedMouseEvents = true;
      if (state.isPointerDown && isValidEvent(event, target)) {
        options.onInteractOutside?.(event);
      }
      state.isPointerDown = false;
    };

    ownerDocument.addEventListener("mousedown", onMouseDown, true);
    ownerDocument.addEventListener("mouseup", onMouseUp, true);
    ownerDocument.addEventListener("touchstart", onTouchStart, true);
    ownerDocument.addEventListener("touchend", onTouchEnd, true);

    return () => {
      ownerDocument.removeEventListener("mousedown", onMouseDown, true);
      ownerDocument.removeEventListener("mouseup", onMouseUp, true);
      ownerDocument.removeEventListener("touchstart", onTouchStart, true);
      ownerDocument.removeEventListener("touchend", onTouchEnd, true);
    };
  };

  if (getCurrentScope()) {
    watchEffect((onCleanup) => {
      const cleanup = setup();
      onCleanup(cleanup);
    });
    return;
  }

  const cleanup = setup();
  // Best effort cleanup when no Vue effect scope exists.
  if (typeof window !== "undefined") {
    window.addEventListener("beforeunload", cleanup, { once: true });
  }
  if (getCurrentScope()) {
    onScopeDispose(cleanup);
  }
}
