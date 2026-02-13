import { mergeProps, useLabels } from "@vue-aria/utils";
import { useHasTabbableChild } from "@vue-aria/focus";
import type { Key } from "@vue-aria/collections";
import type { TabListState } from "@vue-aria/tabs-state";
import { generateId } from "./utils";

export interface AriaTabPanelProps {
  id?: Key;
  "aria-describedby"?: string;
  "aria-details"?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
}

export interface TabPanelAria {
  tabPanelProps: Record<string, unknown>;
}

export function useTabPanel<T>(
  props: AriaTabPanelProps,
  state: TabListState<T> | null,
  ref: { current: Element | null }
): TabPanelAria {
  const tabIndex = useHasTabbableChild(ref) ? undefined : 0;
  const id = generateId(state, props.id ?? state?.selectedKey, "tabpanel");
  const tabPanelProps = useLabels({
    ...props,
    id,
    "aria-labelledby": generateId(state, state?.selectedKey, "tab"),
  });

  return {
    tabPanelProps: mergeProps(tabPanelProps, {
      tabIndex,
      role: "tabpanel",
      "aria-describedby": props["aria-describedby"],
      "aria-details": props["aria-details"],
    }) as Record<string, unknown>,
  };
}
