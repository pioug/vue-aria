import { readonly, ref, toValue, watchEffect } from "vue";
import type {
  MaybeReactive,
  PointerType,
  PressEvent,
  ReadonlyRef,
} from "@vue-aria/types";

export interface UsePressOptions {
  isDisabled?: MaybeReactive<boolean>;
  disableKeyboard?: MaybeReactive<boolean>;
  onPressStart?: (event: PressEvent) => void;
  onPressEnd?: (event: PressEvent) => void;
  onPress?: (event: PressEvent) => void;
}

export interface UsePressResult {
  pressProps: Record<string, unknown>;
  isPressed: ReadonlyRef<boolean>;
}

function createSyntheticEvent(type: string, target: EventTarget | null): Event {
  const event = new Event(type, { bubbles: true, cancelable: true });
  if (target) {
    Object.defineProperty(event, "target", { value: target });
    Object.defineProperty(event, "currentTarget", { value: target });
  }
  return event;
}

function toPressEvent(originalEvent: Event, pointerType: PointerType): PressEvent {
  return {
    type: "press",
    pointerType,
    target: originalEvent.currentTarget ?? originalEvent.target,
    originalEvent,
  };
}

export function usePress(options: UsePressOptions = {}): UsePressResult {
  const isPressed = ref(false);
  const activePointerType = ref<PointerType | null>(null);
  const activePressTarget = ref<EventTarget | null>(null);
  let removeScrollListener: (() => void) | null = null;

  const isDisabled = () =>
    Boolean(options.isDisabled === undefined ? false : toValue(options.isDisabled));
  const disableKeyboard = () =>
    Boolean(
      options.disableKeyboard === undefined ? false : toValue(options.disableKeyboard)
    );

  const clearScrollListener = () => {
    removeScrollListener?.();
    removeScrollListener = null;
  };

  const startPress = (event: Event, pointerType: PointerType) => {
    if (isDisabled()) {
      return;
    }

    activePointerType.value = pointerType;
    activePressTarget.value = event.currentTarget ?? event.target;
    isPressed.value = true;

    clearScrollListener();
    if (pointerType === "touch" && typeof window !== "undefined") {
      const onScroll = () => {
        if (!isPressed.value || activePointerType.value !== "touch") {
          return;
        }

        endPress(createSyntheticEvent("pointercancel", activePressTarget.value), false);
      };

      window.addEventListener("scroll", onScroll, true);
      removeScrollListener = () => {
        window.removeEventListener("scroll", onScroll, true);
      };
    }

    options.onPressStart?.(toPressEvent(event, pointerType));
  };

  const endPress = (event: Event, shouldTrigger = true) => {
    if (!isPressed.value) {
      return;
    }

    const pointerType = activePointerType.value ?? "virtual";
    isPressed.value = false;
    activePointerType.value = null;
    activePressTarget.value = null;
    clearScrollListener();

    const pressEvent = toPressEvent(event, pointerType);
    options.onPressEnd?.(pressEvent);
    if (shouldTrigger) {
      options.onPress?.(pressEvent);
    }
  };

  const onPointerdown = (event: PointerEvent) => {
    if (event.button !== 0) {
      return;
    }
    const pointerType =
      event.pointerType === "touch"
        ? "touch"
        : event.pointerType === "pen"
          ? "pen"
          : "mouse";
    startPress(event, pointerType);
  };

  const onPointerup = (event: PointerEvent) => {
    endPress(event, true);
  };

  const onPointercancel = (event: PointerEvent) => {
    endPress(event, false);
  };

  const onKeydown = (event: KeyboardEvent) => {
    if (disableKeyboard()) {
      return;
    }

    if (event.repeat) {
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      startPress(event, "keyboard");
      endPress(event, true);
      return;
    }

    if (event.key === " ") {
      event.preventDefault();
      startPress(event, "keyboard");
    }
  };

  const onKeyup = (event: KeyboardEvent) => {
    if (disableKeyboard()) {
      return;
    }

    if (event.key === " ") {
      event.preventDefault();
      endPress(event, true);
    }
  };

  const onClick = (event: MouseEvent) => {
    if (isDisabled()) {
      event.preventDefault();
      return;
    }

    // Virtual clicks (screen reader or keyboard-triggered native button click)
    // have detail === 0 and no pointer press lifecycle.
    if (event.detail === 0 && !isPressed.value) {
      options.onPress?.(toPressEvent(event, "virtual"));
    }
  };

  watchEffect(() => {
    if (isDisabled()) {
      isPressed.value = false;
      activePointerType.value = null;
      activePressTarget.value = null;
      clearScrollListener();
    }
  });

  return {
    pressProps: {
      onPointerdown,
      onPointerup,
      onPointercancel,
      onKeydown,
      onKeyup,
      onClick,
    },
    isPressed: readonly(isPressed),
  };
}
