import { getCurrentInstance, onBeforeUnmount } from "vue";
import { useOverlayTriggerState } from "@vue-stately/overlays";

export interface TooltipTriggerProps {
  delay?: number;
  closeDelay?: number;
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

export interface TooltipTriggerState {
  isOpen: boolean;
  open(immediate?: boolean): void;
  close(immediate?: boolean): void;
}

const TOOLTIP_DELAY = 1500;
const TOOLTIP_COOLDOWN = 500;

const tooltips: Record<string, (immediate?: boolean) => void> = {};
let tooltipId = 0;
let globalWarmedUp = false;
let globalWarmUpTimeout: ReturnType<typeof setTimeout> | null = null;
let globalCooldownTimeout: ReturnType<typeof setTimeout> | null = null;

export function useTooltipTriggerState(props: TooltipTriggerProps = {}): TooltipTriggerState {
  const { delay = TOOLTIP_DELAY, closeDelay = TOOLTIP_COOLDOWN } = props;
  const overlayState = useOverlayTriggerState(props);
  const id = `${++tooltipId}`;
  let closeTimeout: ReturnType<typeof setTimeout> | null = null;

  const ensureTooltipEntry = () => {
    tooltips[id] = hideTooltip;
  };

  const closeOpenTooltips = () => {
    for (const hideTooltipId in tooltips) {
      if (hideTooltipId !== id) {
        tooltips[hideTooltipId](true);
        delete tooltips[hideTooltipId];
      }
    }
  };

  const showTooltip = () => {
    if (closeTimeout) {
      clearTimeout(closeTimeout);
    }
    closeTimeout = null;
    closeOpenTooltips();
    ensureTooltipEntry();
    globalWarmedUp = true;
    overlayState.open();
    if (globalWarmUpTimeout) {
      clearTimeout(globalWarmUpTimeout);
      globalWarmUpTimeout = null;
    }
    if (globalCooldownTimeout) {
      clearTimeout(globalCooldownTimeout);
      globalCooldownTimeout = null;
    }
  };

  const hideTooltip = (immediate?: boolean) => {
    if (immediate || closeDelay <= 0) {
      if (closeTimeout) {
        clearTimeout(closeTimeout);
      }
      closeTimeout = null;
      overlayState.close();
    } else if (!closeTimeout) {
      closeTimeout = setTimeout(() => {
        closeTimeout = null;
        overlayState.close();
      }, closeDelay);
    }

    if (globalWarmUpTimeout) {
      clearTimeout(globalWarmUpTimeout);
      globalWarmUpTimeout = null;
    }
    if (globalWarmedUp) {
      if (globalCooldownTimeout) {
        clearTimeout(globalCooldownTimeout);
      }
      globalCooldownTimeout = setTimeout(() => {
        delete tooltips[id];
        globalCooldownTimeout = null;
        globalWarmedUp = false;
      }, Math.max(TOOLTIP_COOLDOWN, closeDelay));
    }
  };

  const warmupTooltip = () => {
    closeOpenTooltips();
    ensureTooltipEntry();
    if (!overlayState.isOpen && !globalWarmUpTimeout && !globalWarmedUp) {
      globalWarmUpTimeout = setTimeout(() => {
        globalWarmUpTimeout = null;
        globalWarmedUp = true;
        showTooltip();
      }, delay);
    } else if (!overlayState.isOpen) {
      showTooltip();
    }
  };

  if (getCurrentInstance()) {
    onBeforeUnmount(() => {
      if (closeTimeout) {
        clearTimeout(closeTimeout);
      }
      if (tooltips[id]) {
        delete tooltips[id];
      }
    });
  }

  return {
    get isOpen() {
      return overlayState.isOpen;
    },
    open(immediate) {
      if (!immediate && delay > 0 && !closeTimeout) {
        warmupTooltip();
      } else {
        showTooltip();
      }
    },
    close: hideTooltip,
  };
}

export function __resetTooltipGlobalStateForTests() {
  for (const id in tooltips) {
    delete tooltips[id];
  }
  tooltipId = 0;
  globalWarmedUp = false;
  if (globalWarmUpTimeout) {
    clearTimeout(globalWarmUpTimeout);
  }
  if (globalCooldownTimeout) {
    clearTimeout(globalCooldownTimeout);
  }
  globalWarmUpTimeout = null;
  globalCooldownTimeout = null;
}
