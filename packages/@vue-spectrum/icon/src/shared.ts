import { Comment, type Slots, type VNode, isVNode } from "vue";

export function getFirstSlotVNode(slots: Slots): VNode | null {
  const nodes = slots.default?.() ?? [];

  for (const node of nodes) {
    if (!isVNode(node)) {
      continue;
    }

    if (node.type === Comment) {
      continue;
    }

    return node;
  }

  return null;
}

export function normalizeAriaHidden(
  value: boolean | "true" | "false" | undefined
): true | undefined {
  if (value === true || value === "true") {
    return true;
  }

  return undefined;
}

export function mergeStyle(
  ...styles: Array<unknown>
): unknown {
  const values = styles.filter((style) => style !== undefined && style !== null);
  if (values.length === 0) {
    return undefined;
  }

  if (values.length === 1) {
    return values[0];
  }

  return values;
}

export function getDisplayName(node: VNode): string | undefined {
  const type = node.type as
    | string
    | {
        displayName?: string;
        name?: string;
      }
    | undefined;

  if (!type || typeof type === "string") {
    return undefined;
  }

  return type.displayName ?? type.name;
}
