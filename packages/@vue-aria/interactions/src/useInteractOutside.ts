import { getOwnerDocument, nodeContains } from "@vue-aria/utils";
import { onScopeDispose } from "vue";

export interface InteractOutsideProps {
  ref: { current: Element | null };
  onInteractOutside?: (event: MouseEvent | PointerEvent | TouchEvent) => void;
  onInteractOutsideStart?: (event: MouseEvent | PointerEvent | TouchEvent) => void;
  isDisabled?: boolean;
}

export function useInteractOutside(props: InteractOutsideProps): void {
  const { ref, onInteractOutside, onInteractOutsideStart, isDisabled } = props;
  const state = {
    isPointerDown: false,
    ignoreEmulatedMouseEvents: false,
  };

  if (isDisabled) {
    return;
  }

  const element = ref.current;
  const documentObject = getOwnerDocument(element);

  const onPointerDown = (event: MouseEvent | PointerEvent | TouchEvent) => {
    if (onInteractOutside && isValidEvent(event, ref)) {
      onInteractOutsideStart?.(event);
      state.isPointerDown = true;
    }
  };

  const triggerInteractOutside = (event: MouseEvent | PointerEvent | TouchEvent) => {
    onInteractOutside?.(event);
  };

  if (typeof PointerEvent !== "undefined") {
    const onClick = (event: MouseEvent) => {
      if (state.isPointerDown && isValidEvent(event, ref)) {
        triggerInteractOutside(event);
      }

      state.isPointerDown = false;
    };

    documentObject.addEventListener("pointerdown", onPointerDown as EventListener, true);
    documentObject.addEventListener("click", onClick, true);

    onScopeDispose(() => {
      documentObject.removeEventListener("pointerdown", onPointerDown as EventListener, true);
      documentObject.removeEventListener("click", onClick, true);
    });

    return;
  }

  const onMouseUp = (event: MouseEvent) => {
    if (state.ignoreEmulatedMouseEvents) {
      state.ignoreEmulatedMouseEvents = false;
    } else if (state.isPointerDown && isValidEvent(event, ref)) {
      triggerInteractOutside(event);
    }

    state.isPointerDown = false;
  };

  const onTouchEnd = (event: TouchEvent) => {
    state.ignoreEmulatedMouseEvents = true;
    if (state.isPointerDown && isValidEvent(event, ref)) {
      triggerInteractOutside(event);
    }

    state.isPointerDown = false;
  };

  documentObject.addEventListener("mousedown", onPointerDown as EventListener, true);
  documentObject.addEventListener("mouseup", onMouseUp, true);
  documentObject.addEventListener("touchstart", onPointerDown as EventListener, true);
  documentObject.addEventListener("touchend", onTouchEnd, true);

  onScopeDispose(() => {
    documentObject.removeEventListener("mousedown", onPointerDown as EventListener, true);
    documentObject.removeEventListener("mouseup", onMouseUp, true);
    documentObject.removeEventListener("touchstart", onPointerDown as EventListener, true);
    documentObject.removeEventListener("touchend", onTouchEnd, true);
  });
}

function isValidEvent(
  event: MouseEvent | PointerEvent | TouchEvent,
  ref: { current: Element | null }
): boolean {
  if ("button" in event && event.button > 0) {
    return false;
  }

  if (event.target) {
    const ownerDocument = (event.target as Element).ownerDocument;
    if (!ownerDocument || !nodeContains(ownerDocument.documentElement, event.target as Node)) {
      return false;
    }

    if ((event.target as Element).closest("[data-react-aria-top-layer]")) {
      return false;
    }
  }

  if (!ref.current) {
    return false;
  }

  if (typeof (event as Event).composedPath === "function") {
    return !(event as Event).composedPath().includes(ref.current);
  }

  return !nodeContains(ref.current, event.target as Node | null);
}
