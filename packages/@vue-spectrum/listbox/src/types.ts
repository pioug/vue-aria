import type { Key } from "@vue-aria/types";
import type { ListBoxItem, SelectionMode } from "@vue-aria/listbox";

export type ListBoxKey = Key;
export type SpectrumListBoxSelectionMode = SelectionMode;

export interface SpectrumListBoxOptionData {
  key: ListBoxKey;
  label: string;
  description?: string | undefined;
  textValue?: string | undefined;
  isDisabled?: boolean | undefined;
  "aria-label"?: string | undefined;
  href?: string | undefined;
}

export interface SpectrumListBoxSectionData {
  key?: ListBoxKey | undefined;
  heading?: string | undefined;
  "aria-label"?: string | undefined;
  items: SpectrumListBoxOptionData[];
}

export type SpectrumListBoxItemData =
  | SpectrumListBoxOptionData
  | SpectrumListBoxSectionData;

export interface NormalizedListBoxSectionData {
  key: string;
  heading?: string | undefined;
  "aria-label"?: string | undefined;
  items: SpectrumListBoxOptionData[];
  implicit?: boolean | undefined;
}

export interface NormalizedListBoxItemData extends ListBoxItem {
  label: string;
  description?: string | undefined;
  href?: string | undefined;
  sectionKey: string;
  "aria-label"?: string | undefined;
}

export function isListBoxSectionData(
  value: SpectrumListBoxItemData
): value is SpectrumListBoxSectionData {
  return Array.isArray((value as SpectrumListBoxSectionData).items);
}

export function normalizeListBoxSections(
  items: SpectrumListBoxItemData[] | undefined
): NormalizedListBoxSectionData[] {
  if (!items || items.length === 0) {
    return [];
  }

  const sections: NormalizedListBoxSectionData[] = [];
  const rootItems: SpectrumListBoxOptionData[] = [];

  items.forEach((item, index) => {
    if (isListBoxSectionData(item)) {
      sections.push({
        key: String(item.key ?? `section-${index}`),
        heading: item.heading,
        "aria-label": item["aria-label"],
        items: item.items,
      });
      return;
    }

    rootItems.push(item);
  });

  if (rootItems.length > 0) {
    sections.unshift({
      key: "__root__",
      items: rootItems,
      implicit: true,
    });
  }

  return sections;
}

export function flattenListBoxSections(
  sections: NormalizedListBoxSectionData[]
): NormalizedListBoxItemData[] {
  const flattened: NormalizedListBoxItemData[] = [];

  for (const section of sections) {
    for (const item of section.items) {
      flattened.push({
        key: item.key,
        label: item.label,
        description: item.description,
        href: item.href,
        textValue: item.textValue ?? item.label,
        isDisabled: item.isDisabled,
        "aria-label": item["aria-label"],
        sectionKey: section.key,
      });
    }
  }

  return flattened;
}
