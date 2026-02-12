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

import {FocusStrategy, Key} from '@vue-types/shared';
import {MenuTriggerProps} from '@vue-types/menu';
import {OverlayTriggerState, useOverlayTriggerState} from '@vue-stately/overlays';
import {ref} from 'vue';

export interface MenuTriggerState extends OverlayTriggerState {
  /** Controls which item will be auto focused when the menu opens. */
  readonly focusStrategy: FocusStrategy | null,

  /** Opens the menu. */
  open(focusStrategy?: FocusStrategy | null): void,

  /** Toggles the menu. */
  toggle(focusStrategy?: FocusStrategy | null): void
}

export interface RootMenuTriggerState extends MenuTriggerState {
  /** Opens a specific submenu tied to a specific menu item at a specific level. */
  openSubmenu: (triggerKey: Key, level: number) => void,

  /** Closes a specific submenu tied to a specific menu item at a specific level. */
  closeSubmenu: (triggerKey: Key, level: number) => void,

  /** An array of open submenu trigger keys within the menu tree.
   * The index of key within array matches the submenu level in the tree.
   */
  expandedKeysStack: Key[],

  /** Closes the menu and all submenus in the menu tree. */
  close: () => void
}

/**
 * Manages state for a menu trigger. Tracks whether the menu is currently open,
 * and controls which item will receive focus when it opens. Also tracks the open submenus within
 * the menu tree via their trigger keys.
 */
export function useMenuTriggerState(props: MenuTriggerProps): RootMenuTriggerState {
  let overlayTriggerState = useOverlayTriggerState(props);
  let focusStrategy = ref<FocusStrategy | null>(null);
  let expandedKeysStack = ref<Key[]>([]);

  let closeAll = () => {
    expandedKeysStack.value = [];
    overlayTriggerState.close();
  };

  let openSubmenu = (triggerKey: Key, level: number) => {
    expandedKeysStack.value = ((oldStack) => {
      if (level > oldStack.length) {
        return oldStack;
      }

      return [...oldStack.slice(0, level), triggerKey];
    })(expandedKeysStack.value);
  };

  let closeSubmenu = (triggerKey: Key, level: number) => {
    expandedKeysStack.value = ((oldStack) => {
      let key = oldStack[level];
      if (key === triggerKey) {
        return oldStack.slice(0, level);
      }
      return oldStack;
    })(expandedKeysStack.value);
  };

  return {
    get focusStrategy() {
      return focusStrategy.value;
    },
    get isOpen() {
      return overlayTriggerState.isOpen;
    },
    setOpen: overlayTriggerState.setOpen,
    open(focusStrategyValue: FocusStrategy | null = null) {
      focusStrategy.value = focusStrategyValue;
      overlayTriggerState.open();
    },
    toggle(focusStrategyValue: FocusStrategy | null = null) {
      focusStrategy.value = focusStrategyValue;
      overlayTriggerState.toggle();
    },
    close() {
      closeAll();
    },
    get expandedKeysStack() {
      return expandedKeysStack.value;
    },
    openSubmenu,
    closeSubmenu
  };
}
