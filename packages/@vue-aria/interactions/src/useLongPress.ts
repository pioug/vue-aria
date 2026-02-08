import { toValue } from "vue";
import { usePress } from "./usePress";
import { mergeProps, useDescription } from "@vue-aria/utils";
import type { LongPressEvent, MaybeReactive } from "@vue-aria/types";

const DEFAULT_THRESHOLD = 500;

export interface UseLongPressOptions {
  isDisabled?: MaybeReactive<boolean>;
  onLongPressStart?: (event: LongPressEvent) => void;
  onLongPressEnd?: (event: LongPressEvent) => void;
  onLongPress?: (event: LongPressEvent) => void;
  threshold?: MaybeReactive<number | undefined>;
  accessibilityDescription?: MaybeReactive<string | undefined>;
}

export interface UseLongPressResult {
  longPressProps: Record<string, unknown>;
}

function dispatchPointerCancel(target: EventTarget | null): void {
  if (!target || typeof target.dispatchEvent !== "function") {
    return;
  }

  const cancelEvent =
    typeof PointerEvent !== "undefined"
      ? new PointerEvent("pointercancel", { bubbles: true })
      : new Event("pointercancel", { bubbles: true });
  target.dispatchEvent(cancelEvent);
}

function preventTouchContextMenu(target: EventTarget | null): void {
  if (
    !target ||
    typeof target.addEventListener !== "function" ||
    typeof target.removeEventListener !== "function" ||
    typeof window === "undefined"
  ) {
    return;
  }

  const onContextMenu = (event: Event) => {
    event.preventDefault();
  };

  target.addEventListener("contextmenu", onContextMenu, { once: true });
  window.addEventListener(
    "pointerup",
    () => {
      // If no contextmenu event fires quickly after pointerup, release this guard.
      setTimeout(() => {
        target.removeEventListener("contextmenu", onContextMenu);
      }, 30);
    },
    { once: true }
  );
}

function isDisabled(options: UseLongPressOptions): boolean {
  return options.isDisabled ? Boolean(toValue(options.isDisabled)) : false;
}

function resolveThreshold(options: UseLongPressOptions): number {
  const value = options.threshold ? toValue(options.threshold) : undefined;
  return value ?? DEFAULT_THRESHOLD;
}

export function useLongPress(
  options: UseLongPressOptions = {}
): UseLongPressResult {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let startedEvent: LongPressEvent | null = null;

  const cancelTimer = () => {
    if (timer) {
      clearTimeout(timer);
      timer = undefined;
    }
  };

  const { pressProps } = usePress({
    isDisabled: options.isDisabled,
    onPressStart: (event) => {
      if (isDisabled(options)) {
        return;
      }

      if (event.pointerType !== "mouse" && event.pointerType !== "touch") {
        return;
      }

      startedEvent = {
        type: "longpressstart",
        pointerType: event.pointerType,
        target: event.target,
        originalEvent: event.originalEvent,
      };
      options.onLongPressStart?.(startedEvent);

      if (event.pointerType === "touch") {
        preventTouchContextMenu(event.target);
      }

      timer = setTimeout(() => {
        const longPressStartEvent = startedEvent;
        if (!longPressStartEvent) {
          return;
        }

        timer = undefined;
        // Match React Aria: canceling the press prevents merged press handlers from firing.
        dispatchPointerCancel(longPressStartEvent.target);
        options.onLongPress?.({
          type: "longpress",
          pointerType: longPressStartEvent.pointerType,
          target: longPressStartEvent.target,
          originalEvent: longPressStartEvent.originalEvent,
        });
      }, resolveThreshold(options));
    },
    onPressEnd: (event) => {
      if (event.pointerType !== "mouse" && event.pointerType !== "touch") {
        return;
      }

      if (!startedEvent) {
        return;
      }

      if (timer) {
        cancelTimer();
      }

      options.onLongPressEnd?.({
        type: "longpressend",
        pointerType: event.pointerType,
        target: event.target,
        originalEvent: event.originalEvent,
      });

      startedEvent = null;
    },
  });

  const descriptionText =
    !isDisabled(options) && options.onLongPress
      ? options.accessibilityDescription
      : undefined;
  const { descriptionProps } = useDescription(descriptionText);

  return {
    longPressProps: mergeProps(pressProps, descriptionProps.value),
  };
}
