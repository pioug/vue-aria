import { computed, ref } from "vue";
import type { Key, ReadonlyRef } from "@vue-aria/types";
import type { FocusStrategy, UseMenuTriggerStateResult } from "./useMenuTriggerState";

export interface UseSubmenuTriggerStateOptions {
  triggerKey: Key;
}

export interface UseSubmenuTriggerStateResult {
  isOpen: ReadonlyRef<boolean>;
  focusStrategy: ReadonlyRef<FocusStrategy>;
  submenuLevel: number;
  open: (focusStrategy?: FocusStrategy) => void;
  close: () => void;
  closeAll: () => void;
  toggle: (focusStrategy?: FocusStrategy) => void;
  setOpen: (isOpen: boolean) => void;
}

export function useSubmenuTriggerState(
  options: UseSubmenuTriggerStateOptions,
  state: UseMenuTriggerStateResult
): UseSubmenuTriggerStateResult {
  const submenuLevel = state.expandedKeysStack.value.length;
  const focusStrategy = ref<FocusStrategy>(null);

  const isOpen = computed(
    () => state.expandedKeysStack.value[submenuLevel] === options.triggerKey
  );

  const open = (nextFocusStrategy: FocusStrategy = null): void => {
    focusStrategy.value = nextFocusStrategy;
    state.openSubmenu(options.triggerKey, submenuLevel);
  };

  const close = (): void => {
    focusStrategy.value = null;
    state.closeSubmenu(options.triggerKey, submenuLevel);
  };

  const closeAll = (): void => {
    state.close();
  };

  const toggle = (nextFocusStrategy: FocusStrategy = null): void => {
    focusStrategy.value = nextFocusStrategy;
    if (isOpen.value) {
      close();
      return;
    }

    open(nextFocusStrategy);
  };

  const setOpen = (nextOpen: boolean): void => {
    if (nextOpen) {
      open();
      return;
    }

    close();
  };

  return {
    isOpen,
    focusStrategy,
    submenuLevel,
    open,
    close,
    closeAll,
    toggle,
    setOpen,
  };
}
