import { getCurrentScope, ref, toValue, watchEffect } from "vue";
import { useFocus } from "@vue-aria/interactions";
import type { MaybeReactive } from "@vue-aria/types";
import { readFromDataTransfer, writeToDataTransfer } from "./utils";
import type { DragItem, DropItem } from "./types";

type ClipboardAction = "cut" | "copy";

export interface ClipboardProps {
  getItems?: ((details: { action: ClipboardAction }) => DragItem[]) | null;
  onCopy?: (() => void) | null;
  onCut?: (() => void) | null;
  onPaste?: ((items: DropItem[]) => void) | null;
  isDisabled?: MaybeReactive<boolean>;
}

export interface ClipboardResult {
  clipboardProps: Record<string, unknown>;
}

interface ClipboardEventLike extends Event {
  clipboardData: DataTransfer | null;
}

interface GlobalEventData {
  listener: (event: Event) => void;
  handlers: Set<(event: Event) => void>;
}

const globalEvents = new Map<string, GlobalEventData>();

function addGlobalEventListener(eventName: string, handler: (event: Event) => void): () => void {
  let eventData = globalEvents.get(eventName);
  if (!eventData) {
    const handlers = new Set<(event: Event) => void>();
    const listener = (event: Event) => {
      for (const globalHandler of handlers) {
        globalHandler(event);
      }
    };

    eventData = { listener, handlers };
    globalEvents.set(eventName, eventData);
    document.addEventListener(eventName, listener);
  }

  eventData.handlers.add(handler);

  return () => {
    const current = globalEvents.get(eventName);
    if (!current) {
      return;
    }

    current.handlers.delete(handler);
    if (current.handlers.size === 0) {
      document.removeEventListener(eventName, current.listener);
      globalEvents.delete(eventName);
    }
  };
}

function chainCleanups(...cleanups: Array<() => void>): () => void {
  return () => {
    for (const cleanup of cleanups) {
      cleanup();
    }
  };
}

function asClipboardEvent(event: Event): ClipboardEventLike {
  return event as ClipboardEventLike;
}

export function useClipboard(options: ClipboardProps): ClipboardResult {
  const isFocused = ref(false);
  const { focusProps } = useFocus({
    onFocusChange: (focused) => {
      isFocused.value = focused;
    },
  });

  const onBeforeCopy = (event: Event) => {
    if (isFocused.value && options.getItems) {
      event.preventDefault();
    }
  };

  const onCopy = (event: Event) => {
    if (!isFocused.value || !options.getItems) {
      return;
    }

    event.preventDefault();
    const clipboardEvent = asClipboardEvent(event);
    if (clipboardEvent.clipboardData) {
      writeToDataTransfer(clipboardEvent.clipboardData, options.getItems({ action: "copy" }));
      options.onCopy?.();
    }
  };

  const onBeforeCut = (event: Event) => {
    if (isFocused.value && options.onCut && options.getItems) {
      event.preventDefault();
    }
  };

  const onCut = (event: Event) => {
    if (!isFocused.value || !options.onCut || !options.getItems) {
      return;
    }

    event.preventDefault();
    const clipboardEvent = asClipboardEvent(event);
    if (clipboardEvent.clipboardData) {
      writeToDataTransfer(clipboardEvent.clipboardData, options.getItems({ action: "cut" }));
      options.onCut();
    }
  };

  const onBeforePaste = (event: Event) => {
    if (isFocused.value && options.onPaste) {
      event.preventDefault();
    }
  };

  const onPaste = (event: Event) => {
    if (!isFocused.value || !options.onPaste) {
      return;
    }

    event.preventDefault();
    const clipboardEvent = asClipboardEvent(event);
    if (clipboardEvent.clipboardData) {
      options.onPaste(readFromDataTransfer(clipboardEvent.clipboardData));
    }
  };

  const setup = () => {
    if (options.isDisabled && toValue(options.isDisabled)) {
      return () => {};
    }

    return chainCleanups(
      addGlobalEventListener("beforecopy", onBeforeCopy),
      addGlobalEventListener("copy", onCopy),
      addGlobalEventListener("beforecut", onBeforeCut),
      addGlobalEventListener("cut", onCut),
      addGlobalEventListener("beforepaste", onBeforePaste),
      addGlobalEventListener("paste", onPaste)
    );
  };

  if (getCurrentScope()) {
    watchEffect((onCleanup) => {
      const cleanup = setup();
      onCleanup(cleanup);
    });
  } else {
    const cleanup = setup();
    if (typeof window !== "undefined") {
      window.addEventListener("beforeunload", cleanup, { once: true });
    }
  }

  return {
    clipboardProps: focusProps,
  };
}
