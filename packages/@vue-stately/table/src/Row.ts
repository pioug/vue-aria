import type { CollectionBuilderContext } from "./useTableState";
import type { RowProps, TablePartialNode } from "./types";

function toArray(children: unknown): unknown[] {
  if (children == null) {
    return [];
  }

  return Array.isArray(children) ? children : [children];
}

function isRowNode(node: unknown): boolean {
  if (node == null || typeof node !== "object") {
    return false;
  }

  const type = (node as { type?: unknown }).type;
  return type === Row || type === "row" || type === "item";
}

export function Row<T>(_props: RowProps<T>): null {
  return null;
}

(Row as any).getCollectionNode = function* getCollectionNode<T>(
  props: RowProps<T>,
  context: CollectionBuilderContext<T>
): Generator<TablePartialNode<T>> {
  const { children, textValue, UNSTABLE_childItems } = props;

  yield {
    type: "item",
    props: props as unknown as Record<string, unknown>,
    textValue,
    "aria-label": props["aria-label"],
    hasChildNodes: true,
    childNodes: function* childNodes() {
      if (context.showDragButtons) {
        yield {
          type: "cell",
          key: "header-drag",
          props: {
            isDragButtonCell: true,
          },
        };
      }

      if (context.showSelectionCheckboxes && context.selectionMode !== "none") {
        yield {
          type: "cell",
          key: "header",
          props: {
            isSelectionCell: true,
          },
        };
      }

      if (typeof children === "function") {
        for (const column of context.columns) {
          yield {
            type: "cell",
            element: (children as (columnKey: unknown) => unknown)(column.key),
            key: column.key,
          };
        }

        if (UNSTABLE_childItems) {
          for (const child of UNSTABLE_childItems) {
            yield {
              type: "item",
              value: child,
            };
          }
        }
      } else {
        const cells: TablePartialNode<T>[] = [];
        const childRows: TablePartialNode<T>[] = [];
        let columnCount = 0;
        for (const node of toArray(children)) {
          if (isRowNode(node)) {
            if (cells.length < context.columns.length) {
              throw new Error(
                "All of a Row's child Cells must be positioned before any child Rows."
              );
            }

            childRows.push({
              type: "item",
              element: node,
            });
          } else {
            cells.push({
              type: "cell",
              element: node,
            });
            const props =
              (node as { props?: { colSpan?: number } } | null)?.props;
            columnCount += props?.colSpan ?? 1;
          }
        }

        if (columnCount !== context.columns.length) {
          throw new Error(
            `Cell count must match column count. Found ${columnCount} cells and ${context.columns.length} columns.`
          );
        }

        yield* cells;
        yield* childRows;
      }
    },
    shouldInvalidate(newContext: unknown) {
      const nextContext = newContext as CollectionBuilderContext<T>;
      return (
        nextContext.columns.length !== context.columns.length
        || nextContext.columns.some(
          (column, index) => column.key !== context.columns[index].key
        )
        || nextContext.showSelectionCheckboxes !== context.showSelectionCheckboxes
        || nextContext.showDragButtons !== context.showDragButtons
        || nextContext.selectionMode !== context.selectionMode
      );
    },
  };
};
