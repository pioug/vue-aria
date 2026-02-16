import { cloneVNode, h, type VNode } from "vue";
import { DialogTrigger } from "@vue-spectrum/dialog";
import { TooltipTrigger } from "@vue-spectrum/tooltip";
import type { Key, Node } from "@vue-aria/collections";

export interface ActionGroupCollectionNode extends Node<object> {
  wrapper?: (item: VNode) => VNode;
}

function isRenderableNode(node: VNode): boolean {
  return typeof node.type !== "symbol";
}

function toVNodeArray(value: unknown): VNode[] {
  if (Array.isArray(value)) {
    return value.filter((node): node is VNode => typeof node === "object" && node != null && "type" in node).filter(isRenderableNode);
  }

  if (typeof value === "object" && value != null && "type" in (value as Record<string, unknown>)) {
    const vnode = value as VNode;
    return isRenderableNode(vnode) ? [vnode] : [];
  }

  return [];
}

function resolveChildren(vnode: VNode): VNode[] {
  const children = vnode.children;
  if (Array.isArray(children)) {
    return toVNodeArray(children);
  }

  if (children && typeof children === "object" && "default" in children) {
    const defaultSlot = (children as { default?: () => unknown }).default;
    return typeof defaultSlot === "function" ? toVNodeArray(defaultSlot()) : [];
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
    const defaultSlot = (children as { default?: () => unknown }).default;
    return typeof defaultSlot === "function" ? defaultSlot() : null;
  }

  return null;
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

function createNode(
  key: Key,
  index: number,
  rendered: unknown,
  textValue: string,
  props: Record<string, unknown>
): ActionGroupCollectionNode {
  return {
    type: "item",
    key,
    value: (props.value as object | null) ?? null,
    level: 0,
    hasChildNodes: false,
    rendered,
    textValue,
    "aria-label": (props["aria-label"] as string | undefined) ?? (props.ariaLabel as string | undefined),
    index,
    props,
    parentKey: null,
    prevKey: null,
    nextKey: null,
    firstChildKey: null,
    lastChildKey: null,
    childNodes: [],
  };
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

function isTooltipTriggerComponent(component: unknown): boolean {
  return component === TooltipTrigger
    || (
      typeof component === "object"
      && component != null
      && "name" in component
      && (component as { name?: unknown }).name === "SpectrumTooltipTrigger"
    );
}

function normalizeChildren(children: VNode[], disabledKeys: Set<Key>): ActionGroupCollectionNode[] {
  const nodes: ActionGroupCollectionNode[] = [];
  let index = 0;

  for (const vnode of children) {
    const component = vnode.type as unknown;
    const props = (vnode.props ?? {}) as Record<string, unknown>;
    const fallbackKey = `item-${index}`;

    if (isDialogTriggerComponent(component) || isTooltipTriggerComponent(component)) {
      const triggerChildren = resolveChildren(vnode);
      const [triggerNode, contentNode] = triggerChildren;
      if (!triggerNode || !contentNode) {
        index += 1;
        continue;
      }

      const resolvedRendered = resolveRendered(triggerNode);
      const childProps = (triggerNode.props ?? {}) as Record<string, unknown>;
      const key = (triggerNode.key as Key | undefined)
        ?? (props.key as Key | undefined)
        ?? (childProps.key as Key | undefined)
        ?? fallbackKey;
      const textValue = resolveTextValue({
        explicitTextValue:
          typeof childProps.textValue === "string" ? childProps.textValue : undefined,
        rendered: resolvedRendered,
        key,
      });

      const node = createNode(
        key,
        index,
        resolvedRendered,
        textValue,
        {
          ...childProps,
          "aria-label": (childProps.ariaLabel ?? childProps["aria-label"]) as string | undefined,
          onAction: childProps.onAction,
        }
      );

      node.props.disabled = Boolean(node.props.disabled ?? node.props.isDisabled ?? disabledKeys.has(key));
      node.props.isDisabled = Boolean(node.props.isDisabled ?? node.props.disabled ?? disabledKeys.has(key));

      if (isDialogTriggerComponent(component)) {
        node.wrapper = (itemNode: VNode) =>
          h(
            DialogTrigger as any,
            props,
            {
              trigger: () => [itemNode],
              default: () => [cloneVNode(contentNode)],
            }
          );
      } else {
        node.wrapper = (itemNode: VNode) =>
          h(
            TooltipTrigger as any,
            props,
            {
              default: () => [itemNode, cloneVNode(contentNode)],
            }
          );
      }

      nodes.push(node);
      index += 1;
      continue;
    }

    const key = (vnode.key as Key | undefined)
      ?? (props.key as Key | undefined)
      ?? fallbackKey;
    const rendered = resolveRendered(vnode);
    const textValue = resolveTextValue({
      explicitTextValue:
        typeof props.textValue === "string"
          ? props.textValue
          : typeof props["text-value"] === "string"
            ? String(props["text-value"])
            : undefined,
      rendered,
      key,
    });

    const isDisabled = Boolean(props.disabled) || Boolean(props.isDisabled) || disabledKeys.has(key);
    nodes.push(
      createNode(key, index, rendered, textValue, {
        ...props,
        isDisabled,
        onAction: props.onAction,
      })
    );
    index += 1;
  }

  return nodes;
}

function normalizeDataNodes(items: Iterable<unknown> | undefined, disabledKeys: Set<Key>): ActionGroupCollectionNode[] {
  if (!items) {
    return [];
  }

  const nodes: ActionGroupCollectionNode[] = [];
  let index = 0;

  for (const item of items) {
    if (item && typeof item === "object") {
      const itemObject = item as Record<string, unknown>;
      const key = (typeof itemObject.key === "string" || typeof itemObject.key === "number")
        ? (itemObject.key as Key)
        : (typeof itemObject.id === "string" || typeof itemObject.id === "number")
          ? (itemObject.id as Key)
          : index;

      const rendered = itemObject.label ?? itemObject.name ?? itemObject.textValue ?? itemObject["aria-label"] ?? itemObject["ariaLabel"] ?? String(key);
      const textValue = String(
        itemObject.textValue
        ?? itemObject.label
        ?? itemObject.name
        ?? key
      );

      nodes.push(
        createNode(key, index, rendered, textValue, {
          onAction: itemObject.onAction,
          isDisabled: Boolean(itemObject.isDisabled) || disabledKeys.has(key),
          "aria-label": itemObject["aria-label"] as string | undefined,
          ariaLabel: itemObject.ariaLabel as string | undefined,
        })
      );
    } else {
      const key = index;
      nodes.push(
        createNode(
          key,
          index,
          item,
          String(item),
          {
            isDisabled: disabledKeys.has(key),
          }
        )
      );
    }

    index += 1;
  }

  return nodes;
}

export function createActionGroupCollection(
  items: Iterable<unknown> | undefined,
  slotChildren: VNode[],
  disabledKeys?: Iterable<Key>
): ActionGroupCollectionNode[] {
  const children = slotChildren.filter((node): node is VNode => isRenderableNode(node));
  const resolvedDisabledKeys = new Set<Key>(disabledKeys);

  if (children.length > 0) {
    return normalizeChildren(children, resolvedDisabledKeys);
  }

  if (items) {
    return normalizeDataNodes(items, resolvedDisabledKeys);
  }

  return [];
}
