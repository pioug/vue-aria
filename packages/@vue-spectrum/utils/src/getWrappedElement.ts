import { h, isVNode, type VNode, type VNodeChild } from "vue";

function normalizeChildren(value: VNodeChild | VNodeChild[]): VNodeChild[] {
  if (Array.isArray(value)) {
    return value.flatMap((item) => normalizeChildren(item));
  }

  if (value === null || value === undefined || value === false) {
    return [];
  }

  return [value];
}

export function getWrappedElement(
  children: string | VNode | VNodeChild | VNodeChild[]
): VNode {
  if (typeof children === "string") {
    return h("span", null, children);
  }

  if (isVNode(children)) {
    return children;
  }

  const nodes = normalizeChildren(children).filter((child): child is VNode =>
    isVNode(child)
  );

  if (nodes.length !== 1) {
    throw new Error("Expected exactly one valid child element.");
  }

  return nodes[0];
}
