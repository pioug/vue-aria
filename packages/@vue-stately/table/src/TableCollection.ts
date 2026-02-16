import type { Key } from "@vue-aria/collections";
import { GridCollection, type GridNode } from "@vue-stately/grid";
import type { TableCollection as ITableCollection } from "./types";

interface GridCollectionOptions {
  showSelectionCheckboxes?: boolean;
  showDragButtons?: boolean;
}

const ROW_HEADER_COLUMN_KEY = `row-header-column-${Math.random().toString(36).slice(2)}`;
let ROW_HEADER_COLUMN_KEY_DRAG = `row-header-column-${Math.random().toString(36).slice(2)}`;
while (ROW_HEADER_COLUMN_KEY === ROW_HEADER_COLUMN_KEY_DRAG) {
  ROW_HEADER_COLUMN_KEY_DRAG = `row-header-column-${Math.random().toString(36).slice(2)}`;
}

function getFirstItem<T>(iterable: Iterable<GridNode<T>>): GridNode<T> | null {
  for (const item of iterable) {
    return item;
  }

  return null;
}

function getLastItem<T>(iterable: Iterable<GridNode<T>>): GridNode<T> | null {
  let last: GridNode<T> | null = null;
  for (const item of iterable) {
    last = item;
  }

  return last;
}

function createBodyNode<T>(childNodes: GridNode<T>[]): GridNode<T> {
  return {
    type: "body",
    key: "body",
    value: null,
    rendered: null,
    textValue: "",
    level: 0,
    index: 0,
    hasChildNodes: childNodes.length > 0,
    childNodes,
    parentKey: null,
    prevKey: null,
    nextKey: null,
    firstChildKey: childNodes[0]?.key ?? null,
    lastChildKey: childNodes[childNodes.length - 1]?.key ?? null,
  };
}

/** @private */
export function buildHeaderRows<T>(
  keyMap: Map<Key, GridNode<T>>,
  columnNodes: GridNode<T>[]
): GridNode<T>[] {
  if (columnNodes.length === 0) {
    return [];
  }

  const columns: Array<Array<GridNode<T> | null>> = [];
  const seen = new Map<
    GridNode<T>,
    { column: Array<GridNode<T> | null>; index: number }
  >();

  for (const column of columnNodes) {
    let parentKey = column.parentKey;
    const col: Array<GridNode<T> | null> = [column];

    while (parentKey != null) {
      const parent = keyMap.get(parentKey);
      if (!parent) {
        break;
      }

      if (seen.has(parent)) {
        parent.colSpan ??= 0;
        parent.colSpan += 1;
        parent.colspan = parent.colSpan;

        const entry = seen.get(parent)!;
        if (entry.index > col.length) {
          break;
        }

        for (let i = entry.index; i < col.length; i += 1) {
          entry.column.splice(i, 0, null);
        }

        for (let i = col.length; i < entry.column.length; i += 1) {
          const sibling = entry.column[i];
          if (sibling && seen.has(sibling)) {
            seen.get(sibling)!.index = i;
          }
        }
      } else {
        parent.colSpan = 1;
        parent.colspan = 1;
        col.push(parent);
        seen.set(parent, { column: col, index: col.length - 1 });
      }

      parentKey = parent.parentKey;
    }

    columns.push(col);
    column.index = columns.length - 1;
  }

  const maxLength = Math.max(...columns.map((col) => col.length));
  const headerRows: GridNode<T>[][] = Array(maxLength)
    .fill(0)
    .map(() => []);

  let colIndex = 0;
  for (const column of columns) {
    let i = maxLength - 1;
    for (const item of column) {
      if (item) {
        const row = headerRows[i];
        const rowLength = row.reduce((prev, current) => prev + (current.colSpan ?? 1), 0);
        if (rowLength < colIndex) {
          const prev = row.length > 0 ? row[row.length - 1] : null;
          const placeholder: GridNode<T> = {
            type: "placeholder",
            key: `placeholder-${item.key}`,
            colspan: colIndex - rowLength,
            colSpan: colIndex - rowLength,
            colIndex: rowLength,
            index: rowLength,
            value: null,
            rendered: null,
            level: i,
            hasChildNodes: false,
            childNodes: [],
            textValue: "",
            parentKey: null,
            prevKey: prev?.key ?? null,
            nextKey: null,
            firstChildKey: null,
            lastChildKey: null,
          };

          if (prev) {
            prev.nextKey = placeholder.key;
          }

          row.push(placeholder);
        }

        if (row.length > 0) {
          row[row.length - 1].nextKey = item.key;
          item.prevKey = row[row.length - 1].key;
        }

        item.level = i;
        item.colIndex = colIndex;
        row.push(item);
      }

      i -= 1;
    }

    colIndex += 1;
  }

  let level = 0;
  for (const row of headerRows) {
    const rowLength = row.reduce((prev, current) => prev + (current.colSpan ?? 1), 0);
    if (rowLength < columnNodes.length) {
      const prev = row.length > 0 ? row[row.length - 1] : null;
      const placeholder: GridNode<T> = {
        type: "placeholder",
        key: prev ? `placeholder-${prev.key}` : `placeholder-headerrow-${level}`,
        colSpan: columnNodes.length - rowLength,
        colspan: columnNodes.length - rowLength,
        colIndex: rowLength,
        index: rowLength,
        value: null,
        rendered: null,
        level,
        hasChildNodes: false,
        childNodes: [],
        textValue: "",
        parentKey: null,
        prevKey: prev?.key ?? null,
        nextKey: null,
        firstChildKey: null,
        lastChildKey: null,
      };

      if (prev) {
        prev.nextKey = placeholder.key;
      }

      row.push(placeholder);
    }

    level += 1;
  }

  return headerRows.map((childNodes, index) => ({
    type: "headerrow",
    key: `headerrow-${index}`,
    index,
    value: null,
    rendered: null,
    level: 0,
    hasChildNodes: true,
    childNodes,
    textValue: "",
    parentKey: null,
    prevKey: null,
    nextKey: null,
    firstChildKey: childNodes[0]?.key ?? null,
    lastChildKey: childNodes[childNodes.length - 1]?.key ?? null,
  }));
}

export class TableCollection<T> extends GridCollection<T> implements ITableCollection<T> {
  headerRows: GridNode<T>[];
  columns: GridNode<T>[];
  rowHeaderColumnKeys: Set<Key>;
  body: GridNode<T>;
  private _size = 0;
  private readonly opts?: GridCollectionOptions;
  private readonly topLevelNodes: GridNode<T>[];

  constructor(
    nodes: Iterable<GridNode<T>>,
    _prev?: ITableCollection<T> | null,
    opts?: GridCollectionOptions
  ) {
    const topLevelNodes = [...nodes];
    const rowHeaderColumnKeys = new Set<Key>();
    let body: GridNode<T> | null = null;
    const columns: GridNode<T>[] = [];

    if (opts?.showSelectionCheckboxes) {
      columns.unshift({
        type: "column",
        key: ROW_HEADER_COLUMN_KEY,
        value: null,
        textValue: "",
        level: 0,
        index: opts.showDragButtons ? 1 : 0,
        hasChildNodes: false,
        rendered: null,
        childNodes: [],
        parentKey: null,
        prevKey: null,
        nextKey: null,
        firstChildKey: null,
        lastChildKey: null,
        props: {
          isSelectionCell: true,
        },
      });
    }

    if (opts?.showDragButtons) {
      columns.unshift({
        type: "column",
        key: ROW_HEADER_COLUMN_KEY_DRAG,
        value: null,
        textValue: "",
        level: 0,
        index: 0,
        hasChildNodes: false,
        rendered: null,
        childNodes: [],
        parentKey: null,
        prevKey: null,
        nextKey: null,
        firstChildKey: null,
        lastChildKey: null,
        props: {
          isDragButtonCell: true,
        },
      });
    }

    const rows: GridNode<T>[] = [];
    const columnKeyMap = new Map<Key, GridNode<T>>();
    const visit = (node: GridNode<T>) => {
      switch (node.type) {
        case "body":
          body = node;
          break;
        case "column":
          columnKeyMap.set(node.key, node);
          if (!node.hasChildNodes) {
            columns.push(node);

            if ((node.props as { isRowHeader?: boolean } | undefined)?.isRowHeader) {
              rowHeaderColumnKeys.add(node.key);
            }
          }
          break;
        case "item":
          rows.push(node);
          return;
      }
      for (const child of node.childNodes) {
        visit(child);
      }
    };

    for (const node of topLevelNodes) {
      visit(node);
    }

    if (!body) {
      body = createBodyNode<T>([]);
      topLevelNodes.push(body);
    }

    const headerRows = buildHeaderRows(columnKeyMap, columns);
    headerRows.forEach((row, index) => {
      rows.splice(index, 0, row);
    });

    super({
      columnCount: columns.length,
      items: rows,
      visitNode: (node) => {
        node.column = columns[node.index];
        return node;
      },
    });

    this.columns = columns;
    this.rowHeaderColumnKeys = rowHeaderColumnKeys;
    this.body = body;
    this.headerRows = headerRows;
    this._size = [...this.body.childNodes].length;
    this.opts = opts;
    this.topLevelNodes = topLevelNodes;

    if (this.rowHeaderColumnKeys.size === 0) {
      const firstDataColumn = this.columns.find(
        (column) =>
          !(column.props as { isDragButtonCell?: boolean } | undefined)?.isDragButtonCell
          && !(column.props as { isSelectionCell?: boolean } | undefined)?.isSelectionCell
      );
      if (firstDataColumn) {
        this.rowHeaderColumnKeys.add(firstDataColumn.key);
      }
    }
  }

  *[Symbol.iterator](): IterableIterator<GridNode<T>> {
    yield* this.body.childNodes;
  }

  get size(): number {
    return this._size;
  }

  getKeys(): IterableIterator<Key> {
    return this.keyMap.keys();
  }

  getKeyBefore(key: Key): Key | null {
    const node = this.keyMap.get(key);
    return node?.prevKey ?? null;
  }

  getKeyAfter(key: Key): Key | null {
    const node = this.keyMap.get(key);
    return node?.nextKey ?? null;
  }

  getFirstKey(): Key | null {
    return getFirstItem(this.body.childNodes)?.key ?? null;
  }

  getLastKey(): Key | null {
    return getLastItem(this.body.childNodes)?.key ?? null;
  }

  getItem(key: Key): GridNode<T> | null {
    return this.keyMap.get(key) ?? null;
  }

  at(idx: number): GridNode<T> | null {
    const keys = [...this.getKeys()];
    return this.getItem(keys[idx]);
  }

  getChildren(key: Key): Iterable<GridNode<T>> {
    if (key === this.body.key) {
      return this.body.childNodes;
    }

    return super.getChildren(key);
  }

  getTextValue(key: Key): string {
    const row = this.getItem(key);
    if (!row) {
      return "";
    }

    if (row.textValue) {
      return row.textValue;
    }

    const rowHeaderColumnKeys = this.rowHeaderColumnKeys;
    if (rowHeaderColumnKeys) {
      const text: string[] = [];
      for (const cell of row.childNodes) {
        const column = this.columns[cell.index];
        if (column && rowHeaderColumnKeys.has(column.key) && cell.textValue) {
          text.push(cell.textValue);
        }

        if (text.length === rowHeaderColumnKeys.size) {
          break;
        }
      }

      return text.join(" ");
    }

    return "";
  }

  filter(
    filterFn: (nodeValue: string, node: GridNode<T>) => boolean
  ): TableCollection<T> {
    const filteredRows = [...this.body.childNodes].filter((row) =>
      filterFn(this.getTextValue(row.key), row)
    );

    const topLevelNodes = this.topLevelNodes.map((node) => {
      if (node.key !== this.body.key) {
        return node;
      }

      return {
        ...node,
        childNodes: filteredRows,
        hasChildNodes: filteredRows.length > 0,
        firstChildKey: filteredRows[0]?.key ?? null,
        lastChildKey: filteredRows[filteredRows.length - 1]?.key ?? null,
      };
    });

    return new TableCollection(topLevelNodes, this, this.opts);
  }
}
