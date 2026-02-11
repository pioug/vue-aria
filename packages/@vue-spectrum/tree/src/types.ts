import type { Key } from "@vue-aria/types";
import type { TreeInputNode } from "@vue-aria/tree-state";

export type TreeKey = Key;
export type SpectrumTreeSelectionMode = "none" | "single" | "multiple";

export interface SpectrumTreeViewItemData {
  key?: TreeKey | undefined;
  id?: TreeKey | undefined;
  textValue?: string | undefined;
  label?: string | undefined;
  name?: string | undefined;
  description?: string | undefined;
  isDisabled?: boolean | undefined;
  children?: SpectrumTreeViewItemData[] | undefined;
  childItems?: SpectrumTreeViewItemData[] | undefined;
  [key: string]: unknown;
}

function isTreeKey(value: unknown): value is TreeKey {
  return typeof value === "string" || typeof value === "number";
}

function resolveTextValue(item: SpectrumTreeViewItemData, fallback: string): string {
  const candidate = item.textValue ?? item.label ?? item.name;
  if (candidate && candidate.length > 0) {
    return candidate;
  }

  return fallback;
}

function resolveChildren(
  item: SpectrumTreeViewItemData
): SpectrumTreeViewItemData[] | undefined {
  if (Array.isArray(item.children)) {
    return item.children;
  }

  if (Array.isArray(item.childItems)) {
    return item.childItems;
  }

  return undefined;
}

function normalizeTreeNode(
  item: SpectrumTreeViewItemData,
  path: string
): TreeInputNode<SpectrumTreeViewItemData> {
  const key = isTreeKey(item.key ?? item.id) ? (item.key ?? item.id)! : path;
  const textValue = resolveTextValue(item, String(key));
  const children = resolveChildren(item);

  return {
    key,
    textValue,
    value: item,
    isDisabled: item.isDisabled,
    children: children?.map((child, index) =>
      normalizeTreeNode(child, `${String(key)}-${index}`)
    ),
  };
}

export function normalizeTreeItems(
  items: SpectrumTreeViewItemData[] | undefined
): TreeInputNode<SpectrumTreeViewItemData>[] {
  if (!items || items.length === 0) {
    return [];
  }

  return items.map((item, index) => normalizeTreeNode(item, `item-${index}`));
}
