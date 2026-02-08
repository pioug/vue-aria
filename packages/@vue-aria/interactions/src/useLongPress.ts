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
  let hasTriggered = false;

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

      hasTriggered = false;
      startedEvent = {
        type: "longpressstart",
        pointerType: event.pointerType,
        target: event.target,
        originalEvent: event.originalEvent,
      };
      options.onLongPressStart?.(startedEvent);

      timer = setTimeout(() => {
        if (!startedEvent) {
          return;
        }

        hasTriggered = true;
        const endEvent: LongPressEvent = {
          type: "longpressend",
          pointerType: startedEvent.pointerType,
          target: startedEvent.target,
          originalEvent: startedEvent.originalEvent,
        };
        options.onLongPressEnd?.(endEvent);
        options.onLongPress?.({
          type: "longpress",
          pointerType: startedEvent.pointerType,
          target: startedEvent.target,
          originalEvent: startedEvent.originalEvent,
        });
        timer = undefined;
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

      if (!hasTriggered) {
        options.onLongPressEnd?.({
          type: "longpressend",
          pointerType: event.pointerType,
          target: event.target,
          originalEvent: event.originalEvent,
        });
      }

      startedEvent = null;
      hasTriggered = false;
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
