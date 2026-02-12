/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {FocusStrategy, Key} from '@vue-types/shared';
import type {OverlayTriggerState} from '@vue-stately/overlays';
import {RootMenuTriggerState} from './useMenuTriggerState';
import {ref} from 'vue';

export interface SubmenuTriggerProps {
  /** Key of the trigger item. */
  triggerKey: Key
}

export interface SubmenuTriggerState extends OverlayTriggerState {
  /** Whether the submenu is currently open. */
  isOpen: boolean,
  /** Controls which item will be auto focused when the submenu opens. */
  focusStrategy: FocusStrategy | null,
  /** Opens the submenu. */
  open: (focusStrategy?: FocusStrategy | null) => void,
  /** Closes the submenu. */
  close: () => void,
  /** Closes all menus and submenus in the menu tree. */
  closeAll: () => void,
  /** The level of the submenu. */
  submenuLevel: number,
  /** Toggles the submenu. */
  toggle: (focusStrategy?: FocusStrategy | null) => void,
  /** @private */
  setOpen: () => void
}

/**
 * Manages state for a submenu trigger. Tracks whether the submenu is currently open, the level of the submenu, and
 * controls which item will receive focus when it opens.
 */
export function useSubmenuTriggerState(props: SubmenuTriggerProps, state: RootMenuTriggerState): SubmenuTriggerState {
  let {triggerKey} = props;
  let {openSubmenu, closeSubmenu, close: closeAll} = state;
  let submenuLevel = state.expandedKeysStack.length;
  let focusStrategy = ref<FocusStrategy | null>(null);

  let open = (focusStrategyValue?: FocusStrategy | null) => {
    focusStrategy.value = focusStrategyValue ?? null;
    openSubmenu(triggerKey, submenuLevel);
  };

  let close = () => {
    focusStrategy.value = null;
    closeSubmenu(triggerKey, submenuLevel);
  };

  let toggle = (focusStrategyValue?: FocusStrategy | null) => {
    focusStrategy.value = focusStrategyValue ?? null;
    if (state.expandedKeysStack[submenuLevel] === triggerKey) {
      close();
    } else {
      open(focusStrategyValue);
    }
  };

  return {
    get focusStrategy() {
      return focusStrategy.value;
    },
    get isOpen() {
      return state.expandedKeysStack[submenuLevel] === triggerKey;
    },
    open,
    close,
    closeAll,
    submenuLevel,
    // TODO: Placeholders that aren't used but give us parity with OverlayTriggerState so we can use this in Popover. Refactor if we update Popover via
    // https://github.com/adobe/react-spectrum/pull/4976#discussion_r1336472863
    setOpen: () => {},
    toggle
  };
}
