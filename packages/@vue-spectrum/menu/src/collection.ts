import type { Key, Node } from "@vue-aria/collections";
import { DialogTrigger } from "@vue-spectrum/dialog";
import { cloneVNode, h, type VNode } from "vue";
import { ContextualHelpTrigger } from "./ContextualHelpTrigger";
import { Item } from "./Item";
import { Section } from "./Section";
import { SubmenuTrigger } from "./SubmenuTrigger";
import type { MenuCollectionNode, SpectrumMenuNodeData } from "./types";

function isRenderableNode(node: VNode): boolean {
  return typeof node.type !== "symbol";
}

function toVNodeArray(value: unknown): VNode[] {
  if (Array.isArray(value)) {
    return value.filter((node): node is VNode => typeof node === "object" && node != null && "type" in node)
      .filter(isRenderableNode);
  }

  if (typeof value === "object" && value != null && "type" in (value as Record<string, unknown>)) {
    return [value as VNode].filter(isRenderableNode);
  }

  return [];
}

function resolveVNodeChildren(vnode: VNode): VNode[] {
  const children = vnode.children;
  if (Array.isArray(children)) {
    return toVNodeArray(children);
  }

  if (children && typeof children === "object" && "default" in children) {
    const slot = (children as { default?: () => unknown }).default;
    if (typeof slot === "function") {
      return toVNodeArray(slot());
    }
  }

  return [];
}

function resolveRendered(vnode: VNode): unknown {
  const children = vnode.children;
  if (typeof children === "string" || typeof children === "number") {
    return children;
  }

  if (Array.isArray(children)) {
    return children;
  }

  if (children && typeof children === "object" && "default" in children) {
    const slot = (children as { default?: () => unknown }).default;
    if (typeof slot === "function") {
      return slot();
    }
  }

  return null;
}

function isDialogTriggerComponent(component: unknown): boolean {
  return component === DialogTrigger
    || (
      typeof component === "object"
      && component != null
      && "name" in component
      && (component as { name?: unknown }).name === "SpectrumDialogTrigger"
    );
}

function resolveTextValue({
  explicitTextValue,
  rendered,
  key,
}: {
  explicitTextValue?: string;
  rendered: unknown;
  key: Key;
}): string {
  if (explicitTextValue != null) {
    return explicitTextValue;
  }

  if (typeof rendered === "string" || typeof rendered === "number") {
    return String(rendered);
  }

  if (Array.isArray(rendered)) {
    const text = rendered
      .map((node) => {
        if (typeof node === "string" || typeof node === "number") {
          return String(node);
        }

        if (typeof node === "object" && node != null && "children" in node) {
          const children = (node as { children?: unknown }).children;
          if (typeof children === "string" || typeof children === "number") {
            return String(children);
          }
        }

        return "";
      })
      .join("")
      .trim();
    if (text) {
      return text;
    }
  }

  return String(key);
}

function createNode<T extends object>(
  type: "item" | "section",
  key: Key,
  index: number,
  level: number,
  parentKey: Key | null,
  rendered: unknown,
  textValue: string,
  props: Record<string, unknown>,
  childNodes: MenuCollectionNode<T>[] = []
): MenuCollectionNode<T> {
  const firstChildKey = childNodes.length > 0 ? childNodes[0]?.key ?? null : null;
  const lastChildKey = childNodes.length > 0 ? childNodes[childNodes.length - 1]?.key ?? null : null;

  return {
    type,
    key,
    value: (props.value as T | undefined) ?? null,
    level,
    hasChildNodes: childNodes.length > 0,
    rendered,
    textValue,
    "aria-label": ((props["aria-label"] as string | undefined) ?? (props.ariaLabel as string | undefined)) ?? undefined,
    index,
    parentKey,
    prevKey: null,
    nextKey: null,
    firstChildKey,
    lastChildKey,
    props,
    colSpan: null,
    colIndex: null,
    childNodes,
  };
}

function normalizeDataNodes(
  items: Iterable<SpectrumMenuNodeData>,
  level: number,
  parentKey: Key | null,
  keyPrefix: string
): MenuCollectionNode[] {
  const nodes: MenuCollectionNode[] = [];
  let index = 0;

  for (const item of items) {
    const key = item.key ?? `${keyPrefix}-${index}`;
    if (item.type === "section" || item.children) {
      const children = normalizeDataNodes(item.children ?? [], level + 1, key, `${String(key)}-child`);
      const title = item.title ?? item.name ?? String(key);
      nodes.push(
        createNode(
          "section",
          key,
          index,
          level,
          parentKey,
          title,
          String(title),
          {
            "aria-label": item["aria-label"],
            ariaLabel: item["aria-label"],
            title,
          },
          children
        )
      );
    } else {
      const rendered = item.name ?? item.textValue ?? String(key);
      nodes.push(
        createNode(
          "item",
          key,
          index,
          level,
          parentKey,
          rendered,
          String(item.textValue ?? rendered),
          {
            "aria-label": item["aria-label"],
            ariaLabel: item["aria-label"],
            description: item.description,
            keyboardShortcut: item.keyboardShortcut,
            href: item.href,
            routerOptions: item.routerOptions,
            closeOnSelect: item.closeOnSelect,
            isDisabled: item.isDisabled,
            onAction: item.onAction,
          }
        )
      );
    }

    index += 1;
  }

  return nodes;
}

function normalizeChildren(
  children: VNode[],
  level: number,
  parentKey: Key | null,
  keyPrefix: string
): MenuCollectionNode[] {
  const nodes: MenuCollectionNode[] = [];
  let index = 0;

  const createItemFromVNode = (vnode: VNode, fallbackKey: Key): MenuCollectionNode => {
    const props = ((vnode.props ?? {}) as Record<string, unknown>) ?? {};
    const key = (vnode.key ?? props.key ?? fallbackKey) as Key;
    const rendered = resolveRendered(vnode);
    const textValue = resolveTextValue({
      explicitTextValue: (props.textValue as string | undefined) ?? undefined,
      rendered,
      key,
    });

    return createNode(
      "item",
      key,
      index,
      level,
      parentKey,
      rendered,
      textValue,
      {
        ...props,
      }
    );
  };

  for (const vnode of children) {
    const component = vnode.type as any;
    const fallbackKey = `${keyPrefix}-${index}`;

    if (component === Section || component?.__spectrumMenuNodeType === "section") {
      const props = ((vnode.props ?? {}) as Record<string, unknown>) ?? {};
      const key = (vnode.key ?? props.key ?? fallbackKey) as Key;
      const title = (props.title as string | undefined) ?? (props.name as string | undefined) ?? String(key);
      const sectionChildren = normalizeChildren(resolveVNodeChildren(vnode), level + 1, key, `${String(key)}-child`);
      nodes.push(
        createNode(
          "section",
          key,
          index,
          level,
          parentKey,
          title,
          String(title),
          {
            ...props,
          },
          sectionChildren
        )
      );
      index += 1;
      continue;
    }

    if (component === SubmenuTrigger || component?.__spectrumMenuNodeType === "submenuTrigger") {
      const submenuChildren = resolveVNodeChildren(vnode);
      const [triggerVNode, submenuVNode] = submenuChildren;
      if (!triggerVNode || !submenuVNode) {
        index += 1;
        continue;
      }

      const triggerNode = createItemFromVNode(triggerVNode, fallbackKey);
      const props = ((vnode.props ?? {}) as Record<string, unknown>) ?? {};
      triggerNode.hasChildNodes = true;
      triggerNode.wrapper = (itemNode: VNode) =>
        h(
          SubmenuTrigger as any,
          {
            targetKey: triggerNode.key,
            type: (props.type as "menu" | "dialog" | undefined) ?? "menu",
            isUnavailable: props.isUnavailable as boolean | undefined,
          },
          {
            default: () => [itemNode, submenuVNode],
          }
        );
      nodes.push(triggerNode);
      index += 1;
      continue;
    }

    if (component === ContextualHelpTrigger || component?.__spectrumMenuNodeType === "contextualHelpTrigger") {
      const contextualChildren = resolveVNodeChildren(vnode);
      const [triggerVNode, contentVNode] = contextualChildren;
      if (!triggerVNode || !contentVNode) {
        index += 1;
        continue;
      }

      const props = ((vnode.props ?? {}) as Record<string, unknown>) ?? {};
      const isUnavailable = (props.isUnavailable as boolean | undefined) ?? true;
      if (!isUnavailable) {
        nodes.push(createItemFromVNode(triggerVNode, fallbackKey));
        index += 1;
        continue;
      }

      const triggerNode = createItemFromVNode(triggerVNode, fallbackKey);
      triggerNode.hasChildNodes = true;
      triggerNode.wrapper = (itemNode: VNode) =>
        h(
          SubmenuTrigger as any,
          {
            targetKey: triggerNode.key,
            type: "dialog",
            isUnavailable,
          },
          {
            default: () => [itemNode, contentVNode],
          }
        );
      nodes.push(triggerNode);
      index += 1;
      continue;
    }

    if (isDialogTriggerComponent(component)) {
      const dialogChildren = resolveVNodeChildren(vnode);
      const [triggerVNode, contentVNode] = dialogChildren;
      if (!triggerVNode || !contentVNode) {
        index += 1;
        continue;
      }

      const triggerNode = createItemFromVNode(triggerVNode, fallbackKey);
      const props = ((vnode.props ?? {}) as Record<string, unknown>) ?? {};
      triggerNode.wrapper = (itemNode: VNode) =>
        h(
          DialogTrigger as any,
          {
            ...props,
          },
          {
            trigger: () => [itemNode],
            default: () => [cloneVNode(contentVNode)],
          }
        );
      nodes.push(triggerNode);
      index += 1;
      continue;
    }

    if (component === Item || component?.__spectrumMenuNodeType === "item") {
      nodes.push(createItemFromVNode(vnode, fallbackKey));
      index += 1;
      continue;
    }

    nodes.push(createItemFromVNode(vnode, fallbackKey));
    index += 1;
  }

  return nodes;
}

export function createMenuCollection(
  items: Iterable<SpectrumMenuNodeData> | undefined,
  slotChildren: VNode[]
): MenuCollectionNode[] {
  if (slotChildren.length > 0) {
    return normalizeChildren(slotChildren, 0, null, "item");
  }

  if (items) {
    return normalizeDataNodes(items, 0, null, "item");
  }

  return [];
}
