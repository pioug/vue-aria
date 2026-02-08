import { computed, toValue, watchEffect } from "vue";
import { useId } from "@vue-aria/ssr";
import type { MaybeReactive, ReadonlyRef } from "@vue-aria/types";
import type { UseOverlayTriggerStateResult } from "@vue-aria/overlays-state";
import { onCloseMap } from "./useCloseOnScroll";

export type OverlayTriggerType = "dialog" | "menu" | "listbox" | "tree" | "grid";

export interface UseOverlayTriggerOptions {
  type: MaybeReactive<OverlayTriggerType>;
}

export interface UseOverlayTriggerResult {
  triggerProps: ReadonlyRef<Record<string, unknown>>;
  overlayProps: ReadonlyRef<Record<string, unknown>>;
}

function resolveAriaHasPopup(type: OverlayTriggerType): boolean | "listbox" | undefined {
  if (type === "menu") {
    return true;
  }

  if (type === "listbox") {
    return "listbox";
  }

  return undefined;
}

export function useOverlayTrigger(
  options: UseOverlayTriggerOptions,
  state: UseOverlayTriggerStateResult,
  ref?: MaybeReactive<Element | null | undefined>
): UseOverlayTriggerResult {
  const overlayId = useId(undefined, "v-aria-overlay");

  watchEffect(() => {
    if (!ref) {
      return;
    }

    const element = toValue(ref);
    if (!element) {
      return;
    }

    onCloseMap.set(element, state.close);
  });

  const triggerProps = computed<Record<string, unknown>>(() => {
    const type = toValue(options.type);

    return {
      "aria-haspopup": resolveAriaHasPopup(type),
      "aria-expanded": state.isOpen.value,
      "aria-controls": state.isOpen.value ? overlayId.value : undefined,
      onPress: state.toggle,
      onClick: () => {
        state.toggle();
      },
    };
  });

  const overlayProps = computed<Record<string, unknown>>(() => ({
    id: overlayId.value,
  }));

  return {
    triggerProps,
    overlayProps,
  };
}
