import { useId } from "@vue-aria/utils";
import { watchEffect } from "vue";
import { onCloseMap } from "./useCloseOnScroll";
import type { OverlayTriggerState } from "@vue-aria/overlays-state";

export interface OverlayTriggerProps {
  type: "dialog" | "menu" | "listbox" | "tree" | "grid";
}

export interface OverlayTriggerAria {
  triggerProps: Record<string, unknown>;
  overlayProps: Record<string, unknown>;
}

export function useOverlayTrigger(
  props: OverlayTriggerProps,
  state: OverlayTriggerState,
  ref?: { current: Element | null }
): OverlayTriggerAria {
  watchEffect(() => {
    if (ref?.current) {
      onCloseMap.set(ref.current, state.close);
    }
  });

  let ariaHasPopup: undefined | boolean | "listbox" = undefined;
  if (props.type === "menu") {
    ariaHasPopup = true;
  } else if (props.type === "listbox") {
    ariaHasPopup = "listbox";
  }

  const overlayId = useId();

  return {
    triggerProps: {
      "aria-haspopup": ariaHasPopup,
      "aria-expanded": state.isOpen,
      "aria-controls": state.isOpen ? overlayId : undefined,
      onPress: state.toggle,
    },
    overlayProps: {
      id: overlayId,
    },
  };
}
