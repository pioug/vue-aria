import type { CollectionBuilderContext } from "./useTableState";
import type { TableHeaderProps, TablePartialNode } from "./types";

function toArray(children: unknown): unknown[] {
  if (children == null) {
    return [];
  }

  return Array.isArray(children) ? children : [children];
}

export function TableHeader<T>(_props: TableHeaderProps<T>): null {
  return null;
}

(TableHeader as any).getCollectionNode = function* getCollectionNode<T>(
  props: TableHeaderProps<T>,
  context: CollectionBuilderContext<T>
): Generator<TablePartialNode<T>, void, unknown> {
  const { children, columns } = props;

  context.columns = [];

  if (typeof children === "function") {
    if (!columns) {
      throw new Error("props.children was a function but props.columns is missing");
    }

    for (const column of columns) {
      yield {
        type: "column",
        value: column,
        renderer: children,
      };
    }
  } else {
    const columnNodes: TablePartialNode<T>[] = [];
    for (const column of toArray(children)) {
      columnNodes.push({
        type: "column",
        element: column,
      });
    }

    yield* columnNodes;
  }
};
