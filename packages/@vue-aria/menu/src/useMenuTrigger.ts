import { computed, toValue } from "vue";
import { useId } from "@vue-aria/ssr";
import type { MaybeReactive, ReadonlyRef } from "@vue-aria/types";
import type { FocusStrategy, UseMenuTriggerStateResult } from "./useMenuTriggerState";

export type MenuTriggerType = "press" | "longPress";

export interface UseMenuTriggerOptions {
  type?: MaybeReactive<"menu" | "listbox" | undefined>;
  isDisabled?: MaybeReactive<boolean | undefined>;
  trigger?: MaybeReactive<MenuTriggerType | undefined>;
}

export interface UseMenuTriggerResult {
  menuTriggerProps: ReadonlyRef<Record<string, unknown>>;
  menuProps: ReadonlyRef<Record<string, unknown>>;
}

function resolveBoolean(value: MaybeReactive<boolean | undefined> | undefined): boolean {
  if (value === undefined) {
    return false;
  }

  return Boolean(toValue(value));
}

function resolveType(
  value: MaybeReactive<"menu" | "listbox" | undefined> | undefined
): "menu" | "listbox" {
  if (value === undefined) {
    return "menu";
  }

  return toValue(value) ?? "menu";
}

function resolveTrigger(value: MaybeReactive<MenuTriggerType | undefined> | undefined): MenuTriggerType {
  if (value === undefined) {
    return "press";
  }

  return toValue(value) ?? "press";
}

function focusTarget(target: EventTarget | null): void {
  if (target instanceof HTMLElement) {
    target.focus();
  }
}

interface PressLikeEvent {
  pointerType: string;
  target: EventTarget | null;
}

interface LongPressLikeEvent {
  target: EventTarget | null;
}

export function useMenuTrigger(
  options: UseMenuTriggerOptions,
  state: UseMenuTriggerStateResult
): UseMenuTriggerResult {
  const type = computed(() => resolveType(options.type));
  const trigger = computed(() => resolveTrigger(options.trigger));
  const isDisabled = computed(() => resolveBoolean(options.isDisabled));

  const triggerId = useId(undefined, "v-aria-menu-trigger");
  const menuId = useId(undefined, "v-aria-menu");

  const openWithFocus = (focusStrategy: FocusStrategy) => {
    state.toggle(focusStrategy);
  };

  const onKeydown = (event: KeyboardEvent): void => {
    if (isDisabled.value) {
      return;
    }

    if (trigger.value === "longPress" && !event.altKey) {
      return;
    }

    switch (event.key) {
      case "Enter":
      case " ":
      case "ArrowDown": {
        if (trigger.value === "longPress" || event.defaultPrevented) {
          return;
        }

        event.preventDefault();
        openWithFocus("first");
        return;
      }
      case "ArrowUp":
        event.preventDefault();
        openWithFocus("last");
        return;
      default:
        return;
    }
  };

  const onPressStart = (event: PressLikeEvent): void => {
    if (isDisabled.value) {
      return;
    }

    if (event.pointerType === "touch" || event.pointerType === "keyboard") {
      return;
    }

    focusTarget(event.target);
    state.open(event.pointerType === "virtual" ? "first" : null);
  };

  const onPress = (event: PressLikeEvent): void => {
    if (isDisabled.value) {
      return;
    }

    if (event.pointerType !== "touch") {
      return;
    }

    focusTarget(event.target);
    state.toggle();
  };

  const onLongPressStart = (_event: LongPressLikeEvent): void => {
    if (isDisabled.value || trigger.value !== "longPress") {
      return;
    }

    state.close();
  };

  const onLongPress = (_event: LongPressLikeEvent): void => {
    if (isDisabled.value || trigger.value !== "longPress") {
      return;
    }

    state.open("first");
  };

  const onContextmenu = (event: MouseEvent): void => {
    if (isDisabled.value || trigger.value !== "longPress") {
      return;
    }

    event.preventDefault();
    focusTarget(event.target);
    state.open("first");
  };

  const menuTriggerProps = computed<Record<string, unknown>>(() => {
    const interactionProps =
      trigger.value === "press"
        ? { onPressStart, onPress }
        : { onLongPressStart, onLongPress, onContextmenu };

    return {
      ...interactionProps,
      id: triggerId.value,
      "aria-haspopup": type.value,
      "aria-expanded": state.isOpen.value,
      "aria-controls": state.isOpen.value ? menuId.value : undefined,
      isDisabled: isDisabled.value || undefined,
      onKeydown,
    };
  });

  const menuProps = computed<Record<string, unknown>>(() => ({
    id: menuId.value,
    "aria-labelledby": triggerId.value,
    autoFocus: (state.focusStrategy.value ?? true) as FocusStrategy | true,
    onClose: state.close,
  }));

  return {
    menuTriggerProps,
    menuProps,
  };
}
