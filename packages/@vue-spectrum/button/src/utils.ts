import { type VNode, Comment, Text } from "vue";
import type { Ref } from "vue";

export function createRefObject(ref: Ref<HTMLElement | null>): { current: Element | null } {
  return {
    get current() {
      return ref.value;
    },
    set current(value: Element | null) {
      ref.value = value as HTMLElement | null;
    },
  };
}

export function isTextOnlyNodes(nodes: VNode[] | undefined): boolean {
  if (!nodes || nodes.length === 0) {
    return false;
  }

  return nodes.every((node) => {
    if (node.type === Comment) {
      return true;
    }

    if (node.type === Text) {
      return true;
    }

    return typeof node.children === "string" || typeof node.children === "number";
  });
}

export function joinIds(...ids: Array<string | null | undefined | false>): string | undefined {
  const value = ids.filter(Boolean).join(" ").trim();
  return value.length > 0 ? value : undefined;
}

export function mapReactEventProps(props: Record<string, unknown>): Record<string, unknown> {
  return {
    onKeydown:
      (props.onKeydown as unknown) ??
      (props.onKeyDown as unknown),
    onKeyup:
      (props.onKeyup as unknown) ??
      (props.onKeyUp as unknown),
  };
}
