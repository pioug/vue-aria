import type { MaybeReactive, ReadonlyRef } from "@vue-aria/types";
import { useTabList } from "./useTabList";
import type { UseTabListOptions } from "./useTabList";
import { useTabListState } from "./useTabListState";
import type {
  TabListItem,
  UseTabListStateOptions,
  UseTabListStateResult,
} from "./useTabListState";
import { useTabPanel } from "./useTabPanel";
import type { UseTabPanelOptions } from "./useTabPanel";

export interface UseTabsOptions<T extends TabListItem = TabListItem> {
  state: UseTabListStateOptions<T>;
  tabList: UseTabListOptions;
  tabPanel?: UseTabPanelOptions;
}

export interface UseTabsResult<T extends TabListItem = TabListItem> {
  state: UseTabListStateResult<T>;
  tabListProps: ReadonlyRef<Record<string, unknown>>;
  tabPanelProps: ReadonlyRef<Record<string, unknown>>;
}

export function useTabs<T extends TabListItem>(
  options: UseTabsOptions<T>,
  panelRef: MaybeReactive<Element | null | undefined>
): UseTabsResult<T> {
  const state = useTabListState(options.state);
  const { tabListProps } = useTabList(options.tabList, state);
  const { tabPanelProps } = useTabPanel(options.tabPanel ?? {}, state, panelRef);

  return {
    state,
    tabListProps,
    tabPanelProps,
  };
}
