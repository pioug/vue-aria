import { computed, toValue, watchEffect } from "vue";
import type { MaybeReactive } from "@vue-aria/types";
import { nodeContains } from "@vue-aria/utils";

export const onCloseMap: WeakMap<Element, () => void> = new WeakMap();

export interface UseCloseOnScrollOptions {
  triggerRef: MaybeReactive<Element | null | undefined>;
  isOpen?: MaybeReactive<boolean | undefined>;
  onClose?: (() => void) | null;
}

function resolveBoolean(value: MaybeReactive<boolean | undefined> | undefined): boolean {
  if (value === undefined) {
    return false;
  }

  return Boolean(toValue(value));
}

function isTriggerAffectedByScroll(
  scrollTarget: EventTarget | null,
  trigger: Element
): boolean {
  if (scrollTarget === window) {
    return true;
  }

  if (!(scrollTarget instanceof Node)) {
    return true;
  }

  return nodeContains(scrollTarget, trigger);
}

export function useCloseOnScroll(options: UseCloseOnScrollOptions): void {
  const isOpen = computed(() => resolveBoolean(options.isOpen));

  watchEffect((onCleanup) => {
    if (!isOpen.value || options.onClose === null) {
      return;
    }

    const trigger = toValue(options.triggerRef);
    if (!trigger) {
      return;
    }

    const closeHandler = options.onClose ?? onCloseMap.get(trigger);
    if (!closeHandler) {
      return;
    }

    const onScroll = (event: Event): void => {
      const target = event.target;
      if (!isTriggerAffectedByScroll(target, trigger)) {
        return;
      }

      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
        return;
      }

      closeHandler();
    };

    window.addEventListener("scroll", onScroll, true);

    onCleanup(() => {
      window.removeEventListener("scroll", onScroll, true);
    });
  });
}
