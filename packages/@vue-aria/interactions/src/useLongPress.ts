import {
  focusWithoutScrolling,
  getOwnerDocument,
  mergeProps,
  useDescription,
  useGlobalListeners,
} from "@vue-aria/utils";
import { onScopeDispose } from "vue";
import { type PressEvent, usePress } from "./usePress";

export type LongPressEvent = Omit<PressEvent, "type"> & {
  type: "longpressstart" | "longpressend" | "longpress";
};

export interface LongPressProps {
  isDisabled?: boolean;
  onLongPressStart?: (event: LongPressEvent) => void;
  onLongPressEnd?: (event: LongPressEvent) => void;
  onLongPress?: (event: LongPressEvent) => void;
  threshold?: number;
  accessibilityDescription?: string;
}

export interface LongPressResult {
  longPressProps: Record<string, unknown>;
}

const DEFAULT_THRESHOLD = 500;

function toLongPressEvent(type: LongPressEvent["type"], event: PressEvent): LongPressEvent {
  return {
    ...event,
    type,
  };
}

function createPointerCancelEvent(): Event {
  if (typeof PointerEvent !== "undefined") {
    return new PointerEvent("pointercancel", { bubbles: true });
  }

  return new Event("pointercancel", { bubbles: true });
}

export function useLongPress(props: LongPressProps): LongPressResult {
  const {
    isDisabled,
    onLongPressStart,
    onLongPressEnd,
    onLongPress,
    threshold = DEFAULT_THRESHOLD,
    accessibilityDescription,
  } = props;

  const state = {
    timeout: undefined as ReturnType<typeof setTimeout> | undefined,
    endFired: false,
  };

  const { addGlobalListener, removeGlobalListener } = useGlobalListeners();

  const clearTimer = () => {
    if (state.timeout) {
      clearTimeout(state.timeout);
      state.timeout = undefined;
    }
  };

  const fireLongPressEndIfNeeded = (event: PressEvent) => {
    if (!state.endFired && onLongPressEnd && (event.pointerType === "mouse" || event.pointerType === "touch")) {
      state.endFired = true;
      onLongPressEnd(toLongPressEvent("longpressend", event));
    }
  };

  const { pressProps } = usePress({
    isDisabled,
    onPressStart(event) {
      event.continuePropagation();

      if (event.pointerType !== "mouse" && event.pointerType !== "touch") {
        return;
      }

      state.endFired = false;
      onLongPressStart?.(toLongPressEvent("longpressstart", event));

      clearTimer();
      state.timeout = setTimeout(() => {
        fireLongPressEndIfNeeded(event);

        event.target.dispatchEvent(createPointerCancelEvent());

        if (getOwnerDocument(event.target).activeElement !== event.target) {
          focusWithoutScrolling(event.target as HTMLElement);
        }

        onLongPress?.(toLongPressEvent("longpress", event));
        state.timeout = undefined;
      }, threshold);

      if (event.pointerType === "touch") {
        const onContextMenu = (contextMenuEvent: Event) => {
          contextMenuEvent.preventDefault();
        };

        addGlobalListener(event.target, "contextmenu", onContextMenu, { once: true });
        addGlobalListener(
          window,
          "pointerup",
          () => {
            setTimeout(() => {
              removeGlobalListener(event.target, "contextmenu", onContextMenu);
            }, 30);
          },
          { once: true }
        );
      }
    },
    onPressEnd(event) {
      clearTimer();
      fireLongPressEndIfNeeded(event);
    },
  });

  const { descriptionProps } = useDescription(onLongPress && !isDisabled ? accessibilityDescription : undefined);

  onScopeDispose(clearTimer);

  return {
    longPressProps: mergeProps(pressProps, descriptionProps.value),
  };
}
