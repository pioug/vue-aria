import { getCurrentInstance, nextTick, onBeforeUnmount, onMounted, watch } from "vue";
import { useId } from "@vue-aria/utils";
import { useIsSSR } from "@vue-aria/ssr";
import type { DisclosureState } from "@vue-stately/disclosure";

export interface AriaDisclosureProps {
  isDisabled?: boolean;
  isExpanded?: boolean;
}

export interface DisclosureAria {
  buttonProps: Record<string, unknown>;
  panelProps: Record<string, unknown>;
}

export function useDisclosure(
  props: AriaDisclosureProps,
  state: DisclosureState,
  ref: { current: HTMLElement | null }
): DisclosureAria {
  const { isDisabled } = props;
  const triggerId = useId();
  const panelId = useId();
  const isSSR = useIsSSR();
  let raf: number | null = null;
  const hasInstance = Boolean(getCurrentInstance());
  let clickFallbackHandled = false;

  const markClickHandled = () => {
    clickFallbackHandled = true;
    queueMicrotask(() => {
      clickFallbackHandled = false;
    });
  };

  const syncPanelAttributes = () => {
    if (!ref.current || isSSR) {
      return;
    }

    const panel = ref.current;
    if (state.isExpanded) {
      panel.removeAttribute("hidden");
      panel.style.setProperty("--disclosure-panel-width", "auto");
      panel.style.setProperty("--disclosure-panel-height", "auto");
    } else {
      panel.setAttribute("hidden", "until-found");
      panel.style.setProperty("--disclosure-panel-width", "0px");
      panel.style.setProperty("--disclosure-panel-height", "0px");
    }
  };

  const handleBeforeMatch = async () => {
    raf = requestAnimationFrame(() => {
      if (ref.current) {
        ref.current.setAttribute("hidden", "until-found");
      }
    });

    state.toggle();
    await nextTick();
  };

  if (hasInstance) {
    onMounted(() => {
      if (ref.current) {
        ref.current.addEventListener("beforematch", handleBeforeMatch as EventListener);
      }
      syncPanelAttributes();
    });
  } else if (ref.current) {
    ref.current.addEventListener("beforematch", handleBeforeMatch as EventListener);
    syncPanelAttributes();
  }

  watch(
    () => state.isExpanded,
    () => {
      syncPanelAttributes();
    }
  );

  if (hasInstance) {
    onBeforeUnmount(() => {
      if (raf) {
        cancelAnimationFrame(raf);
      }
      ref.current?.removeEventListener("beforematch", handleBeforeMatch as EventListener);
    });
  }

  const buttonProps: Record<string, unknown> = {
    id: triggerId,
    "aria-controls": panelId,
    onPress: (event: { pointerType: string }) => {
      if (!isDisabled && event.pointerType !== "keyboard") {
        state.toggle();
        markClickHandled();
      }
    },
    isDisabled,
    onPressStart: (event: { pointerType: string }) => {
      if (event.pointerType === "keyboard" && !isDisabled) {
        state.toggle();
        markClickHandled();
      }
    },
    onClick: () => {
      if (!isDisabled && !clickFallbackHandled) {
        state.toggle();
      }
      clickFallbackHandled = false;
    },
  };

  Object.defineProperty(buttonProps, "aria-expanded", {
    enumerable: true,
    configurable: true,
    get: () => state.isExpanded,
  });

  const panelProps: Record<string, unknown> = {
    id: panelId,
    role: "group",
    "aria-labelledby": triggerId,
  };

  Object.defineProperty(panelProps, "aria-hidden", {
    enumerable: true,
    configurable: true,
    get: () => !state.isExpanded,
  });

  Object.defineProperty(panelProps, "hidden", {
    enumerable: true,
    configurable: true,
    get: () => (isSSR ? !state.isExpanded : undefined),
  });

  return {
    buttonProps,
    panelProps,
  };
}
