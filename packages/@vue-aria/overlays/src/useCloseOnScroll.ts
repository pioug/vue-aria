import { nodeContains } from "@vue-aria/utils";
import { toValue, watchEffect } from "vue";

export const onCloseMap: WeakMap<Element, () => void> = new WeakMap();

type MaybeGetter<T> = T | (() => T);

export interface CloseOnScrollOptions {
  triggerRef: MaybeGetter<{ current: Element | null }>;
  isOpen?: MaybeGetter<boolean | undefined>;
  onClose?: MaybeGetter<(() => void) | null | undefined>;
}

export function useCloseOnScroll(opts: CloseOnScrollOptions): void {
  watchEffect((onCleanup) => {
    const triggerRef = toValue(opts.triggerRef as any) as { current: Element | null } | undefined;
    const isOpen = toValue(opts.isOpen as any) as boolean | undefined;
    const onClose = toValue(opts.onClose as any) as (() => void) | null | undefined;

    if (!triggerRef || !isOpen || onClose === null) {
      return;
    }

    const onScroll = (e: Event) => {
      const target = e.target;
      if (!triggerRef.current || (target instanceof Node && !nodeContains(target, triggerRef.current))) {
        return;
      }

      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const onCloseHandler = onClose || onCloseMap.get(triggerRef.current);
      if (onCloseHandler) {
        onCloseHandler();
      }
    };

    window.addEventListener("scroll", onScroll, true);
    onCleanup(() => {
      window.removeEventListener("scroll", onScroll, true);
    });
  });
}
