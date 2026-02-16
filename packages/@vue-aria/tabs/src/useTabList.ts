import { mergeProps, useId, useLabels } from "@vue-aria/utils";
import { useLocale } from "@vue-aria/i18n";
import { useSelectableCollection } from "@vue-aria/selection";
import type { Key } from "@vue-aria/collections";
import type { TabListState } from "@vue-stately/tabs";
import { TabsKeyboardDelegate } from "./TabsKeyboardDelegate";
import { tabsIds } from "./utils";

export interface AriaTabListOptions<T> {
  orientation?: "horizontal" | "vertical";
  keyboardActivation?: "automatic" | "manual";
  "aria-label"?: string;
  "aria-labelledby"?: string;
  id?: string;
  isDisabled?: boolean;
  disabledKeys?: Iterable<Key>;
  selectedKey?: Key | null;
  defaultSelectedKey?: Key | null;
  onSelectionChange?: (key: Key) => void;
  [key: string]: unknown;
}

export interface TabListAria {
  tabListProps: Record<string, unknown>;
}

export function useTabList<T>(
  props: AriaTabListOptions<T>,
  state: TabListState<T>,
  ref: { current: HTMLElement | null }
): TabListAria {
  const { orientation = "horizontal", keyboardActivation = "automatic" } = props;
  const locale = useLocale();
  const delegate = new TabsKeyboardDelegate(
    state.collection as any,
    locale.value.direction,
    orientation,
    state.disabledKeys
  );

  const { collectionProps } = useSelectableCollection({
    ref,
    selectionManager: state.selectionManager,
    keyboardDelegate: delegate as any,
    selectOnFocus: keyboardActivation === "automatic",
    disallowEmptySelection: true,
    scrollRef: ref,
    linkBehavior: "selection",
  });

  const tabsId = useId();
  tabsIds.set(state as any, tabsId);

  const tabListLabelProps = useLabels({ ...props, id: tabsId });

  return {
    tabListProps: {
      ...mergeProps(collectionProps, tabListLabelProps),
      role: "tablist",
      "aria-orientation": orientation,
      tabIndex: undefined,
    },
  };
}
