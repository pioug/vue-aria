export const getOwnerDocument = (el: Element | null | undefined): Document => {
  return el?.ownerDocument ?? document;
};

export const getOwnerWindow = (
  el: (Window & typeof globalThis) | Element | null | undefined
): Window & typeof globalThis => {
  if (el && "window" in el && el.window === el) {
    return el;
  }

  const doc = getOwnerDocument(el as Element | null | undefined);
  return doc.defaultView ?? window;
};

function isNode(value: unknown): value is Node {
  return (
    value !== null
    && typeof value === "object"
    && "nodeType" in value
    && typeof (value as Node).nodeType === "number"
  );
}

export function isShadowRoot(node: Node | null): node is ShadowRoot {
  return (
    isNode(node)
    && node.nodeType === Node.DOCUMENT_FRAGMENT_NODE
    && "host" in node
  );
}
