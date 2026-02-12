import { getCurrentScope, onScopeDispose, ref, toValue, watch } from "vue";
import type { HoverEvent, MaybeReactive, PointerType, ReadonlyRef } from "@vue-aria/types";

export interface UseHoverOptions {
  isDisabled?: MaybeReactive<boolean>;
  onHoverStart?: (event: HoverEvent) => void;
  onHoverEnd?: (event: HoverEvent) => void;
  onHoverChange?: (isHovered: boolean) => void;
}

export interface UseHoverResult {
  hoverProps: Record<string, unknown>;
  isHovered: ReadonlyRef<boolean>;
}

let globalIgnoreEmulatedMouseEvents = false;
let hoverHookCount = 0;
const onGlobalPointerUp = (event: Event) => {
  if (toPointerType(event as PointerEvent) === "touch") {
    setGlobalIgnoreEmulatedMouseEvents();
  }
};

function setGlobalIgnoreEmulatedMouseEvents() {
  globalIgnoreEmulatedMouseEvents = true;
  setTimeout(() => {
    globalIgnoreEmulatedMouseEvents = false;
  }, 50);
}

function isDisabled(options: UseHoverOptions): boolean {
  return options.isDisabled ? Boolean(toValue(options.isDisabled)) : false;
}

function toPointerType(event: PointerEvent): PointerType {
  if (event.pointerType === "touch") {
    return "touch";
  }
  if (event.pointerType === "pen") {
    return "pen";
  }
  return "mouse";
}

function toHoverEvent(
  type: "hoverstart" | "hoverend",
  originalEvent: Event,
  pointerType: PointerType,
  target: EventTarget | null
): HoverEvent {
  return { type, pointerType, target, originalEvent };
}

function isTargetWithinCurrentTarget(event: Event): boolean {
  const currentTarget = event.currentTarget;
  const target = event.target;
  return (
    currentTarget instanceof Element &&
    target instanceof Element &&
    currentTarget.contains(target)
  );
}

export function useHover(options: UseHoverOptions = {}): UseHoverResult {
  const isHovered = ref(false);
  const targetRef = ref<EventTarget | null>(null);
  const pointerTypeRef = ref<PointerType>("mouse");
  const disposeDocumentListener = ref<(() => void) | null>(null);
  const hasPointerEvents = typeof PointerEvent !== "undefined";

  const stopGlobalListener = () => {
    disposeDocumentListener.value?.();
    disposeDocumentListener.value = null;
  };

  const triggerHoverEnd = (event: Event, pointerType: PointerType) => {
    const target = targetRef.value;
    pointerTypeRef.value = "mouse";
    targetRef.value = null;

    if (pointerType === "touch" || !isHovered.value || !target) {
      return;
    }

    isHovered.value = false;
    stopGlobalListener();

    options.onHoverEnd?.(toHoverEvent("hoverend", event, pointerType, target));
    options.onHoverChange?.(false);
  };

  const triggerHoverStart = (event: Event, pointerType: PointerType) => {
    if (isDisabled(options) || pointerType === "touch" || isHovered.value) {
      return;
    }

    if (!isTargetWithinCurrentTarget(event)) {
      return;
    }

    const currentTarget = event.currentTarget as Element;

    isHovered.value = true;
    pointerTypeRef.value = pointerType;
    targetRef.value = currentTarget;

    const ownerDocument = currentTarget.ownerDocument ?? document;
    const onPointerOver = (pointerOverEvent: Event) => {
      const pointerEvent = pointerOverEvent as PointerEvent;
      if (
        isHovered.value &&
        targetRef.value instanceof Element &&
        pointerEvent.target instanceof Element &&
        !targetRef.value.contains(pointerEvent.target)
      ) {
        triggerHoverEnd(pointerEvent, toPointerType(pointerEvent));
      }
    };

    ownerDocument.addEventListener("pointerover", onPointerOver, true);
    disposeDocumentListener.value = () => {
      ownerDocument.removeEventListener("pointerover", onPointerOver, true);
    };

    options.onHoverStart?.(
      toHoverEvent("hoverstart", event, pointerType, currentTarget)
    );
    options.onHoverChange?.(true);
  };

  const onPointerEnter = (event: PointerEvent) => {
    const pointerType = toPointerType(event);
    if (globalIgnoreEmulatedMouseEvents && pointerType === "mouse") {
      return;
    }
    triggerHoverStart(event, pointerType);
  };

  const onPointerLeave = (event: PointerEvent) => {
    if (isDisabled(options)) {
      return;
    }

    if (!isTargetWithinCurrentTarget(event)) {
      return;
    }

    triggerHoverEnd(event, toPointerType(event));
  };

  if (typeof document !== "undefined" && hoverHookCount === 0) {
    document.addEventListener("pointerup", onGlobalPointerUp, true);
  }
  hoverHookCount += 1;

  watch(
    () => isDisabled(options),
    (disabled) => {
      if (!disabled) {
        return;
      }

      const target = targetRef.value;
      if (!target) {
        return;
      }
      triggerHoverEnd(new Event("pointerleave"), pointerTypeRef.value);
    }
  );

  if (getCurrentScope()) {
    onScopeDispose(() => {
      stopGlobalListener();
      hoverHookCount -= 1;
      if (typeof document !== "undefined" && hoverHookCount === 0) {
        document.removeEventListener("pointerup", onGlobalPointerUp, true);
      }
    });
  }

  return {
    hoverProps: hasPointerEvents
      ? {
          onPointerenter: onPointerEnter,
          onPointerleave: onPointerLeave,
        }
      : {
          onMouseenter: (event: MouseEvent) => {
            if (globalIgnoreEmulatedMouseEvents) {
              return;
            }
            triggerHoverStart(event, "mouse");
          },
          onMouseleave: (event: MouseEvent) => {
            if (isDisabled(options) || globalIgnoreEmulatedMouseEvents) {
              return;
            }
            if (!isTargetWithinCurrentTarget(event)) {
              return;
            }
            triggerHoverEnd(event, "mouse");
          },
          onTouchstart: () => {
            setGlobalIgnoreEmulatedMouseEvents();
          },
        },
    isHovered,
  };
}
