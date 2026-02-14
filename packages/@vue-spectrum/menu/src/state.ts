import { ref } from "vue";
import { useOverlayTriggerState } from "@vue-aria/overlays-state";
import type { Key } from "@vue-aria/collections";
import type { SpectrumMenuTriggerProps, SpectrumRootMenuTriggerState } from "./types";

export function useRootMenuTriggerState(props: SpectrumMenuTriggerProps): SpectrumRootMenuTriggerState {
  const overlayState = useOverlayTriggerState(props);
  const focusStrategyRef = ref<"first" | "last" | null>(null);
  const expandedKeysStackRef = ref<Key[]>([]);

  const clearSubmenuStack = () => {
    expandedKeysStackRef.value = [];
  };

  return {
    get isOpen() {
      return overlayState.isOpen;
    },
    get focusStrategy() {
      return focusStrategyRef.value;
    },
    get expandedKeysStack() {
      return expandedKeysStackRef.value;
    },
    open(focusStrategy = null) {
      focusStrategyRef.value = focusStrategy;
      overlayState.open();
    },
    close() {
      focusStrategyRef.value = null;
      clearSubmenuStack();
      overlayState.close();
    },
    toggle(focusStrategy = null) {
      focusStrategyRef.value = focusStrategy;
      if (overlayState.isOpen) {
        clearSubmenuStack();
      }
      overlayState.toggle();
    },
    openSubmenu(triggerKey, level, focusStrategy = null) {
      const next = expandedKeysStackRef.value.slice(0, level);
      next[level] = triggerKey;
      expandedKeysStackRef.value = next;
      focusStrategyRef.value = focusStrategy;
    },
    closeSubmenu(level) {
      expandedKeysStackRef.value = expandedKeysStackRef.value.slice(0, Math.max(level, 0));
    },
  };
}
