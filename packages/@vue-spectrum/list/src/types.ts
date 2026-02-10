import type { Key } from "@vue-aria/types";
import type { ListBoxItem, SelectionMode } from "@vue-aria/listbox";

export type ListViewKey = Key;
export type SpectrumListViewSelectionMode = SelectionMode;

export type SpectrumListViewLoadingState =
  | "idle"
  | "loading"
  | "loadingMore"
  | "filtering";

export interface SpectrumListViewItemData {
  key?: ListViewKey | undefined;
  id?: ListViewKey | undefined;
  label: string;
  description?: string | undefined;
  textValue?: string | undefined;
  isDisabled?: boolean | undefined;
  "aria-label"?: string | undefined;
}

export interface NormalizedListViewItemData extends ListBoxItem {
  label: string;
  description?: string | undefined;
  "aria-label"?: string | undefined;
}

export function normalizeListViewItems(
  items: SpectrumListViewItemData[] | undefined
): NormalizedListViewItemData[] {
  if (!items || items.length === 0) {
    return [];
  }

  return items.map((item, index) => {
    const candidateKey = item.key ?? item.id;
    const key =
      typeof candidateKey === "string" || typeof candidateKey === "number"
        ? candidateKey
        : index;

    return {
      key,
      label: item.label,
      description: item.description,
      textValue: item.textValue ?? item.label,
      isDisabled: item.isDisabled,
      "aria-label": item["aria-label"],
    };
  });
}
