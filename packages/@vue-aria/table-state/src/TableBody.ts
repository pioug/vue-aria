import type { TableBodyProps, TablePartialNode } from "./types";

function toArray(children: unknown): unknown[] {
  if (children == null) {
    return [];
  }

  return Array.isArray(children) ? children : [children];
}

export function TableBody<T>(_props: TableBodyProps<T>): null {
  return null;
}

(TableBody as any).getCollectionNode = function* getCollectionNode<T>(
  props: TableBodyProps<T>
): Generator<TablePartialNode<T>> {
  const { children, items } = props;
  yield {
    type: "body",
    hasChildNodes: true,
    props: props as unknown as Record<string, unknown>,
    childNodes: function* childNodes() {
      if (typeof children === "function") {
        if (!items) {
          throw new Error("props.children was a function but props.items is missing");
        }

        for (const item of items) {
          yield {
            type: "item",
            value: item,
            renderer: children,
          };
        }
      } else {
        const itemNodes: TablePartialNode<T>[] = [];
        for (const item of toArray(children)) {
          itemNodes.push({
            type: "item",
            element: item,
          });
        }

        yield* itemNodes;
      }
    },
  };
};
