import { h, isVNode, type VNode, type VNodeChild } from "vue";

export function getWrappedElement(children: string | VNode | VNodeChild[] | null | undefined): VNode {
  if (typeof children === "string") {
    return h("span", children);
  }

  if (Array.isArray(children)) {
    if (children.length !== 1 || !isVNode(children[0])) {
      throw new Error("Expected exactly one vnode child.");
    }
    return children[0];
  }

  if (isVNode(children)) {
    return children;
  }

  throw new Error("Expected a string or a single vnode child.");
}
