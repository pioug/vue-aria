import { computed, ref, toValue } from "vue";
import type { Key, MaybeReactive, ReadonlyRef } from "@vue-aria/types";

export type FocusStrategy = "first" | "last" | null;

export interface UseMenuTriggerStateOptions {
  isOpen?: MaybeReactive<boolean | undefined>;
  defaultOpen?: MaybeReactive<boolean | undefined>;
  onOpenChange?: (isOpen: boolean) => void;
}

export interface UseMenuTriggerStateResult {
  isOpen: ReadonlyRef<boolean>;
  focusStrategy: ReadonlyRef<FocusStrategy>;
  expandedKeysStack: ReadonlyRef<Key[]>;
  open: (focusStrategy?: FocusStrategy) => void;
  close: () => void;
  toggle: (focusStrategy?: FocusStrategy) => void;
  openSubmenu: (triggerKey: Key, level: number) => void;
  closeSubmenu: (triggerKey: Key, level: number) => void;
}

function resolveBoolean(value: MaybeReactive<boolean | undefined> | undefined): boolean {
  if (value === undefined) {
    return false;
  }

  return Boolean(toValue(value));
}

export function useMenuTriggerState(
  options: UseMenuTriggerStateOptions = {}
): UseMenuTriggerStateResult {
  const isControlled = computed(() => options.isOpen !== undefined);
  const uncontrolledOpen = ref(resolveBoolean(options.defaultOpen));
  const focusStrategy = ref<FocusStrategy>(null);
  const expandedKeysStack = ref<Key[]>([]);

  const isOpen = computed(() => {
    if (isControlled.value) {
      return resolveBoolean(options.isOpen);
    }

    return uncontrolledOpen.value;
  });

  const setOpen = (nextOpen: boolean): void => {
    if (!isControlled.value) {
      uncontrolledOpen.value = nextOpen;
    }

    options.onOpenChange?.(nextOpen);
  };

  const open = (nextFocusStrategy: FocusStrategy = null): void => {
    focusStrategy.value = nextFocusStrategy;
    setOpen(true);
  };

  const close = (): void => {
    expandedKeysStack.value = [];
    setOpen(false);
  };

  const toggle = (nextFocusStrategy: FocusStrategy = null): void => {
    focusStrategy.value = nextFocusStrategy;
    setOpen(!isOpen.value);
  };

  const openSubmenu = (triggerKey: Key, level: number): void => {
    expandedKeysStack.value =
      level > expandedKeysStack.value.length
        ? expandedKeysStack.value
        : [...expandedKeysStack.value.slice(0, level), triggerKey];
  };

  const closeSubmenu = (triggerKey: Key, level: number): void => {
    const keyAtLevel = expandedKeysStack.value[level];
    if (keyAtLevel === triggerKey) {
      expandedKeysStack.value = expandedKeysStack.value.slice(0, level);
    }
  };

  return {
    isOpen,
    focusStrategy,
    expandedKeysStack,
    open,
    close,
    toggle,
    openSubmenu,
    closeSubmenu,
  };
}
