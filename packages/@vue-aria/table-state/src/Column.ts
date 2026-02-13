import type { CollectionBuilderContext } from "./useTableState";
import type { ColumnProps, TablePartialNode } from "./types";

function toArray(children: unknown): unknown[] {
  if (children == null) {
    return [];
  }

  return Array.isArray(children) ? children : [children];
}

export function Column<T>(_props: ColumnProps<T>): null {
  return null;
}

(Column as any).getCollectionNode = function* getCollectionNode<T>(
  props: ColumnProps<T>,
  context: CollectionBuilderContext<T>
): Generator<TablePartialNode<T>, void, Array<{ key: unknown; hasChildNodes?: boolean }>> {
  const { title, children, childColumns } = props;

  const rendered = title || children;
  const textValue =
    props.textValue
    || (typeof rendered === "string" ? rendered : "")
    || props["aria-label"]
    || "";

  const fullNodes = yield {
    type: "column",
    hasChildNodes: !!childColumns || (!!title && toArray(children).length > 0),
    rendered,
    textValue,
    props: props as unknown as Record<string, unknown>,
    childNodes: function* childNodes() {
      if (childColumns) {
        for (const child of childColumns) {
          yield {
            type: "column",
            value: child,
          };
        }
      } else if (title) {
        const childColumnNodes: TablePartialNode<T>[] = [];
        for (const child of toArray(children)) {
          childColumnNodes.push({
            type: "column",
            element: child,
          });
        }

        yield* childColumnNodes;
      }
    },
    shouldInvalidate(newContext: unknown) {
      updateContext(newContext as CollectionBuilderContext<T>);
      return false;
    },
  };

  const updateContext = (ctx: CollectionBuilderContext<T>) => {
    for (const node of fullNodes ?? []) {
      if (!node.hasChildNodes) {
        ctx.columns.push(node as any);
      }
    }
  };

  updateContext(context);
};
