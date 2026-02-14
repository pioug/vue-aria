import { focusWithoutScrolling, nodeContains, useEvent, useId, useLayoutEffect } from "@vue-aria/utils";
import { useLocale } from "@vue-aria/i18n";
import { useSafelyMouseToSubmenu } from "./useSafelyMouseToSubmenu";

export interface AriaSubmenuTriggerProps {
  node?: unknown;
  isDisabled?: boolean;
  type?: "dialog" | "menu";
  parentMenuRef: { current: HTMLElement | null };
  submenuRef: { current: HTMLElement | null };
  delay?: number;
  shouldUseVirtualFocus?: boolean;
}

export interface SubmenuTriggerState {
  readonly isOpen: boolean;
  readonly submenuLevel: number;
  readonly focusStrategy?: "first" | "last" | null;
  open(focusStrategy?: "first" | "last" | null): void;
  close(): void;
  closeAll(): void;
}

interface SubmenuTriggerProps {
  id: string;
  "aria-controls": string | undefined;
  "aria-haspopup": "dialog" | "menu" | undefined;
  "aria-expanded": "true" | "false";
  onPressStart: (event: { pointerType: string }) => void;
  onPress: (event: { pointerType: string }) => void;
  onHoverChange: (isHovered: boolean) => void;
  onKeyDown: (event: KeyboardEvent & { continuePropagation?: () => void }) => void;
  isOpen: boolean;
}

interface SubmenuProps<T> {
  id: string;
  "aria-labelledby": string;
  submenuLevel: number;
  onClose?: () => void;
  autoFocus?: boolean | "first" | "last";
  onKeyDown?: (event: KeyboardEvent) => void;
  _type?: T;
}

export interface SubmenuTriggerAria<T> {
  submenuTriggerProps: SubmenuTriggerProps;
  submenuProps: SubmenuProps<T>;
  popoverProps: {
    isNonModal: true;
    shouldCloseOnInteractOutside: (target: Element) => boolean;
  };
}

export function useSubmenuTrigger<T>(
  props: AriaSubmenuTriggerProps,
  state: SubmenuTriggerState,
  ref: { current: HTMLElement | null }
): SubmenuTriggerAria<T> {
  const { parentMenuRef, submenuRef, type = "menu", isDisabled, delay = 200, shouldUseVirtualFocus } = props;
  const submenuTriggerId = useId();
  const overlayId = useId();
  const locale = useLocale();

  let openTimeout: ReturnType<typeof setTimeout> | undefined;
  const cancelOpenTimeout = () => {
    if (openTimeout) {
      clearTimeout(openTimeout);
      openTimeout = undefined;
    }
  };

  const onSubmenuOpen = (focusStrategy?: "first" | "last" | null) => {
    cancelOpenTimeout();
    state.open(focusStrategy);
  };

  const onSubmenuClose = () => {
    cancelOpenTimeout();
    state.close();
  };

  const isSmallScreenTrayMode = () => {
    if (typeof window === "undefined") {
      return false;
    }

    const width = window.screen?.width;
    return typeof width === "number" && width > 0 && width <= 700;
  };

  useLayoutEffect(() => {
    return () => {
      cancelOpenTimeout();
    };
  }, []);

  const submenuKeyDown = (event: KeyboardEvent) => {
    if (!nodeContains(event.currentTarget as Node | null, event.target as Node | null)) {
      return;
    }

    switch (event.key) {
      case "ArrowLeft":
        if (locale.value.direction === "ltr" && nodeContains(event.currentTarget as Node | null, event.target as Node | null)) {
          event.preventDefault();
          event.stopPropagation();
          onSubmenuClose();
          if (!shouldUseVirtualFocus && ref.current) {
            focusWithoutScrolling(ref.current);
          }
        }
        break;
      case "ArrowRight":
        if (locale.value.direction === "rtl" && nodeContains(event.currentTarget as Node | null, event.target as Node | null)) {
          event.preventDefault();
          event.stopPropagation();
          onSubmenuClose();
          if (!shouldUseVirtualFocus && ref.current) {
            focusWithoutScrolling(ref.current);
          }
        }
        break;
      case "Escape":
        if (nodeContains(submenuRef.current, event.target as Node | null)) {
          event.stopPropagation();
          onSubmenuClose();
          if (!shouldUseVirtualFocus && ref.current) {
            focusWithoutScrolling(ref.current);
          }
        }
        break;
    }
  };

  const submenuProps: SubmenuProps<T> = {
    id: overlayId,
    "aria-labelledby": submenuTriggerId,
    submenuLevel: state.submenuLevel,
    ...(type === "menu"
      ? {
          onClose: state.closeAll,
          autoFocus: state.focusStrategy ?? undefined,
          onKeyDown: submenuKeyDown,
        }
      : {}),
  };

  const submenuTriggerKeyDown = (event: KeyboardEvent & { continuePropagation?: () => void }) => {
    switch (event.key) {
      case "ArrowRight":
        if (!isDisabled) {
          if (locale.value.direction === "ltr") {
            event.preventDefault();
            if (!state.isOpen) {
              onSubmenuOpen("first");
            }

            if (type === "menu" && submenuRef.current && document.activeElement === ref.current) {
              focusWithoutScrolling(submenuRef.current);
            }
          } else if (state.isOpen) {
            onSubmenuClose();
          } else {
            event.continuePropagation?.();
          }
        }
        break;
      case "ArrowLeft":
        if (!isDisabled) {
          if (locale.value.direction === "rtl") {
            event.preventDefault();
            if (!state.isOpen) {
              onSubmenuOpen("first");
            }

            if (type === "menu" && submenuRef.current && document.activeElement === ref.current) {
              focusWithoutScrolling(submenuRef.current);
            }
          } else if (state.isOpen) {
            onSubmenuClose();
          } else {
            event.continuePropagation?.();
          }
        }
        break;
      default:
        event.continuePropagation?.();
        break;
    }
  };

  const onPressStart = (event: { pointerType: string }) => {
    if (!isDisabled && (event.pointerType === "virtual" || event.pointerType === "keyboard")) {
      onSubmenuOpen("first");
    }
  };

  const onPress = (event: { pointerType: string }) => {
    if (!isDisabled && (event.pointerType === "touch" || event.pointerType === "mouse")) {
      onSubmenuOpen();
    }
  };

  const onHoverChange = (isHovered: boolean) => {
    if (!isDisabled) {
      if (isSmallScreenTrayMode()) {
        cancelOpenTimeout();
        return;
      }

      if (isHovered && !state.isOpen) {
        if (!openTimeout) {
          openTimeout = setTimeout(() => {
            onSubmenuOpen();
          }, delay);
        }
      } else if (!isHovered) {
        cancelOpenTimeout();
      }
    }
  };

  const parentMenuRefObject = {
    get value() {
      return parentMenuRef.current;
    },
    set value(value: HTMLElement | null) {
      parentMenuRef.current = value;
    },
  };

  useEvent(parentMenuRefObject as any, "focusin", (event: Event) => {
    if (state.isOpen && nodeContains(parentMenuRef.current, event.target as Node | null) && event.target !== ref.current) {
      onSubmenuClose();
    }
  });

  useEvent(parentMenuRefObject as any, "pointerover", (event: Event) => {
    if (!state.isOpen) {
      return;
    }

    const target = event.target as Node | null;
    if (!nodeContains(parentMenuRef.current, target)) {
      return;
    }

    const triggerElement = ref.current;
    if (triggerElement && (target === triggerElement || nodeContains(triggerElement, target))) {
      return;
    }

    onSubmenuClose();
  });

  const shouldCloseOnInteractOutside = (target: Element) => target !== ref.current;

  useSafelyMouseToSubmenu({
    menuRef: parentMenuRef,
    submenuRef,
    isOpen: state.isOpen,
    isDisabled,
  });

  return {
    submenuTriggerProps: {
      id: submenuTriggerId,
      get "aria-controls"() {
        return state.isOpen ? overlayId : undefined;
      },
      "aria-haspopup": type,
      get "aria-expanded"() {
        return state.isOpen ? "true" : "false";
      },
      onPressStart,
      onPress,
      onHoverChange,
      onKeyDown: submenuTriggerKeyDown,
      get isOpen() {
        return state.isOpen;
      },
    },
    submenuProps,
    popoverProps: {
      isNonModal: true,
      shouldCloseOnInteractOutside,
    },
  };
}
