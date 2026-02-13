import { focusWithoutScrolling, useId } from "@vue-aria/utils";
import { useLongPress, type PressProps } from "@vue-aria/interactions";
import { useOverlayTrigger } from "@vue-aria/overlays";
import type { AriaMenuOptions } from "./useMenu";

export interface AriaMenuTriggerProps {
  type?: "menu" | "listbox";
  isDisabled?: boolean;
  trigger?: "press" | "longPress";
}

export interface MenuTriggerState {
  readonly isOpen: boolean;
  readonly focusStrategy?: "first" | "last" | null;
  open(focusStrategy?: "first" | "last" | null): void;
  close(): void;
  toggle(focusStrategy?: "first" | "last" | null): void;
}

export interface MenuTriggerAria<T> {
  menuTriggerProps: Record<string, unknown>;
  menuProps: AriaMenuOptions<T>;
}

function isDefaultPrevented(event: KeyboardEvent & { isDefaultPrevented?: () => boolean }) {
  if (typeof event.isDefaultPrevented === "function") {
    return event.isDefaultPrevented();
  }

  return event.defaultPrevented;
}

export function useMenuTrigger<T>(
  props: AriaMenuTriggerProps,
  state: MenuTriggerState,
  ref: { current: Element | null }
): MenuTriggerAria<T> {
  const { type = "menu", isDisabled, trigger = "press" } = props;

  const menuTriggerId = useId();
  const { triggerProps, overlayProps } = useOverlayTrigger({ type }, state as any, ref);

  const onKeyDown = (event: KeyboardEvent & { continuePropagation?: () => void; isDefaultPrevented?: () => boolean }) => {
    if (isDisabled) {
      return;
    }

    if (trigger === "longPress" && !event.altKey) {
      return;
    }

    if (!ref?.current) {
      return;
    }

    switch (event.key) {
      case "Enter":
      case " ": {
        if (trigger === "longPress" || isDefaultPrevented(event)) {
          return;
        }
      }
      // fallthrough
      case "ArrowDown": {
        if (!("continuePropagation" in event)) {
          event.stopPropagation();
        }
        event.preventDefault();
        state.toggle("first");
        break;
      }
      case "ArrowUp": {
        if (!("continuePropagation" in event)) {
          event.stopPropagation();
        }
        event.preventDefault();
        state.toggle("last");
        break;
      }
      default:
        if ("continuePropagation" in event) {
          event.continuePropagation?.();
        }
    }
  };

  const { longPressProps } = useLongPress({
    isDisabled: isDisabled || trigger !== "longPress",
    accessibilityDescription: "Long press to open menu",
    onLongPressStart() {
      state.close();
    },
    onLongPress() {
      state.open("first");
    },
  });

  const pressProps: PressProps = {
    preventFocusOnPress: true,
    onPressStart(event) {
      if (event.pointerType !== "touch" && event.pointerType !== "keyboard" && !isDisabled) {
        focusWithoutScrolling(event.target as HTMLElement);
        state.open(event.pointerType === "virtual" ? "first" : null);
      }
    },
    onPress(event) {
      if (event.pointerType === "touch" && !isDisabled) {
        focusWithoutScrolling(event.target as HTMLElement);
        state.toggle();
      }
    },
  };

  delete (triggerProps as { onPress?: unknown }).onPress;

  return {
    menuTriggerProps: {
      ...triggerProps,
      ...(trigger === "press" ? pressProps : longPressProps),
      id: menuTriggerId,
      onKeydown: onKeyDown,
      onKeyDown,
    },
    menuProps: {
      ...(overlayProps as any),
      "aria-labelledby": menuTriggerId,
      autoFocus: (state.focusStrategy || true) as any,
      onClose: state.close,
    },
  };
}
