import type { Key } from "@vue-aria/collections";
import type { ListState } from "@vue-aria/list-state";
import { inject, provide, type InjectionKey, type Ref } from "vue";
import type { SpectrumRootMenuTriggerState } from "./types";

export interface MenuStateContextValue {
  state: ListState<object>;
  menuRef: Ref<HTMLElement | null>;
  submenuRef: Ref<HTMLElement | null>;
  rootMenuTriggerState?: SpectrumRootMenuTriggerState;
  submenuLevel: number;
}

const MenuStateContextSymbol: InjectionKey<MenuStateContextValue> = Symbol("SpectrumMenuStateContext");

export function provideMenuStateContext(value: MenuStateContextValue): void {
  provide(MenuStateContextSymbol, value);
}

export function useMenuStateContext(): MenuStateContextValue | null {
  return inject(MenuStateContextSymbol, null);
}

export interface SubmenuState {
  readonly isOpen: boolean;
  readonly submenuLevel: number;
  readonly focusStrategy: "first" | "last" | null;
  open(focusStrategy?: "first" | "last" | null): void;
  close(): void;
  closeAll(): void;
}

export function createSubmenuState(
  rootState: SpectrumRootMenuTriggerState,
  targetKey: Key,
  submenuLevel: number
): SubmenuState {
  return {
    get isOpen() {
      return rootState.expandedKeysStack[submenuLevel] === targetKey;
    },
    get submenuLevel() {
      return submenuLevel;
    },
    get focusStrategy() {
      return rootState.focusStrategy;
    },
    open(focusStrategy) {
      rootState.openSubmenu(targetKey, submenuLevel, focusStrategy);
    },
    close() {
      rootState.closeSubmenu(submenuLevel);
    },
    closeAll() {
      rootState.close();
    },
  };
}
