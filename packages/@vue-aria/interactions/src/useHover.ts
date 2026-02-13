import { getOwnerDocument, nodeContains, useGlobalListeners } from "@vue-aria/utils";
import { onScopeDispose } from "vue";

export interface HoverEvent {
  type: "hoverstart" | "hoverend";
  target: EventTarget | null;
  pointerType: string;
}

export interface HoverProps {
  onHoverStart?: (event: HoverEvent) => void;
  onHoverChange?: (isHovering: boolean) => void;
  onHoverEnd?: (event: HoverEvent) => void;
  isDisabled?: boolean;
}

export interface HoverResult {
  hoverProps: Record<string, unknown>;
  isHovered: boolean;
}

let globalIgnoreEmulatedMouseEvents = false;
let hoverCount = 0;

function setGlobalIgnoreEmulatedMouseEvents() {
  globalIgnoreEmulatedMouseEvents = true;
  setTimeout(() => {
    globalIgnoreEmulatedMouseEvents = false;
  }, 50);
}

function handleGlobalPointerEvent(event: PointerEvent) {
  if (event.pointerType === "touch") {
    setGlobalIgnoreEmulatedMouseEvents();
  }
}

function setupGlobalTouchEvents() {
  if (typeof document === "undefined") {
    return () => {};
  }

  if (hoverCount === 0) {
    if (typeof PointerEvent !== "undefined") {
      document.addEventListener("pointerup", handleGlobalPointerEvent);
    } else {
      document.addEventListener("touchend", setGlobalIgnoreEmulatedMouseEvents);
    }
  }

  hoverCount += 1;

  return () => {
    hoverCount -= 1;
    if (hoverCount > 0) {
      return;
    }

    if (typeof PointerEvent !== "undefined") {
      document.removeEventListener("pointerup", handleGlobalPointerEvent);
    } else {
      document.removeEventListener("touchend", setGlobalIgnoreEmulatedMouseEvents);
    }
  };
}

export function useHover(props: HoverProps): HoverResult {
  const { onHoverStart, onHoverChange, onHoverEnd, isDisabled } = props;

  let isHovered = false;
  const state = {
    isHovered: false,
    ignoreEmulatedMouseEvents: false,
    pointerType: "",
    target: null as EventTarget | null,
  };

  const teardownGlobalTouchEvents = setupGlobalTouchEvents();
  const { addGlobalListener, removeAllGlobalListeners } = useGlobalListeners();

  const triggerHoverEnd = (event: Event, pointerType: string) => {
    const target = state.target;
    state.pointerType = "";
    state.target = null;

    if (pointerType === "touch" || !state.isHovered || !target) {
      return;
    }

    state.isHovered = false;
    removeAllGlobalListeners();

    onHoverEnd?.({
      type: "hoverend",
      target,
      pointerType,
    });

    onHoverChange?.(false);
    isHovered = false;
  };

  const triggerHoverStart = (event: Event, pointerType: string) => {
    state.pointerType = pointerType;

    if (
      isDisabled ||
      pointerType === "touch" ||
      state.isHovered ||
      !nodeContains(event.currentTarget as Node | null, event.target as Node | null)
    ) {
      return;
    }

    state.isHovered = true;
    state.target = event.currentTarget;

    addGlobalListener(
      getOwnerDocument(event.target as Element),
      "pointerover",
      (outsideEvent: Event) => {
        if (
          state.isHovered &&
          state.target &&
          !nodeContains(state.target as Node, outsideEvent.target as Node | null)
        ) {
          triggerHoverEnd(outsideEvent, (outsideEvent as PointerEvent).pointerType || "mouse");
        }
      },
      { capture: true }
    );

    onHoverStart?.({
      type: "hoverstart",
      target: state.target,
      pointerType,
    });

    onHoverChange?.(true);
    isHovered = true;
  };

  onScopeDispose(() => {
    removeAllGlobalListeners();
    teardownGlobalTouchEvents();
  });

  if (isDisabled) {
    triggerHoverEnd(new Event("hoverend"), state.pointerType);
  }

  const hoverProps: Record<string, unknown> = {};

  if (typeof PointerEvent !== "undefined") {
    hoverProps.onPointerenter = (event: PointerEvent) => {
      if (globalIgnoreEmulatedMouseEvents && event.pointerType === "mouse") {
        return;
      }

      triggerHoverStart(event, event.pointerType);
    };

    hoverProps.onPointerleave = (event: PointerEvent) => {
      if (!isDisabled && nodeContains(event.currentTarget as Node | null, event.target as Node | null)) {
        triggerHoverEnd(event, event.pointerType);
      }
    };
  } else {
    hoverProps.onTouchstart = () => {
      state.ignoreEmulatedMouseEvents = true;
    };

    hoverProps.onMouseenter = (event: MouseEvent) => {
      if (!state.ignoreEmulatedMouseEvents && !globalIgnoreEmulatedMouseEvents) {
        triggerHoverStart(event, "mouse");
      }

      state.ignoreEmulatedMouseEvents = false;
    };

    hoverProps.onMouseleave = (event: MouseEvent) => {
      if (!isDisabled && nodeContains(event.currentTarget as Node | null, event.target as Node | null)) {
        triggerHoverEnd(event, "mouse");
      }
    };
  }

  return {
    hoverProps,
    isHovered,
  };
}
