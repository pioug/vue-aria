import { nodeContains } from "@vue-aria/utils";
import { watchEffect } from "vue";

export const onCloseMap: WeakMap<Element, () => void> = new WeakMap();

export interface CloseOnScrollOptions {
  triggerRef: { current: Element | null };
  isOpen?: boolean;
  onClose?: (() => void) | null;
}

export function useCloseOnScroll(opts: CloseOnScrollOptions): void {
  watchEffect((onCleanup) => {
    const { triggerRef, isOpen, onClose } = opts;
    if (!isOpen || onClose === null) {
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
