import { computed, toValue } from "vue";
import type { MaybeReactive, ReadonlyRef } from "@vue-aria/types";
import type { TabListItem, UseTabListStateResult } from "./useTabListState";
import { generateId } from "./utils";

const TABBABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(", ");

export interface UseTabPanelOptions {
  id?: MaybeReactive<string | undefined>;
  "aria-label"?: MaybeReactive<string | undefined>;
  "aria-labelledby"?: MaybeReactive<string | undefined>;
  "aria-describedby"?: MaybeReactive<string | undefined>;
  "aria-details"?: MaybeReactive<string | undefined>;
}

export interface UseTabPanelResult {
  tabPanelProps: ReadonlyRef<Record<string, unknown>>;
}

function hasTabbableChild(element: Element | null | undefined): boolean {
  if (!element) {
    return false;
  }

  return Boolean(element.querySelector(TABBABLE_SELECTOR));
}

export function useTabPanel<T extends TabListItem>(
  options: UseTabPanelOptions = {},
  state: UseTabListStateResult<T> | null,
  panelRef: MaybeReactive<Element | null | undefined>
): UseTabPanelResult {
  const tabPanelProps = computed<Record<string, unknown>>(() => {
    const selectedKey = state?.selectedKey.value ?? null;
    const panelKey = options.id === undefined ? selectedKey : toValue(options.id);
    const panelId = generateId(state, panelKey, "tabpanel");
    const labelledBy =
      options["aria-labelledby"] === undefined
        ? generateId(state, selectedKey, "tab")
        : (toValue(options["aria-labelledby"]) ?? generateId(state, selectedKey, "tab"));
    const panelElement = toValue(panelRef);

    return {
      id: panelId,
      role: "tabpanel",
      tabIndex: hasTabbableChild(panelElement) ? undefined : 0,
      "aria-labelledby": labelledBy,
      "aria-label":
        options["aria-label"] === undefined
          ? undefined
          : toValue(options["aria-label"]),
      "aria-describedby":
        options["aria-describedby"] === undefined
          ? undefined
          : toValue(options["aria-describedby"]),
      "aria-details":
        options["aria-details"] === undefined
          ? undefined
          : toValue(options["aria-details"]),
    };
  });

  return {
    tabPanelProps,
  };
}
