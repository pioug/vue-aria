import type { Key, Node } from "@vue-aria/collections";
import { Fragment, Text, isVNode, type VNode, type VNodeChild } from "vue";

export type TreeKey = Key;
export type SpectrumTreeSelectionMode = "none" | "single" | "multiple";
export type SpectrumTreeSelectionStyle = "highlight" | "checkbox";

export interface SpectrumTreeViewItemData {
  key?: TreeKey | undefined;
  id?: TreeKey | undefined;
  textValue?: string | undefined;
  name?: string | undefined;
  isDisabled?: boolean | undefined;
  href?: string | undefined;
  children?: SpectrumTreeViewItemData[] | undefined;
  childItems?: SpectrumTreeViewItemData[] | undefined;
  rendered?: VNodeChild | undefined;
  [key: string]: unknown;
}

export interface NormalizedTreeItem {
  key: TreeKey;
  textValue: string;
  rendered: VNodeChild;
  isDisabled?: boolean | undefined;
  href?: string | undefined;
  ariaLabel?: string | undefined;
  rowProps?: Record<string, unknown> | undefined;
  value?: SpectrumTreeViewItemData | undefined;
  children: NormalizedTreeItem[];
}

function toStringValue(value: unknown): string {
  if (value == null) {
    return "";
  }

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return "";
}

function normalizeKey(value: unknown, fallback: TreeKey): TreeKey {
  if (typeof value === "string" || typeof value === "number") {
    return value;
  }

  return fallback;
}

function normalizeAriaLabel(value: unknown): string | undefined {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }

  return undefined;
}

function extractTreeItemRowProps(source: Record<string, unknown>): Record<string, unknown> {
  const rowProps: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(source)) {
    if (
      key === "id"
      || key === "key"
      || key === "textValue"
      || key === "text-value"
      || key === "name"
      || key === "isDisabled"
      || key === "is-disabled"
      || key === "href"
      || key === "children"
      || key === "childItems"
      || key === "child-items"
      || key === "rendered"
      || key === "ariaLabel"
      || key === "aria-label"
    ) {
      continue;
    }

    rowProps[key] = value;
  }

  return rowProps;
}

export function extractTextContent(value: unknown): string {
  if (value == null) {
    return "";
  }

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map((entry) => extractTextContent(entry)).join("");
  }

  if (isVNode(value)) {
    if (typeof value.children === "string") {
      return value.children;
    }

    if (Array.isArray(value.children)) {
      return extractTextContent(value.children);
    }

    if (value.type === Text) {
      return toStringValue(value.children);
    }

    if (value.type === Fragment) {
      return extractTextContent(value.children);
    }

    if (value.children && typeof value.children === "object") {
      const maybeDefault = (value.children as { default?: (() => unknown) | undefined }).default;
      if (typeof maybeDefault === "function") {
        return extractTextContent(maybeDefault());
      }
    }
  }

  return "";
}

function flattenVNodeChildren(input: unknown): VNode[] {
  if (input == null) {
    return [];
  }

  if (Array.isArray(input)) {
    return input.flatMap((entry) => flattenVNodeChildren(entry));
  }

  if (!isVNode(input)) {
    return [];
  }

  if (input.type === Fragment) {
    return flattenVNodeChildren(input.children);
  }

  return [input];
}

function getSlotChildren(node: VNode): VNode[] {
  if (Array.isArray(node.children)) {
    return flattenVNodeChildren(node.children);
  }

  if (node.children && typeof node.children === "object") {
    const maybeDefault = (node.children as { default?: (() => unknown) | undefined }).default;
    if (typeof maybeDefault === "function") {
      return flattenVNodeChildren(maybeDefault());
    }
  }

  return [];
}

function getSlotContent(node: VNode): VNodeChild {
  if (Array.isArray(node.children)) {
    return node.children as VNodeChild;
  }

  if (typeof node.children === "string") {
    return node.children;
  }

  if (node.children && typeof node.children === "object") {
    const maybeDefault = (node.children as { default?: (() => unknown) | undefined }).default;
    if (typeof maybeDefault === "function") {
      return maybeDefault() as VNodeChild;
    }
  }

  return "";
}

function getTreeNodeType(node: VNode): string | undefined {
  const type = node.type as
    | string
    | symbol
    | { name?: string | undefined; __spectrumTreeNodeType?: string | undefined };
  if (typeof type === "string") {
    return type;
  }

  if (typeof type === "symbol") {
    return undefined;
  }

  return type.__spectrumTreeNodeType ?? type.name;
}

function parseTreeItemNode(node: VNode, index: number, parentPath: string): NormalizedTreeItem {
  const props = (node.props ?? {}) as Record<string, unknown>;
  const key = normalizeKey(node.key ?? props.id ?? props.key, `${parentPath}-${index}`);
  const children = getSlotChildren(node);

  const contentNode = children.find((child) => {
    const type = getTreeNodeType(child);
    return type === "tree-item-content" || type === "TreeViewItemContent";
  });

  const itemNodes = children.filter((child) => {
    const type = getTreeNodeType(child);
    return type === "tree-item" || type === "TreeViewItem";
  });

  const rendered = contentNode ? getSlotContent(contentNode) : getSlotContent(node);
  const textValue =
    toStringValue(props.textValue ?? props.name) || extractTextContent(rendered) || String(key);

  return {
    key,
    textValue,
    rendered,
    isDisabled: Boolean(props.isDisabled),
    href: toStringValue(props.href) || undefined,
    ariaLabel: normalizeAriaLabel(props["aria-label"] ?? props.ariaLabel),
    rowProps: extractTreeItemRowProps(props),
    children: itemNodes.map((child, childIndex) => parseTreeItemNode(child, childIndex, String(key))),
  };
}

export function parseTreeSlotItems(nodes: VNode[] | undefined): NormalizedTreeItem[] {
  if (!nodes || nodes.length === 0) {
    return [];
  }

  const topLevelNodes = flattenVNodeChildren(nodes);
  const itemNodes = topLevelNodes.filter((node) => {
    const type = getTreeNodeType(node);
    return type === "tree-item" || type === "TreeViewItem";
  });

  return itemNodes.map((node, index) => parseTreeItemNode(node, index, "item"));
}

function normalizeDataItem(item: SpectrumTreeViewItemData, index: number, parentPath: string): NormalizedTreeItem {
  const itemRecord = item as Record<string, unknown>;
  const key = normalizeKey(item.key ?? item.id, `${parentPath}-${index}`);
  const rendered = item.rendered ?? item.name ?? item.textValue ?? String(key);
  const textValue = item.textValue ?? item.name ?? extractTextContent(rendered) ?? String(key);
  const childItems = item.childItems ?? item.children ?? [];

  return {
    key,
    textValue,
    rendered,
    isDisabled: item.isDisabled,
    href: item.href,
    ariaLabel: normalizeAriaLabel(itemRecord["aria-label"] ?? itemRecord.ariaLabel),
    rowProps: extractTreeItemRowProps(itemRecord),
    value: item,
    children: childItems.map((child, childIndex) => normalizeDataItem(child, childIndex, String(key))),
  };
}

export function normalizeTreeItems(
  items: SpectrumTreeViewItemData[] | undefined,
  slotItems: NormalizedTreeItem[]
): NormalizedTreeItem[] {
  if (slotItems.length > 0) {
    return slotItems;
  }

  if (!items || items.length === 0) {
    return [];
  }

  return items.map((item, index) => normalizeDataItem(item, index, "item"));
}

function toCollectionNode(
  item: NormalizedTreeItem,
  index: number,
  parentKey: Key | null,
  level: number
): Node<SpectrumTreeViewItemData> {
  const childNodes = item.children.map((child, childIndex) =>
    toCollectionNode(child, childIndex, item.key, level + 1)
  );

  return {
    type: "item",
    key: item.key,
    value: item.value ?? null,
    level,
    hasChildNodes: childNodes.length > 0,
    rendered: item.rendered,
    textValue: item.textValue,
    index,
    parentKey,
    prevKey: null,
    nextKey: null,
    firstChildKey: childNodes[0]?.key ?? null,
    lastChildKey: childNodes[childNodes.length - 1]?.key ?? null,
    props: {
      isDisabled: item.isDisabled,
      href: item.href,
      rowProps: item.rowProps,
      "aria-label": item.ariaLabel,
    },
    colSpan: null,
    colIndex: null,
    childNodes,
  };
}

export function buildTreeCollectionNodes(items: NormalizedTreeItem[]): Node<SpectrumTreeViewItemData>[] {
  return items.map((item, index) => toCollectionNode(item, index, null, 0));
}
