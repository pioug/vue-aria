import { computed, onScopeDispose, toValue, watchEffect } from "vue";
import { useId } from "@vue-aria/ssr";
import { nodeContains } from "@vue-aria/utils";
import type { MaybeReactive, ReadonlyRef } from "@vue-aria/types";
import type { FocusStrategy } from "./useMenuTriggerState";
import type { UseSubmenuTriggerStateResult } from "./useSubmenuTriggerState";

type Direction = "ltr" | "rtl";

export interface UseSubmenuTriggerOptions {
  parentMenuRef: MaybeReactive<HTMLElement | null | undefined>;
  submenuRef: MaybeReactive<HTMLElement | null | undefined>;
  isDisabled?: MaybeReactive<boolean | undefined>;
  type?: MaybeReactive<"dialog" | "menu" | undefined>;
  delay?: MaybeReactive<number | undefined>;
  shouldUseVirtualFocus?: MaybeReactive<boolean | undefined>;
  direction?: MaybeReactive<Direction | undefined>;
}

export interface UseSubmenuTriggerResult {
  submenuTriggerProps: ReadonlyRef<Record<string, unknown>>;
  submenuProps: ReadonlyRef<Record<string, unknown>>;
  popoverProps: ReadonlyRef<Record<string, unknown>>;
}

function resolveBoolean(value: MaybeReactive<boolean | undefined> | undefined): boolean {
  if (value === undefined) {
    return false;
  }

  return Boolean(toValue(value));
}

function resolveDelay(value: MaybeReactive<number | undefined> | undefined): number {
  if (value === undefined) {
    return 200;
  }

  const resolved = Number(toValue(value));
  if (!Number.isFinite(resolved) || resolved < 0) {
    return 200;
  }

  return resolved;
}

function resolveDirection(
  value: MaybeReactive<Direction | undefined> | undefined
): Direction {
  if (value === undefined) {
    return "ltr";
  }

  return toValue(value) ?? "ltr";
}

function resolveType(
  value: MaybeReactive<"dialog" | "menu" | undefined> | undefined
): "dialog" | "menu" {
  if (value === undefined) {
    return "menu";
  }

  return toValue(value) ?? "menu";
}

function focusElement(element: HTMLElement | null | undefined): void {
  if (element) {
    element.focus();
  }
}

interface PressLikeEvent {
  pointerType: string;
}

export function useSubmenuTrigger(
  options: UseSubmenuTriggerOptions,
  state: UseSubmenuTriggerStateResult,
  ref: MaybeReactive<HTMLElement | null | undefined>
): UseSubmenuTriggerResult {
  const triggerId = useId(undefined, "v-aria-submenu-trigger");
  const overlayId = useId(undefined, "v-aria-submenu");

  const isDisabled = computed(() => resolveBoolean(options.isDisabled));
  const direction = computed(() => resolveDirection(options.direction));
  const type = computed(() => resolveType(options.type));

  let openTimeout: ReturnType<typeof setTimeout> | undefined;
  const cancelOpenTimeout = (): void => {
    if (openTimeout !== undefined) {
      clearTimeout(openTimeout);
      openTimeout = undefined;
    }
  };

  const openSubmenu = (focusStrategy: FocusStrategy = null): void => {
    cancelOpenTimeout();
    state.open(focusStrategy);
  };

  const closeSubmenu = (): void => {
    cancelOpenTimeout();
    state.close();
  };

  onScopeDispose(() => {
    cancelOpenTimeout();
  });

  const submenuKeydown = (event: KeyboardEvent): void => {
    const submenuElement = toValue(options.submenuRef);
    const triggerElement = toValue(ref);
    if (!submenuElement || !nodeContains(submenuElement, document.activeElement)) {
      return;
    }

    switch (event.key) {
      case "ArrowLeft":
        if (direction.value === "ltr" && nodeContains(submenuElement, event.target)) {
          event.preventDefault();
          event.stopPropagation();
          closeSubmenu();
          if (!resolveBoolean(options.shouldUseVirtualFocus)) {
            focusElement(triggerElement);
          }
        }
        break;
      case "ArrowRight":
        if (direction.value === "rtl" && nodeContains(submenuElement, event.target)) {
          event.preventDefault();
          event.stopPropagation();
          closeSubmenu();
          if (!resolveBoolean(options.shouldUseVirtualFocus)) {
            focusElement(triggerElement);
          }
        }
        break;
      case "Escape":
        if (nodeContains(submenuElement, event.target)) {
          event.stopPropagation();
          closeSubmenu();
          if (!resolveBoolean(options.shouldUseVirtualFocus)) {
            focusElement(triggerElement);
          }
        }
        break;
      default:
        break;
    }
  };

  const submenuTriggerKeydown = (event: KeyboardEvent): void => {
    if (isDisabled.value) {
      return;
    }

    const submenuElement = toValue(options.submenuRef);
    const triggerElement = toValue(ref);

    switch (event.key) {
      case "ArrowRight":
        if (direction.value === "ltr") {
          event.preventDefault();
          if (!state.isOpen.value) {
            openSubmenu("first");
          }

          if (
            type.value === "menu" &&
            submenuElement &&
            triggerElement &&
            document.activeElement === triggerElement
          ) {
            focusElement(submenuElement);
          }
        } else if (state.isOpen.value) {
          closeSubmenu();
        }
        break;
      case "ArrowLeft":
        if (direction.value === "rtl") {
          event.preventDefault();
          if (!state.isOpen.value) {
            openSubmenu("first");
          }

          if (
            type.value === "menu" &&
            submenuElement &&
            triggerElement &&
            document.activeElement === triggerElement
          ) {
            focusElement(submenuElement);
          }
        } else if (state.isOpen.value) {
          closeSubmenu();
        }
        break;
      default:
        break;
    }
  };

  const onPressStart = (event: PressLikeEvent): void => {
    if (isDisabled.value) {
      return;
    }

    if (event.pointerType === "virtual" || event.pointerType === "keyboard") {
      openSubmenu("first");
    }
  };

  const onPress = (event: PressLikeEvent): void => {
    if (isDisabled.value) {
      return;
    }

    if (event.pointerType === "touch" || event.pointerType === "mouse") {
      openSubmenu();
    }
  };

  const onHoverChange = (isHovered: boolean): void => {
    if (isDisabled.value) {
      return;
    }

    if (isHovered && !state.isOpen.value) {
      if (openTimeout !== undefined) {
        return;
      }

      openTimeout = setTimeout(() => {
        openTimeout = undefined;
        openSubmenu();
      }, resolveDelay(options.delay));
      return;
    }

    cancelOpenTimeout();
  };

  watchEffect((onCleanup) => {
    const parentMenuElement = toValue(options.parentMenuRef);
    const triggerElement = toValue(ref);
    if (!parentMenuElement) {
      return;
    }

    const onFocusIn = (event: FocusEvent): void => {
      if (
        state.isOpen.value &&
        nodeContains(parentMenuElement, event.target) &&
        event.target !== triggerElement
      ) {
        closeSubmenu();
      }
    };

    parentMenuElement.addEventListener("focusin", onFocusIn);
    onCleanup(() => {
      parentMenuElement.removeEventListener("focusin", onFocusIn);
    });
  });

  const popoverProps = computed<Record<string, unknown>>(() => ({
    isNonModal: true,
    shouldCloseOnInteractOutside: (target: Element) => target !== toValue(ref),
  }));

  const submenuProps = computed<Record<string, unknown>>(() => {
    const props: Record<string, unknown> = {
      id: overlayId.value,
      "aria-labelledby": triggerId.value,
      submenuLevel: state.submenuLevel,
    };

    if (type.value === "menu") {
      props.onClose = state.closeAll;
      props.autoFocus = state.focusStrategy.value ?? undefined;
      props.onKeydown = submenuKeydown;
    }

    return props;
  });

  const submenuTriggerProps = computed<Record<string, unknown>>(() => ({
    id: triggerId.value,
    "aria-controls": state.isOpen.value ? overlayId.value : undefined,
    "aria-haspopup": isDisabled.value ? undefined : type.value,
    "aria-expanded": state.isOpen.value ? "true" : "false",
    onPressStart,
    onPress,
    onHoverChange,
    onKeydown: submenuTriggerKeydown,
    isOpen: state.isOpen.value,
  }));

  return {
    submenuTriggerProps,
    submenuProps,
    popoverProps,
  };
}
