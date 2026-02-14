import type { Key } from "@vue-aria/collections";
import type { SortDescriptor, SortDirection } from "@vue-aria/table-state";
import { Fragment, Text, isVNode, type VNode, type VNodeChild } from "vue";

export type TableKey = Key;
export type SpectrumTableSelectionMode = "none" | "single" | "multiple";
export type SpectrumTableSelectionStyle = "highlight" | "checkbox";
export type SpectrumSortDirection = SortDirection;
export type SpectrumSortDescriptor = SortDescriptor;

export interface SpectrumTableColumnData {
  key?: TableKey | undefined;
  id?: TableKey | undefined;
  name?: string | undefined;
  title?: string | undefined;
  textValue?: string | undefined;
  allowsSorting?: boolean | undefined;
  isRowHeader?: boolean | undefined;
  colSpan?: number | undefined;
}

export interface SpectrumTableCellData {
  key?: TableKey | undefined;
  textValue?: string | undefined;
  value?: unknown;
  colSpan?: number | undefined;
}

export interface SpectrumTableRowData {
  key?: TableKey | undefined;
  id?: TableKey | undefined;
  textValue?: string | undefined;
  isDisabled?: boolean | undefined;
  cells?: SpectrumTableCellData[] | undefined;
  [key: string]: unknown;
}

export interface ParsedSpectrumTableColumn {
  key?: TableKey | undefined;
  textValue?: string | undefined;
  allowsSorting?: boolean | undefined;
  isRowHeader?: boolean | undefined;
  colSpan?: number | undefined;
  content?: VNodeChild;
}

export interface ParsedSpectrumTableCell {
  key?: TableKey | undefined;
  textValue?: string | undefined;
  colSpan?: number | undefined;
  content?: VNodeChild;
}

export interface ParsedSpectrumTableRow {
  key?: TableKey | undefined;
  textValue?: string | undefined;
  isDisabled?: boolean | undefined;
  cells: ParsedSpectrumTableCell[];
}

export interface ParsedSpectrumTableDefinition {
  columns: ParsedSpectrumTableColumn[];
  rows: ParsedSpectrumTableRow[];
}

export interface NormalizeTableDefinitionOptions {
  columns?: SpectrumTableColumnData[] | undefined;
  items?: SpectrumTableRowData[] | undefined;
  slotDefinition?: ParsedSpectrumTableDefinition | null | undefined;
}

export interface NormalizedSpectrumTableColumn {
  key: TableKey;
  textValue: string;
  title?: string | undefined;
  content?: VNodeChild;
  allowsSorting?: boolean | undefined;
  isRowHeader?: boolean | undefined;
  colSpan?: number | undefined;
}

export interface NormalizedSpectrumTableCell {
  key: TableKey;
  textValue: string;
  value?: unknown;
  colSpan?: number | undefined;
}

export interface NormalizedSpectrumTableRow {
  key: TableKey;
  textValue: string;
  value?: SpectrumTableRowData | undefined;
  isDisabled?: boolean | undefined;
  cells: NormalizedSpectrumTableCell[];
}

export interface NormalizedSpectrumTableDefinition {
  columns: NormalizedSpectrumTableColumn[];
  rows: NormalizedSpectrumTableRow[];
}

function isTableKey(value: unknown): value is TableKey {
  return typeof value === "string" || typeof value === "number";
}

function normalizeKey(value: unknown, fallback: TableKey): TableKey {
  return isTableKey(value) ? value : fallback;
}

function toStringValue(value: unknown): string {
  if (value == null) {
    return "";
  }

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return "";
}

export function extractTextContent(value: unknown): string {
  if (value == null) {
    return "";
  }

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map((entry) => extractTextContent(entry)).join("");
  }

  if (isVNode(value)) {
    if (typeof value.children === "string") {
      return value.children;
    }

    if (Array.isArray(value.children)) {
      return extractTextContent(value.children);
    }

    if (value.type === Text) {
      return toStringValue(value.children);
    }

    if (value.type === Fragment) {
      return extractTextContent(value.children);
    }

    if (value.children && typeof value.children === "object") {
      const maybeDefault = (value.children as { default?: (() => unknown) | undefined }).default;
      if (typeof maybeDefault === "function") {
        return extractTextContent(maybeDefault());
      }
    }
  }

  return "";
}

function flattenVNodeChildren(input: unknown): VNode[] {
  if (input == null) {
    return [];
  }

  if (Array.isArray(input)) {
    return input.flatMap((entry) => flattenVNodeChildren(entry));
  }

  if (!isVNode(input)) {
    return [];
  }

  if (input.type === Fragment) {
    return flattenVNodeChildren(input.children);
  }

  return [input];
}

function getSlotChildren(node: VNode): VNode[] {
  if (Array.isArray(node.children)) {
    return flattenVNodeChildren(node.children);
  }

  if (node.children && typeof node.children === "object") {
    const maybeDefault = (node.children as { default?: (() => unknown) | undefined }).default;
    if (typeof maybeDefault === "function") {
      return flattenVNodeChildren(maybeDefault());
    }
  }

  return [];
}

function getSlotContent(node: VNode): VNodeChild {
  if (Array.isArray(node.children)) {
    return node.children as VNodeChild;
  }

  if (typeof node.children === "string") {
    return node.children;
  }

  if (node.children && typeof node.children === "object") {
    const maybeDefault = (node.children as { default?: (() => unknown) | undefined }).default;
    if (typeof maybeDefault === "function") {
      return maybeDefault() as VNodeChild;
    }
  }

  return "";
}

function getTableNodeType(node: VNode): string | undefined {
  const type = node.type as
    | string
    | symbol
    | { name?: string | undefined; __spectrumTableNodeType?: string | undefined };

  if (typeof type === "string") {
    return type;
  }

  if (typeof type === "symbol") {
    return undefined;
  }

  return type.__spectrumTableNodeType ?? type.name;
}

function isCellNodeType(nodeType: string | undefined): boolean {
  return nodeType === "cell" || nodeType === "editable-cell" || nodeType === "Cell" || nodeType === "EditableCell";
}

function parseColumnNode(node: VNode, index: number): ParsedSpectrumTableColumn {
  const props = (node.props ?? {}) as Record<string, unknown>;
  const content = getSlotContent(node);
  const textValue =
    toStringValue(props.textValue ?? props.title ?? props.name) || extractTextContent(content);

  return {
    key: normalizeKey(node.key ?? props.id ?? props.key, `column-${index}`),
    textValue,
    allowsSorting: Boolean(props.allowsSorting),
    isRowHeader: Boolean(props.isRowHeader),
    colSpan: typeof props.colSpan === "number" && Number.isFinite(props.colSpan) ? props.colSpan : undefined,
    content,
  };
}

function parseCellNode(node: VNode, index: number): ParsedSpectrumTableCell {
  const props = (node.props ?? {}) as Record<string, unknown>;
  const content = getSlotContent(node);
  const textValue = toStringValue(props.textValue) || extractTextContent(content);

  return {
    key: normalizeKey(node.key ?? props.id ?? props.key, `cell-${index}`),
    textValue,
    colSpan: typeof props.colSpan === "number" && Number.isFinite(props.colSpan) ? props.colSpan : undefined,
    content,
  };
}

function parseRowNode(node: VNode, index: number): ParsedSpectrumTableRow {
  const props = (node.props ?? {}) as Record<string, unknown>;
  const children = getSlotChildren(node);
  const cells = children
    .filter((child) => isCellNodeType(getTableNodeType(child)))
    .map((child, cellIndex) => parseCellNode(child, cellIndex));

  return {
    key: normalizeKey(node.key ?? props.id ?? props.key, `row-${index}`),
    textValue: toStringValue(props.textValue),
    isDisabled: Boolean(props.isDisabled),
    cells,
  };
}

export function parseTableSlotDefinition(nodes: VNode[] | undefined): ParsedSpectrumTableDefinition | null {
  if (!nodes || nodes.length === 0) {
    return null;
  }

  const topLevelNodes = flattenVNodeChildren(nodes);
  const headerNode = topLevelNodes.find((node) => {
    const type = getTableNodeType(node);
    return type === "table-header" || type === "TableHeader";
  });
  const bodyNode = topLevelNodes.find((node) => {
    const type = getTableNodeType(node);
    return type === "table-body" || type === "TableBody";
  });

  if (!headerNode && !bodyNode) {
    return null;
  }

  const columns = (headerNode ? getSlotChildren(headerNode) : [])
    .filter((node) => {
      const type = getTableNodeType(node);
      return type === "column" || type === "Column";
    })
    .map((node, index) => parseColumnNode(node, index));

  const rows: ParsedSpectrumTableRow[] = [];
  if (bodyNode) {
    const bodyChildren = getSlotChildren(bodyNode);
    for (const child of bodyChildren) {
      const type = getTableNodeType(child);
      if (type === "row" || type === "Row") {
        rows.push(parseRowNode(child, rows.length));
        continue;
      }

      if (type === "section" || type === "Section") {
        const sectionRows = getSlotChildren(child).filter((sectionChild) => {
          const sectionChildType = getTableNodeType(sectionChild);
          return sectionChildType === "row" || sectionChildType === "Row";
        });
        for (const sectionRow of sectionRows) {
          rows.push(parseRowNode(sectionRow, rows.length));
        }
      }
    }
  }

  return {
    columns,
    rows,
  };
}

function normalizeColumnsFromSlot(
  columns: ParsedSpectrumTableColumn[],
  rows: ParsedSpectrumTableRow[]
): NormalizedSpectrumTableColumn[] {
  if (columns.length > 0) {
    return columns.map((column, index) => {
      const key = normalizeKey(column.key, `column-${index}`);
      const title = column.textValue && column.textValue.length > 0 ? column.textValue : `Column ${index + 1}`;
      return {
        key,
        textValue: title,
        title,
        content: column.content,
        allowsSorting: column.allowsSorting,
        isRowHeader: column.isRowHeader,
        colSpan: column.colSpan,
      };
    });
  }

  const maxCellCount = rows.reduce((count, row) => Math.max(count, row.cells.length), 0);
  return Array.from({ length: maxCellCount }, (_, index) => ({
    key: `column-${index}`,
    textValue: `Column ${index + 1}`,
    title: `Column ${index + 1}`,
  }));
}

function normalizeRowsFromSlot(
  rows: ParsedSpectrumTableRow[],
  columns: NormalizedSpectrumTableColumn[]
): NormalizedSpectrumTableRow[] {
  return rows.map((row, rowIndex) => {
    const normalizedCells = columns.map((column, columnIndex) => {
      const cell = row.cells[columnIndex];
      if (!cell) {
        return {
          key: column.key,
          textValue: "",
          value: "",
        };
      }

      const textValue = cell.textValue ?? extractTextContent(cell.content);
      return {
        key: normalizeKey(cell.key, column.key),
        textValue,
        value: cell.content,
        colSpan: cell.colSpan,
      };
    });

    const textValue =
      row.textValue
      || normalizedCells
        .map((cell) => cell.textValue)
        .filter((value): value is string => value.length > 0)
        .join(" ");

    return {
      key: normalizeKey(row.key, rowIndex),
      textValue,
      isDisabled: row.isDisabled,
      cells: normalizedCells,
    };
  });
}

function normalizeColumnsFromProps(
  columns: SpectrumTableColumnData[] | undefined,
  items: SpectrumTableRowData[] | undefined
): NormalizedSpectrumTableColumn[] {
  if (columns && columns.length > 0) {
    return columns.map((column, index) => {
      const key = normalizeKey(column.key ?? column.id, `column-${index}`);
      const title = column.title ?? column.name ?? column.textValue ?? `Column ${index + 1}`;
      return {
        key,
        textValue: column.textValue ?? title,
        title,
        allowsSorting: column.allowsSorting,
        isRowHeader: column.isRowHeader,
        colSpan: column.colSpan,
      };
    });
  }

  const maxCellCount = (items ?? []).reduce((count, item) => {
    if (Array.isArray(item.cells)) {
      return Math.max(count, item.cells.length);
    }
    return count;
  }, 0);

  return Array.from({ length: maxCellCount }, (_, index) => ({
    key: `column-${index}`,
    textValue: `Column ${index + 1}`,
    title: `Column ${index + 1}`,
  }));
}

function readItemCellValue(
  item: SpectrumTableRowData,
  column: NormalizedSpectrumTableColumn,
  columnIndex: number
): SpectrumTableCellData {
  if (Array.isArray(item.cells)) {
    const explicitCell = item.cells[columnIndex];
    if (explicitCell) {
      return explicitCell;
    }
  }

  const lookupKey = typeof column.key === "string" || typeof column.key === "number" ? String(column.key) : null;
  const rawValue = lookupKey ? (item as Record<string, unknown>)[lookupKey] : undefined;
  return {
    key: column.key,
    value: rawValue,
    textValue: extractTextContent(rawValue),
  };
}

function normalizeRowsFromProps(
  items: SpectrumTableRowData[] | undefined,
  columns: NormalizedSpectrumTableColumn[]
): NormalizedSpectrumTableRow[] {
  if (!items || items.length === 0) {
    return [];
  }

  return items.map((item, rowIndex) => {
    const cells = columns.map((column, columnIndex) => {
      const cell = readItemCellValue(item, column, columnIndex);
      return {
        key: normalizeKey(cell.key, column.key),
        textValue: cell.textValue ?? extractTextContent(cell.value),
        value: cell.value,
        colSpan: cell.colSpan,
      };
    });

    const textValue =
      item.textValue
      || cells
        .map((cell) => cell.textValue)
        .filter((value): value is string => value.length > 0)
        .join(" ");

    return {
      key: normalizeKey(item.key ?? item.id, rowIndex),
      textValue,
      value: item,
      isDisabled: item.isDisabled,
      cells,
    };
  });
}

export function normalizeTableDefinition(
  options: NormalizeTableDefinitionOptions
): NormalizedSpectrumTableDefinition {
  if (options.slotDefinition && options.slotDefinition.rows.length > 0) {
    const columns = normalizeColumnsFromSlot(options.slotDefinition.columns, options.slotDefinition.rows);
    const rows = normalizeRowsFromSlot(options.slotDefinition.rows, columns);
    return {
      columns,
      rows,
    };
  }

  const columns = normalizeColumnsFromProps(options.columns, options.items);
  const rows = normalizeRowsFromProps(options.items, columns);
  return {
    columns,
    rows,
  };
}

export function getSortCellValue(row: NormalizedSpectrumTableRow, columnIndex: number): unknown {
  const cell = row.cells[columnIndex];
  if (!cell) {
    return "";
  }

  if (typeof cell.value === "number" || typeof cell.value === "string") {
    return cell.value;
  }

  return cell.textValue ?? "";
}

export function compareSortValues(left: unknown, right: unknown): number {
  if (typeof left === "number" && typeof right === "number") {
    return left - right;
  }

  return String(left ?? "").localeCompare(String(right ?? ""), undefined, {
    numeric: true,
    sensitivity: "base",
  });
}
