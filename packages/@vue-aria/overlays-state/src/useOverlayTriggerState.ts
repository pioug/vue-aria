import { computed, ref, toValue } from "vue";
import type { MaybeReactive, ReadonlyRef } from "@vue-aria/types";

export interface UseOverlayTriggerStateOptions {
  isOpen?: MaybeReactive<boolean | undefined>;
  defaultOpen?: MaybeReactive<boolean | undefined>;
  onOpenChange?: (isOpen: boolean) => void;
}

export interface UseOverlayTriggerStateResult {
  isOpen: ReadonlyRef<boolean>;
  setOpen: (isOpen: boolean) => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

function resolveBoolean(value: MaybeReactive<boolean | undefined> | undefined): boolean {
  if (value === undefined) {
    return false;
  }

  return Boolean(toValue(value));
}

export function useOverlayTriggerState(
  options: UseOverlayTriggerStateOptions = {}
): UseOverlayTriggerStateResult {
  const uncontrolledOpen = ref(resolveBoolean(options.defaultOpen));
  const isControlled = computed(() => options.isOpen !== undefined);

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

  const open = (): void => {
    setOpen(true);
  };

  const close = (): void => {
    setOpen(false);
  };

  const toggle = (): void => {
    setOpen(!isOpen.value);
  };

  return {
    isOpen,
    setOpen,
    open,
    close,
    toggle,
  };
}
