import {
  getEventTarget,
  getOwnerWindow,
  isMac,
  isVirtualClick,
  isVirtualPointerEvent,
  nodeContains,
  openLink,
  useGlobalListeners,
} from "@vue-aria/utils";
import { disableTextSelection, restoreTextSelection } from "./textSelection";
import { onScopeDispose } from "vue";

export type PointerType = "mouse" | "touch" | "keyboard" | "pen" | "virtual";

interface EventBase {
  currentTarget: EventTarget | null;
  target?: EventTarget | null;
  shiftKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
  clientX?: number;
  clientY?: number;
  key?: string;
  button?: number;
}

export interface PressEvent {
  type: "pressstart" | "pressend" | "pressup" | "press";
  pointerType: PointerType;
  target: Element;
  shiftKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
  x: number;
  y: number;
  key?: string;
  continuePropagation(): void;
  readonly shouldStopPropagation: boolean;
}

export interface PressProps {
  onPress?: (event: PressEvent) => void;
  onPressStart?: (event: PressEvent) => void;
  onPressEnd?: (event: PressEvent) => void;
  onPressUp?: (event: PressEvent) => void;
  onPressChange?: (isPressed: boolean) => void;
  onClick?: (event: MouseEvent) => void;
  isPressed?: boolean;
  isDisabled?: boolean;
  preventFocusOnPress?: boolean;
  shouldCancelOnPointerExit?: boolean;
  allowTextSelectionOnPress?: boolean;
}

export interface PressHookProps extends PressProps {
  ref?: { current: Element | null };
}

export interface PressResult {
  isPressed: boolean;
  pressProps: Record<string, unknown>;
}

interface PressState {
  isPressed: boolean;
  ignoreEmulatedMouseEvents: boolean;
  didFirePressStart: boolean;
  isTriggeringEvent: boolean;
  activePointerId: number | null;
  target: Element | null;
  isOverTarget: boolean;
  pointerType: PointerType | null;
  metaKeyEvents?: Map<string, KeyboardEvent>;
}

class PressEventImpl implements PressEvent {
  type: PressEvent["type"];
  pointerType: PointerType;
  target: Element;
  shiftKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
  x: number;
  y: number;
  key?: string;
  private stopPropagationFlag = true;

  constructor(type: PressEvent["type"], pointerType: PointerType, originalEvent: EventBase, state?: PressState) {
    const currentTarget = (state?.target ?? originalEvent.currentTarget) as Element;
    const rect = currentTarget?.getBoundingClientRect();

    const clientX = originalEvent.clientX;
    const clientY = originalEvent.clientY;

    this.type = type;
    this.pointerType = pointerType;
    this.target = currentTarget;
    this.shiftKey = originalEvent.shiftKey;
    this.ctrlKey = originalEvent.ctrlKey;
    this.metaKey = originalEvent.metaKey;
    this.altKey = originalEvent.altKey;
    this.x = rect ? (clientX != null ? clientX - rect.left : rect.width / 2) : 0;
    this.y = rect ? (clientY != null ? clientY - rect.top : rect.height / 2) : 0;
    this.key = originalEvent.key;
  }

  continuePropagation() {
    this.stopPropagationFlag = false;
  }

  get shouldStopPropagation() {
    return this.stopPropagationFlag;
  }
}

function isHTMLAnchorLink(target: Element): target is HTMLAnchorElement {
  return target.tagName === "A" && target.hasAttribute("href");
}

function shouldPreventDefaultUp(target: Element) {
  if (target instanceof HTMLInputElement) {
    return false;
  }

  if (target instanceof HTMLButtonElement) {
    return target.type !== "submit" && target.type !== "reset";
  }

  if (isHTMLAnchorLink(target)) {
    return false;
  }

  return true;
}

const nonTextInputTypes = new Set([
  "checkbox",
  "radio",
  "range",
  "color",
  "file",
  "image",
  "button",
  "submit",
  "reset",
]);

function isValidInputKey(target: HTMLInputElement, key: string) {
  return target.type === "checkbox" || target.type === "radio"
    ? key === " "
    : nonTextInputTypes.has(target.type);
}

function shouldPreventDefaultKeyboard(target: Element, key: string) {
  if (target instanceof HTMLInputElement) {
    return !isValidInputKey(target, key);
  }

  return shouldPreventDefaultUp(target);
}

function isValidKeyboardEvent(event: KeyboardEvent, currentTarget: Element): boolean {
  const { key, code } = event;
  const element = currentTarget as HTMLElement;
  const role = element.getAttribute("role");
  const ownerWindow = getOwnerWindow(element);

  return (
    (key === "Enter" || key === " " || key === "Spacebar" || code === "Space") &&
    !(
      (element instanceof ownerWindow.HTMLInputElement && !isValidInputKey(element, key)) ||
      element instanceof ownerWindow.HTMLTextAreaElement ||
      element.isContentEditable
    ) &&
    !((role === "link" || (!role && isHTMLAnchorLink(element))) && key !== "Enter")
  );
}

function createEvent(target: Element, e: EventBase): EventBase {
  return {
    currentTarget: target,
    target: e.target,
    shiftKey: e.shiftKey,
    ctrlKey: e.ctrlKey,
    metaKey: e.metaKey,
    altKey: e.altKey,
    clientX: e.clientX,
    clientY: e.clientY,
    key: e.key,
    button: e.button,
  };
}

export function usePress(props: PressHookProps): PressResult {
  const {
    onPress,
    onPressChange,
    onPressStart,
    onPressEnd,
    onPressUp,
    onClick,
    isDisabled,
    isPressed: isPressedProp,
    shouldCancelOnPointerExit,
    allowTextSelectionOnPress,
  } = props;

  let isPressed = false;
  const state: PressState = {
    isPressed: false,
    ignoreEmulatedMouseEvents: false,
    didFirePressStart: false,
    isTriggeringEvent: false,
    activePointerId: null,
    target: null,
    isOverTarget: false,
    pointerType: null,
  };

  const { addGlobalListener, removeAllGlobalListeners } = useGlobalListeners();

  const createPressEvent = (
    type: PressEvent["type"],
    pointerType: PointerType,
    event: EventBase,
    pressState = state
  ): PressEventImpl => new PressEventImpl(type, pointerType, event, pressState);

  const triggerPressStart = (event: EventBase, pointerType: PointerType) => {
    if (isDisabled || state.didFirePressStart) {
      return false;
    }

    state.isTriggeringEvent = true;
    let shouldStopPropagation = true;
    if (onPressStart) {
      const pressEvent = createPressEvent("pressstart", pointerType, event);
      onPressStart(pressEvent);
      shouldStopPropagation = pressEvent.shouldStopPropagation;
    }

    onPressChange?.(true);
    state.isTriggeringEvent = false;
    state.didFirePressStart = true;
    isPressed = true;

    return shouldStopPropagation;
  };

  const triggerPressEnd = (event: EventBase, pointerType: PointerType, wasPressed = true) => {
    if (!state.didFirePressStart) {
      return false;
    }

    state.didFirePressStart = false;
    state.isTriggeringEvent = true;

    let shouldStopPropagation = true;
    if (onPressEnd) {
      const pressEndEvent = createPressEvent("pressend", pointerType, event);
      onPressEnd(pressEndEvent);
      shouldStopPropagation = pressEndEvent.shouldStopPropagation;
    }

    onPressChange?.(false);
    isPressed = false;

    if (onPress && wasPressed && !isDisabled) {
      const pressEvent = createPressEvent("press", pointerType, event);
      onPress(pressEvent);
      shouldStopPropagation = shouldStopPropagation && pressEvent.shouldStopPropagation;
    }

    state.isTriggeringEvent = false;
    return shouldStopPropagation;
  };

  const triggerPressUp = (event: EventBase, pointerType: PointerType) => {
    if (isDisabled) {
      return false;
    }

    if (onPressUp) {
      state.isTriggeringEvent = true;
      const pressUpEvent = createPressEvent("pressup", pointerType, event);
      onPressUp(pressUpEvent);
      state.isTriggeringEvent = false;
      return pressUpEvent.shouldStopPropagation;
    }

    return true;
  };

  const cancel = (e: EventBase) => {
    if (state.isPressed && state.target) {
      if (state.didFirePressStart && state.pointerType != null) {
        triggerPressEnd(createEvent(state.target, e), state.pointerType, false);
      }

      state.isPressed = false;
      state.isOverTarget = false;
      state.activePointerId = null;
      state.pointerType = null;
      removeAllGlobalListeners();
      if (!allowTextSelectionOnPress) {
        restoreTextSelection();
      }
    }
  };

  const triggerClick = (event: MouseEvent) => {
    if (!isDisabled) {
      onClick?.(event);
    }
  };

  const pressProps: Record<string, unknown> = {
    onKeydown: (event: KeyboardEvent) => {
      if (isDisabled) {
        return;
      }

      const currentTarget = event.currentTarget as Element | null;
      if (!currentTarget || !isValidKeyboardEvent(event, currentTarget)) {
        if (event.key === "Meta") {
          state.metaKeyEvents = new Map();
        }
        return;
      }

      if (shouldPreventDefaultKeyboard(currentTarget, event.key)) {
        event.preventDefault();
      }

      let shouldStopPropagation = true;
      if (!state.isPressed && !event.repeat) {
        state.target = currentTarget;
        state.isPressed = true;
        state.pointerType = "keyboard";
        shouldStopPropagation = triggerPressStart(event, "keyboard");
      }

      if (shouldStopPropagation) {
        event.stopPropagation();
      }

      if (event.metaKey && isMac()) {
        state.metaKeyEvents?.set(event.key, event);
      }
    },

    onKeyup: (event: KeyboardEvent) => {
      if (isDisabled || !state.target || !state.isPressed || !isValidKeyboardEvent(event, state.target)) {
        return;
      }

      if (shouldPreventDefaultKeyboard(state.target, event.key)) {
        event.preventDefault();
      }

      const target = getEventTarget(event);
      const wasPressed = nodeContains(state.target, target as Node | null);

      const stopPressUp = triggerPressUp(createEvent(state.target, event), "keyboard");
      const stopPressEnd = triggerPressEnd(createEvent(state.target, event), "keyboard", wasPressed);

      if (wasPressed && event.key !== "Enter" && isHTMLAnchorLink(state.target)) {
        openLink(state.target, event);
      }

      state.isPressed = false;
      state.metaKeyEvents?.delete(event.key);

      if (stopPressUp && stopPressEnd) {
        event.stopPropagation();
      }
    },

    onClick: (event: MouseEvent) => {
      const currentTarget = event.currentTarget as Element | null;
      if (!currentTarget || !nodeContains(currentTarget, getEventTarget(event) as Node | null)) {
        return;
      }

      if (event.button === 0 && !state.isTriggeringEvent && !(openLink as { isOpening?: boolean }).isOpening) {
        let shouldStopPropagation = true;

        if (isDisabled) {
          event.preventDefault();
        }

        if (!state.ignoreEmulatedMouseEvents && !state.isPressed && (state.pointerType === "virtual" || isVirtualClick(event))) {
          const stopPressStart = triggerPressStart(event, "virtual");
          const stopPressUp = triggerPressUp(event, "virtual");
          const stopPressEnd = triggerPressEnd(event, "virtual");
          triggerClick(event);
          shouldStopPropagation = stopPressStart && stopPressUp && stopPressEnd;
        } else if (state.isPressed && state.pointerType !== "keyboard") {
          const pointerType = state.pointerType ?? ((event as unknown as PointerEvent).pointerType as PointerType) ?? "virtual";
          const stopPressUp = triggerPressUp(createEvent(currentTarget, event), pointerType);
          const stopPressEnd = triggerPressEnd(createEvent(currentTarget, event), pointerType, true);
          shouldStopPropagation = stopPressUp && stopPressEnd;
          state.isOverTarget = false;
          triggerClick(event);
          cancel(event);
        }

        state.ignoreEmulatedMouseEvents = false;
        if (shouldStopPropagation) {
          event.stopPropagation();
        }
      }
    },
  };

  if (typeof PointerEvent !== "undefined") {
    pressProps.onPointerdown = (event: PointerEvent) => {
      const currentTarget = event.currentTarget as Element | null;
      if (event.button !== 0 || !currentTarget || !nodeContains(currentTarget, getEventTarget(event) as Node | null)) {
        return;
      }

      if (isVirtualPointerEvent(event)) {
        state.pointerType = "virtual";
        return;
      }

      state.pointerType = (event.pointerType || "mouse") as PointerType;

      let shouldStopPropagation = true;
      if (!state.isPressed) {
        state.isPressed = true;
        state.isOverTarget = true;
        state.activePointerId = event.pointerId;
        state.target = currentTarget;

        if (!allowTextSelectionOnPress) {
          disableTextSelection();
        }

        shouldStopPropagation = triggerPressStart(event, state.pointerType);

        const target = getEventTarget(event) as Element | null;
        if (target && "releasePointerCapture" in target) {
          const pointerCaptureTarget = target as Element & {
            hasPointerCapture?: (pointerId: number) => boolean;
            releasePointerCapture: (pointerId: number) => void;
          };

          if (!pointerCaptureTarget.hasPointerCapture || pointerCaptureTarget.hasPointerCapture(event.pointerId)) {
            pointerCaptureTarget.releasePointerCapture(event.pointerId);
          }
        }
      }

      const onPointerUp = (upEvent: Event) => {
        const pointerEvent = upEvent as PointerEvent;
        if (pointerEvent.pointerId !== state.activePointerId || !state.target) {
          return;
        }

        if (nodeContains(state.target, getEventTarget(pointerEvent) as Node | null) && state.pointerType != null) {
          // onPress fires from click to better match browser sequencing.
        } else {
          cancel(pointerEvent);
        }

        state.isOverTarget = false;
      };

      const onPointerCancel = (cancelEvent: Event) => {
        cancel(cancelEvent as PointerEvent);
      };

      addGlobalListener(getOwnerWindow(currentTarget).document, "pointerup", onPointerUp, false);
      addGlobalListener(getOwnerWindow(currentTarget).document, "pointercancel", onPointerCancel, false);

      if (shouldStopPropagation) {
        event.stopPropagation();
      }
    };

    pressProps.onPointerup = (event: PointerEvent) => {
      const currentTarget = event.currentTarget as Element | null;
      if (!currentTarget || !nodeContains(currentTarget, getEventTarget(event) as Node | null) || state.pointerType === "virtual") {
        return;
      }

      if (event.button === 0 && !state.isPressed) {
        triggerPressUp(event, state.pointerType || (event.pointerType as PointerType));
      }
    };

    pressProps.onPointerenter = (event: PointerEvent) => {
      if (
        event.pointerId === state.activePointerId &&
        state.target &&
        !state.isOverTarget &&
        state.pointerType != null
      ) {
        state.isOverTarget = true;
        triggerPressStart(createEvent(state.target, event), state.pointerType);
      }
    };

    pressProps.onPointerleave = (event: PointerEvent) => {
      if (
        event.pointerId === state.activePointerId &&
        state.target &&
        state.isOverTarget &&
        state.pointerType != null
      ) {
        state.isOverTarget = false;
        triggerPressEnd(createEvent(state.target, event), state.pointerType, false);

        if (shouldCancelOnPointerExit) {
          cancel(event);
        }
      }
    };

    pressProps.onDragstart = (event: DragEvent) => {
      const currentTarget = event.currentTarget as Element | null;
      if (!currentTarget || !nodeContains(currentTarget, getEventTarget(event) as Node | null)) {
        return;
      }

      cancel(event);
    };
  } else {
    pressProps.onMousedown = (event: MouseEvent) => {
      const currentTarget = event.currentTarget as Element | null;
      if (event.button !== 0 || !currentTarget || !nodeContains(currentTarget, getEventTarget(event) as Node | null)) {
        return;
      }

      state.isPressed = true;
      state.isOverTarget = true;
      state.target = currentTarget;
      state.pointerType = isVirtualClick(event) ? "virtual" : "mouse";
      state.ignoreEmulatedMouseEvents = false;

      const shouldStopPropagation = triggerPressStart(event, state.pointerType);
      if (shouldStopPropagation) {
        event.stopPropagation();
      }

      const onMouseUp = (upEvent: Event) => {
        const mouseEvent = upEvent as MouseEvent;
        if (mouseEvent.button !== 0 || !state.target) {
          return;
        }

        if (!nodeContains(state.target, getEventTarget(mouseEvent) as Node | null)) {
          cancel(mouseEvent);
        }

        state.isOverTarget = false;
      };

      addGlobalListener(getOwnerWindow(currentTarget).document, "mouseup", onMouseUp, false);
    };

    pressProps.onMouseenter = (event: MouseEvent) => {
      const currentTarget = event.currentTarget as Element | null;
      if (!currentTarget || !nodeContains(currentTarget, getEventTarget(event) as Node | null)) {
        return;
      }

      let shouldStopPropagation = true;
      if (state.isPressed && !state.ignoreEmulatedMouseEvents && state.pointerType != null) {
        state.isOverTarget = true;
        shouldStopPropagation = triggerPressStart(event, state.pointerType);
      }

      if (shouldStopPropagation) {
        event.stopPropagation();
      }
    };

    pressProps.onMouseleave = (event: MouseEvent) => {
      const currentTarget = event.currentTarget as Element | null;
      if (!currentTarget || !nodeContains(currentTarget, getEventTarget(event) as Node | null)) {
        return;
      }

      let shouldStopPropagation = true;
      if (state.isPressed && !state.ignoreEmulatedMouseEvents && state.pointerType != null) {
        state.isOverTarget = false;
        shouldStopPropagation = triggerPressEnd(event, state.pointerType, false);
        if (shouldCancelOnPointerExit) {
          cancel(event);
        }
      }

      if (shouldStopPropagation) {
        event.stopPropagation();
      }
    };

    pressProps.onMouseup = (event: MouseEvent) => {
      const currentTarget = event.currentTarget as Element | null;
      if (!currentTarget || !nodeContains(currentTarget, getEventTarget(event) as Node | null)) {
        return;
      }

      if (!state.ignoreEmulatedMouseEvents && event.button === 0 && !state.isPressed) {
        triggerPressUp(event, state.pointerType || "mouse");
      }
    };

    pressProps.onDragstart = (event: DragEvent) => {
      const currentTarget = event.currentTarget as Element | null;
      if (!currentTarget || !nodeContains(currentTarget, getEventTarget(event) as Node | null)) {
        return;
      }

      cancel(event);
    };
  }

  const cleanup = () => {
    removeAllGlobalListeners();
    state.activePointerId = null;
    state.target = null;
    state.isOverTarget = false;
    state.pointerType = null;
    if (!allowTextSelectionOnPress) {
      restoreTextSelection();
    }
  };

  onScopeDispose(cleanup);

  return {
    isPressed: Boolean(isPressedProp) || isPressed,
    pressProps,
  };
}
