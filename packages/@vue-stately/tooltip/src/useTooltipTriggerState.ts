/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {TooltipTriggerProps} from '@vue-types/tooltip';
import {onScopeDispose, ref} from 'vue';
import {useOverlayTriggerState} from '@vue-stately/overlays';

const TOOLTIP_DELAY = 1500; // this seems to be a 1.5 second delay, check with design
const TOOLTIP_COOLDOWN = 500;

export interface TooltipTriggerState {
  /** Whether the tooltip is currently showing. */
  isOpen: boolean,
  /**
   * Shows the tooltip. By default, the tooltip becomes visible after a delay
   * depending on a global warmup timer. The `immediate` option shows the
   * tooltip immediately instead.
   */
  open(immediate?: boolean): void,
  /** Hides the tooltip. */
  close(immediate?: boolean): void
}

let tooltips = {} as Record<string, (immediate?: boolean) => void>;
let tooltipId = 0;
let globalWarmedUp = false;
let globalWarmUpTimeout: ReturnType<typeof setTimeout> | null = null;
let globalCooldownTimeout: ReturnType<typeof setTimeout> | null = null;

/**
 * Manages state for a tooltip trigger. Tracks whether the tooltip is open, and provides
 * methods to toggle this state. Ensures only one tooltip is open at a time and controls
 * the delay for showing a tooltip.
 */
export function useTooltipTriggerState(props: TooltipTriggerProps = {}): TooltipTriggerState {
  let {delay = TOOLTIP_DELAY, closeDelay = TOOLTIP_COOLDOWN} = props;
  let {isOpen, open, close} = useOverlayTriggerState(props);
  let id = `${++tooltipId}`;
  let closeTimeout = ref<ReturnType<typeof setTimeout> | null>(null);

  let ensureTooltipEntry = () => {
    tooltips[id] = hideTooltip;
  };

  let closeOpenTooltips = () => {
    for (let hideTooltipId in tooltips) {
      if (hideTooltipId !== id) {
        tooltips[hideTooltipId](true);
        delete tooltips[hideTooltipId];
      }
    }
  };

  let showTooltip = () => {
    if (closeTimeout.value) {
      clearTimeout(closeTimeout.value);
    }
    closeTimeout.value = null;
    closeOpenTooltips();
    ensureTooltipEntry();
    globalWarmedUp = true;
    open();
    if (globalWarmUpTimeout) {
      clearTimeout(globalWarmUpTimeout);
      globalWarmUpTimeout = null;
    }
    if (globalCooldownTimeout) {
      clearTimeout(globalCooldownTimeout);
      globalCooldownTimeout = null;
    }
  };

  let hideTooltip = (immediate?: boolean) => {
    if (immediate || closeDelay <= 0) {
      if (closeTimeout.value) {
        clearTimeout(closeTimeout.value);
      }
      closeTimeout.value = null;
      close();
    } else if (!closeTimeout.value) {
      closeTimeout.value = setTimeout(() => {
        closeTimeout.value = null;
        close();
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

  let warmupTooltip = () => {
    closeOpenTooltips();
    ensureTooltipEntry();
    if (!isOpen && !globalWarmUpTimeout && !globalWarmedUp) {
      globalWarmUpTimeout = setTimeout(() => {
        globalWarmUpTimeout = null;
        globalWarmedUp = true;
        showTooltip();
      }, delay);
    } else if (!isOpen) {
      showTooltip();
    }
  };

  onScopeDispose(() => {
    if (closeTimeout.value) {
      clearTimeout(closeTimeout.value);
    }
    if (tooltips[id]) {
      delete tooltips[id];
    }
  });

  return {
    get isOpen() {
      return isOpen;
    },
    open: (immediate) => {
      if (!immediate && delay > 0 && !closeTimeout.value) {
        warmupTooltip();
      } else {
        showTooltip();
      }
    },
    close: hideTooltip
  };
}
