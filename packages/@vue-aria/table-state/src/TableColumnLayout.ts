import { calculateColumnSizes, getMaxWidth, getMinWidth } from "./TableUtils";
import type { ColumnSize, GridNode, Key, TableCollection } from "./types";

export interface TableColumnLayoutOptions<T> {
  getDefaultWidth?: (column: GridNode<T>) => ColumnSize | null | undefined;
  getDefaultMinWidth?: (column: GridNode<T>) => ColumnSize | null | undefined;
}

export class TableColumnLayout<T> {
  getDefaultWidth: (column: GridNode<T>) => ColumnSize | null | undefined;
  getDefaultMinWidth: (column: GridNode<T>) => ColumnSize | null | undefined;
  columnWidths: Map<Key, number> = new Map();
  columnMinWidths: Map<Key, number> = new Map();
  columnMaxWidths: Map<Key, number> = new Map();

  constructor(options?: TableColumnLayoutOptions<T>) {
    this.getDefaultWidth = options?.getDefaultWidth ?? (() => "1fr");
    this.getDefaultMinWidth = options?.getDefaultMinWidth ?? (() => 75);
  }

  splitColumnsIntoControlledAndUncontrolled(
    columns: Array<GridNode<T>>
  ): [Map<Key, GridNode<T>>, Map<Key, GridNode<T>>] {
    return columns.reduce<[Map<Key, GridNode<T>>, Map<Key, GridNode<T>>]>(
      (acc, column) => {
        if (column.props?.width != null) {
          acc[0].set(column.key, column);
        } else {
          acc[1].set(column.key, column);
        }
        return acc;
      },
      [new Map(), new Map()]
    );
  }

  recombineColumns(
    columns: Array<GridNode<T>>,
    uncontrolledWidths: Map<Key, ColumnSize>,
    uncontrolledColumns: Map<Key, GridNode<T>>,
    controlledColumns: Map<Key, GridNode<T>>
  ): Map<Key, ColumnSize> {
    return new Map<Key, ColumnSize>(
      columns.map((column): [Key, ColumnSize] => {
        if (uncontrolledColumns.has(column.key)) {
          return [column.key, (uncontrolledWidths.get(column.key) ?? "1fr") as ColumnSize];
        }
        return [column.key, (controlledColumns.get(column.key)?.props?.width ?? "1fr") as ColumnSize];
      })
    );
  }

  getInitialUncontrolledWidths(
    uncontrolledColumns: Map<Key, GridNode<T>>
  ): Map<Key, ColumnSize> {
    return new Map<Key, ColumnSize>(
      Array.from(uncontrolledColumns).map(([key, column]): [Key, ColumnSize] => [
        key,
        (column.props?.defaultWidth ?? this.getDefaultWidth?.(column) ?? "1fr") as ColumnSize,
      ])
    );
  }

  getColumnWidth(key: Key): number {
    return this.columnWidths.get(key) ?? 0;
  }

  getColumnMinWidth(key: Key): number {
    return this.columnMinWidths.get(key) ?? 0;
  }

  getColumnMaxWidth(key: Key): number {
    return this.columnMaxWidths.get(key) ?? 0;
  }

  resizeColumnWidth(
    collection: TableCollection<T>,
    uncontrolledWidths: Map<Key, ColumnSize>,
    columnKey: Key,
    width: number
  ): Map<Key, ColumnSize> {
    const previousColumnWidths = this.columnWidths;
    let freeze = true;
    const newWidths = new Map<Key, ColumnSize>();

    width = Math.max(
      this.getColumnMinWidth(columnKey),
      Math.min(this.getColumnMaxWidth(columnKey), Math.floor(width))
    );

    collection.columns.forEach((column) => {
      if (column.key === columnKey) {
        newWidths.set(column.key, width);
        freeze = false;
      } else if (freeze) {
        newWidths.set(column.key, previousColumnWidths.get(column.key) ?? 0);
      } else {
        newWidths.set(
          column.key,
          (column.props?.width ?? uncontrolledWidths.get(column.key) ?? "1fr") as ColumnSize
        );
      }
    });

    return newWidths;
  }

  buildColumnWidths(
    tableWidth: number,
    collection: TableCollection<T>,
    widths: Map<Key, ColumnSize>
  ): Map<Key, number> {
    this.columnWidths = new Map();
    this.columnMinWidths = new Map();
    this.columnMaxWidths = new Map();

    const columnWidths = calculateColumnSizes(
      tableWidth,
      collection.columns.map((column) => ({
        ...(column.props ?? {}),
        key: column.key,
      })),
      widths,
      (index) => this.getDefaultWidth(collection.columns[index]),
      (index) => this.getDefaultMinWidth(collection.columns[index])
    );

    columnWidths.forEach((width, index) => {
      const key = collection.columns[index].key;
      const column = collection.columns[index];
      this.columnWidths.set(key, width);
      this.columnMinWidths.set(
        key,
        getMinWidth(
          (column.props?.minWidth ?? this.getDefaultMinWidth(column) ?? 0) as string | number,
          tableWidth
        )
      );
      this.columnMaxWidths.set(
        key,
        getMaxWidth(column.props?.maxWidth as string | number | null | undefined, tableWidth)
      );
    });

    return this.columnWidths;
  }
}
