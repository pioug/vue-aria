import {
  useTable,
  useTableCell,
  useTableColumnHeader,
  useTableRow,
  useTableSelectAllCheckbox,
  useTableSelectionCheckbox,
} from "@vue-aria/table";
import { tableNestedRows } from "@vue-aria/flags";
import {
  TableCollection,
  UNSTABLE_useTreeGridState,
  useTableState,
  type GridNode,
  type SortDescriptor,
  type TableState,
  type TreeGridState,
} from "@vue-aria/table-state";
import { useLocalizedStringFormatter } from "@vue-aria/i18n";
import { mergeProps } from "@vue-aria/utils";
import { defineComponent, h, ref, shallowRef, computed, watchEffect, type PropType, type VNode, type VNodeChild } from "vue";
import type {
  NormalizedSpectrumTableCell,
  NormalizedSpectrumTableColumn,
  NormalizedSpectrumTableDefinition,
  ParsedSpectrumTableDefinition,
  NormalizedSpectrumTableRow,
  SpectrumSortDescriptor,
  SpectrumTableCellData,
  SpectrumTableColumnData,
  SpectrumTableRowData,
  SpectrumTableSelectionMode,
  SpectrumTableSelectionStyle,
  TableKey,
} from "./types";
import {
  compareSortValues,
  getSortCellValue,
  normalizeTableDefinition,
  parseTableSlotDefinition,
} from "./types";
import { intlMessages } from "./intlMessages";

export interface SpectrumTableViewProps {
  id?: string | undefined;
  columns?: SpectrumTableColumnData[] | undefined;
  items?: SpectrumTableRowData[] | undefined;
  selectionMode?: SpectrumTableSelectionMode | undefined;
  selectionStyle?: SpectrumTableSelectionStyle | undefined;
  selectedKeys?: Iterable<TableKey> | undefined;
  defaultSelectedKeys?: Iterable<TableKey> | undefined;
  disabledKeys?: Iterable<TableKey> | undefined;
  disabledBehavior?: "all" | "selection" | undefined;
  disallowEmptySelection?: boolean | undefined;
  allowDuplicateSelectionEvents?: boolean | undefined;
  disallowSelectAll?: boolean | undefined;
  disallowTypeAhead?: boolean | undefined;
  escapeKeyBehavior?: "clearSelection" | "none" | undefined;
  shouldSelectOnPressUp?: boolean | undefined;
  density?: "compact" | "regular" | "spacious" | undefined;
  overflowMode?: "wrap" | "truncate" | undefined;
  isQuiet?: boolean | undefined;
  isDisabled?: boolean | undefined;
  isKeyboardNavigationDisabled?: boolean | undefined;
  autoFocus?: true | "first" | "last" | undefined;
  sortDescriptor?: SpectrumSortDescriptor | null | undefined;
  defaultSortDescriptor?: SpectrumSortDescriptor | null | undefined;
  UNSTABLE_allowsExpandableRows?: boolean | undefined;
  UNSTABLE_expandedKeys?: "all" | Iterable<TableKey> | undefined;
  UNSTABLE_defaultExpandedKeys?: "all" | Iterable<TableKey> | undefined;
  UNSTABLE_onExpandedChange?: ((keys: Set<TableKey>) => void) | undefined;
  onSortChange?: ((descriptor: SpectrumSortDescriptor) => void) | undefined;
  onSelectionChange?: ((keys: Set<TableKey>) => void) | undefined;
  onAction?: ((key: TableKey) => void) | undefined;
  renderEmptyState?: (() => unknown) | undefined;
  ariaLabel?: string | undefined;
  ariaLabelledby?: string | undefined;
  ariaDescribedby?: string | undefined;
  "aria-label"?: string | undefined;
  "aria-labelledby"?: string | undefined;
  "aria-describedby"?: string | undefined;
  onFocus?: ((event: FocusEvent) => void) | undefined;
  onBlur?: ((event: FocusEvent) => void) | undefined;
  onFocusChange?: ((isFocused: boolean) => void) | undefined;
  onKeydown?: ((event: KeyboardEvent) => void) | undefined;
  onKeyup?: ((event: KeyboardEvent) => void) | undefined;
  slot?: string | undefined;
  isHidden?: boolean | undefined;
  UNSAFE_className?: string | undefined;
  UNSAFE_style?: Record<string, string | number> | undefined;
}

export interface SpectrumColumnProps extends SpectrumTableColumnData {}

export interface SpectrumTableHeaderProps {
  columns?: SpectrumTableColumnData[] | undefined;
}

export interface SpectrumTableBodyProps {
  items?: SpectrumTableRowData[] | undefined;
}

export interface SpectrumSectionProps {
  id?: TableKey | undefined;
  title?: string | undefined;
  "aria-label"?: string | undefined;
}

export interface SpectrumRowProps {
  id?: TableKey | undefined;
  textValue?: string | undefined;
  isDisabled?: boolean | undefined;
  UNSTABLE_childItems?: Iterable<SpectrumTableRowData> | undefined;
}

export interface SpectrumCellProps extends SpectrumTableCellData {
  id?: TableKey | undefined;
}

export interface SpectrumEditableCellProps extends SpectrumCellProps {}

function createStaticTableComponent(name: string, props: Record<string, unknown>) {
  return defineComponent({
    name,
    props: props as any,
    setup() {
      return () => null;
    },
  });
}

function normalizeKey(value: unknown, fallback: TableKey): TableKey {
  if (typeof value === "string" || typeof value === "number") {
    return value;
  }

  return fallback;
}

function setsEqual(left: Set<TableKey>, right: Set<TableKey>): boolean {
  if (left.size !== right.size) {
    return false;
  }

  for (const value of left) {
    if (!right.has(value)) {
      return false;
    }
  }

  return true;
}

function flattenNormalizedRows(rows: NormalizedSpectrumTableRow[]): NormalizedSpectrumTableRow[] {
  const flattened: NormalizedSpectrumTableRow[] = [];
  const visit = (row: NormalizedSpectrumTableRow) => {
    flattened.push(row);
    for (const childRow of row.childRows) {
      visit(childRow);
    }
  };

  for (const row of rows) {
    visit(row);
  }

  return flattened;
}

function isRenderableNode(node: VNode): boolean {
  return typeof node.type !== "symbol";
}

function getTableSlotDefinitionSignature(definition: ParsedSpectrumTableDefinition | null): string {
  if (!definition) {
    return "";
  }

  const columnSignature = definition.columns
    .map((column) =>
      [
        String(column.key ?? ""),
        column.textValue ?? "",
        column.align ?? "",
        column.colSpan ?? "",
        column.allowsSorting ? "1" : "0",
        column.isRowHeader ? "1" : "0",
        column.hideHeader ? "1" : "0",
        column.showDivider ? "1" : "0",
      ].join(":")
    )
    .join("|");
  const createRowSignature = (row: NormalizedSpectrumTableRow | ParsedSpectrumTableDefinition["rows"][number]): string => {
    const cells = row.cells
      .map((cell) => [String(cell.key ?? ""), cell.textValue ?? "", cell.colSpan ?? ""].join(":"))
      .join(",");
    const childRows = "childRows" in row && Array.isArray(row.childRows)
      ? row.childRows.map((childRow) => createRowSignature(childRow as any)).join(";")
      : "";
    return [
      String(row.key ?? ""),
      row.textValue ?? "",
      row.isDisabled ? "1" : "0",
      cells,
      childRows,
    ].join(":");
  };
  const rowSignature = definition.rows.map((row) => createRowSignature(row as any)).join("|");

  return `${columnSignature}__${rowSignature}`;
}

function createColumnNodes(definition: NormalizedSpectrumTableDefinition): GridNode<NormalizedSpectrumTableRow>[] {
  return definition.columns.map((column, index) => ({
    type: "column",
    key: column.key,
    value: null,
    rendered: column.content ?? column.title ?? column.textValue,
    textValue: column.textValue,
    level: 0,
    index,
    hasChildNodes: false,
    childNodes: [],
    parentKey: null,
    prevKey: index > 0 ? definition.columns[index - 1]?.key ?? null : null,
    nextKey: null,
    firstChildKey: null,
    lastChildKey: null,
    props: {
      allowsSorting: column.allowsSorting,
      isRowHeader: column.isRowHeader,
      align: column.align,
      hideHeader: column.hideHeader,
      showDivider: column.showDivider,
      colSpan: column.colSpan,
    },
  }));
}

function resolveCellAlignment(node: GridNode<NormalizedSpectrumTableRow>): "start" | "center" | "end" | undefined {
  const columnProps = node.column?.props as Record<string, unknown> | undefined;
  const nodeProps = node.props as Record<string, unknown> | undefined;
  const align = columnProps?.align ?? nodeProps?.align;
  return align === "start" || align === "center" || align === "end" ? align : undefined;
}

function createRowCellNodes(
  row: NormalizedSpectrumTableRow,
  rowIndex: number,
  columns: NormalizedSpectrumTableColumn[],
  showSelectionCheckboxes: boolean
): GridNode<NormalizedSpectrumTableRow>[] {
  const normalizedRowCells: NormalizedSpectrumTableCell[] = row.cells.length > 0
    ? row.cells
    : columns.map((column) => ({
      key: column.key,
      textValue: "",
      value: "",
    }));
  const cells: GridNode<NormalizedSpectrumTableRow>[] = [];
  let columnCursor = 0;

  if (showSelectionCheckboxes) {
    cells.push({
      type: "cell",
      key: `selection-${String(row.key)}`,
      value: row,
      rendered: null,
      textValue: "",
      level: 2,
      index: 0,
      hasChildNodes: false,
      childNodes: [],
      parentKey: row.key,
      prevKey: null,
      nextKey: null,
      firstChildKey: null,
      lastChildKey: null,
      props: {
        isSelectionCell: true,
      },
      colSpan: 1,
      colIndex: 0,
    });
    columnCursor = 1;
  }

  for (let cellIndex = 0; cellIndex < normalizedRowCells.length; cellIndex += 1) {
    const cell = normalizedRowCells[cellIndex]!;
    const column = columns[Math.min(columnCursor, Math.max(columns.length - 1, 0))];
    const fallbackColumnKey = column?.key ?? `column-${columnCursor}`;
    const key = normalizeKey(cell.key, `${String(row.key)}-${String(fallbackColumnKey)}`);
    const rendered = cell.value ?? cell.textValue;

    cells.push({
      type: "cell",
      key,
      value: row,
      rendered,
      textValue: cell.textValue ?? "",
      level: 2,
      index: cellIndex + (showSelectionCheckboxes ? 1 : 0),
      hasChildNodes: false,
      childNodes: [],
      parentKey: row.key,
      prevKey: cells.length > 0 ? cells[cells.length - 1]?.key ?? null : null,
      nextKey: null,
      firstChildKey: null,
      lastChildKey: null,
      props: {
        colSpan: cell.colSpan,
      },
      colSpan: cell.colSpan ?? null,
      colIndex: columnCursor,
    });
    columnCursor += Math.max(1, cell.colSpan ?? 1);
  }

  for (let cellIndex = 0; cellIndex < cells.length - 1; cellIndex += 1) {
    cells[cellIndex]!.nextKey = cells[cellIndex + 1]!.key;
  }

  return cells;
}

interface CreateCollectionOptions {
  allowsExpandableRows?: boolean;
  showSelectionCheckboxes?: boolean;
}

function createRowNodes(
  rows: NormalizedSpectrumTableRow[],
  columns: NormalizedSpectrumTableColumn[],
  parentKey: TableKey,
  level: number,
  allowsExpandableRows: boolean,
  showSelectionCheckboxes: boolean
): GridNode<NormalizedSpectrumTableRow>[] {
  const rowNodes = rows.map((row, rowIndex) => {
    const cells = createRowCellNodes(row, rowIndex, columns, showSelectionCheckboxes);
    for (let cellIndex = 0; cellIndex < cells.length; cellIndex += 1) {
      if (cellIndex < cells.length - 1) {
        cells[cellIndex]!.nextKey = cells[cellIndex + 1]!.key;
      }
    }

    const childRows = allowsExpandableRows
      ? createRowNodes(row.childRows, columns, row.key, level + 1, allowsExpandableRows, showSelectionCheckboxes)
      : [];
    const childNodes = allowsExpandableRows ? [...cells, ...childRows] : cells;
    const childItems = row.childRows.map((childRow) => childRow.value ?? childRow);

    return {
      type: "item",
      key: row.key,
      value: row,
      rendered: null,
      textValue: row.textValue,
      level,
      index: rowIndex,
      hasChildNodes: childNodes.length > 0,
      childNodes,
      parentKey,
      prevKey: rowIndex > 0 ? rows[rowIndex - 1]?.key ?? null : null,
      nextKey: null,
      firstChildKey: childNodes[0]?.key ?? null,
      lastChildKey: childNodes[childNodes.length - 1]?.key ?? null,
      props: {
        isDisabled: row.isDisabled,
        children: childNodes,
        UNSTABLE_childItems: childItems.length > 0 ? childItems : undefined,
      },
    } as GridNode<NormalizedSpectrumTableRow>;
  });

  for (let rowIndex = 0; rowIndex < rowNodes.length; rowIndex += 1) {
    if (rowIndex < rowNodes.length - 1) {
      rowNodes[rowIndex]!.nextKey = rowNodes[rowIndex + 1]!.key;
    }
  }

  return rowNodes;
}

function createCollection(
  definition: NormalizedSpectrumTableDefinition,
  options: CreateCollectionOptions = {}
): TableCollection<NormalizedSpectrumTableRow> {
  const columnNodes = createColumnNodes(definition);
  for (let index = 0; index < columnNodes.length; index += 1) {
    if (index < columnNodes.length - 1) {
      columnNodes[index]!.nextKey = columnNodes[index + 1]!.key;
    }
  }

  const bodyRows = createRowNodes(
    definition.rows,
    definition.columns,
    "body",
    1,
    Boolean(options.allowsExpandableRows),
    Boolean(options.showSelectionCheckboxes)
  );

  const bodyNode: GridNode<NormalizedSpectrumTableRow> = {
    type: "body",
    key: "body",
    value: null,
    rendered: null,
    textValue: "",
    level: 0,
    index: 0,
    hasChildNodes: bodyRows.length > 0,
    childNodes: bodyRows,
    parentKey: null,
    prevKey: null,
    nextKey: null,
    firstChildKey: bodyRows[0]?.key ?? null,
    lastChildKey: bodyRows[bodyRows.length - 1]?.key ?? null,
  };

  const topLevelNodes = [...columnNodes, bodyNode];
  return new TableCollection<NormalizedSpectrumTableRow>(
    topLevelNodes,
    null,
    options.allowsExpandableRows
      ? undefined
      : {
        showSelectionCheckboxes: Boolean(options.showSelectionCheckboxes),
      }
  );
}

function sortDefinition(
  definition: NormalizedSpectrumTableDefinition,
  sortDescriptor: SpectrumSortDescriptor | null
): NormalizedSpectrumTableDefinition {
  if (!sortDescriptor) {
    return definition;
  }

  const columnIndex = definition.columns.findIndex((column) => column.key === sortDescriptor.column);
  if (columnIndex < 0) {
    return definition;
  }

  const sortedRows = [...definition.rows].sort((left, right) => {
    const leftValue = getSortCellValue(left, columnIndex);
    const rightValue = getSortCellValue(right, columnIndex);
    const order = compareSortValues(leftValue, rightValue);
    return sortDescriptor.direction === "descending" ? -order : order;
  });

  return {
    columns: definition.columns,
    rows: sortedRows,
  };
}

function getTableBodyRows(referenceElement: HTMLElement | null): HTMLElement[] {
  if (!referenceElement) {
    return [];
  }

  const tableElement = referenceElement.closest("table");
  if (!tableElement) {
    return [];
  }

  const bodyElement = tableElement.querySelector("tbody");
  if (!bodyElement) {
    return [];
  }

  return Array.from(bodyElement.querySelectorAll('[role="row"]')) as HTMLElement[];
}

function focusCellInRowByColIndex(rowElement: HTMLElement | null, colIndex: string | null): boolean {
  if (!rowElement) {
    return false;
  }

  const safeColIndex = colIndex?.trim() ?? "";
  let nextCell: HTMLElement | null = null;
  if (safeColIndex.length > 0) {
    nextCell = rowElement.querySelector(
      `[role="rowheader"][aria-colindex="${safeColIndex}"],[role="gridcell"][aria-colindex="${safeColIndex}"]`
    ) as HTMLElement | null;
  }

  if (!nextCell) {
    nextCell = rowElement.querySelector('[role="rowheader"],[role="gridcell"]') as HTMLElement | null;
  }

  if (!nextCell) {
    return false;
  }

  nextCell.focus();
  return true;
}

function focusCellInAdjacentBodyRow(cellElement: HTMLElement | null, direction: 1 | -1): boolean {
  if (!cellElement) {
    return false;
  }

  const rowElement = cellElement.closest('[role="row"]') as HTMLElement | null;
  if (!rowElement) {
    return false;
  }

  const rows = getTableBodyRows(cellElement);
  const currentRowIndex = rows.indexOf(rowElement);
  if (currentRowIndex < 0) {
    return false;
  }

  const nextRow = rows[currentRowIndex + direction] ?? null;
  if (!nextRow) {
    return false;
  }

  return focusCellInRowByColIndex(nextRow, cellElement.getAttribute("aria-colindex"));
}

const TableSelectionCheckbox = defineComponent({
  name: "SpectrumTableSelectionCheckbox",
  props: {
    checkboxProps: {
      type: Object as PropType<Record<string, unknown>>,
      required: true,
    },
  },
  setup(props) {
    const inputRef = ref<HTMLInputElement | null>(null);

    watchEffect(() => {
      if (inputRef.value) {
        inputRef.value.indeterminate = Boolean(props.checkboxProps.isIndeterminate);
      }
    });

    return () => {
      const checkboxProps = props.checkboxProps as Record<string, unknown>;
      const isSelected = Boolean(checkboxProps.isSelected);
      const isIndeterminate = Boolean(checkboxProps.isIndeterminate);
      const isDisabled = Boolean(checkboxProps.isDisabled);
      const ariaChecked = isIndeterminate ? "mixed" : isSelected ? "true" : "false";

      return h("input", {
        ref: inputRef,
        type: "checkbox",
        role: "checkbox",
        class: "react-spectrum-Table-selectionCheckbox",
        id: checkboxProps.id as string | undefined,
        "aria-label": checkboxProps["aria-label"] as string | undefined,
        "aria-labelledby": checkboxProps["aria-labelledby"] as string | undefined,
        "aria-checked": ariaChecked,
        checked: isSelected,
        disabled: isDisabled,
        onChange: () => {
          const onChange = checkboxProps.onChange as ((value?: boolean) => void) | undefined;
          onChange?.(!isSelected);
        },
      });
    };
  },
});

const TableHeaderCell = defineComponent({
  name: "SpectrumTableHeaderCell",
  props: {
    node: {
      type: Object as PropType<GridNode<NormalizedSpectrumTableRow>>,
      required: true,
    },
    state: {
      type: Object as PropType<TableState<NormalizedSpectrumTableRow>>,
      required: true,
    },
    isDisabled: {
      type: Boolean as PropType<boolean | undefined>,
      required: false,
      default: undefined,
    },
  },
  setup(props) {
    const refObject = ref<HTMLElement | null>(null);
    const domRef = {
      get current() {
        return refObject.value;
      },
      set current(value: HTMLElement | null) {
        refObject.value = value;
      },
    };

    const { columnHeaderProps } = useTableColumnHeader(
      {
        get node() {
          return props.node;
        },
        get isDisabled() {
          return props.isDisabled;
        },
      } as any,
      props.state,
      domRef
    );
    const alignment = computed(() => resolveCellAlignment(props.node));
    const columnProps = computed(() => (props.node.props ?? {}) as Record<string, unknown>);
    const isSelectionCell = computed(() => Boolean(columnProps.value.isSelectionCell));
    const isSorted = computed(() => props.state.sortDescriptor?.column === props.node.key);
    const sortDirection = computed(() => (isSorted.value ? props.state.sortDescriptor?.direction : undefined));
    const { checkboxProps: selectAllCheckboxProps } = useTableSelectAllCheckbox(props.state);
    const handleHeaderArrowDown = (event: KeyboardEvent) => {
      if (!("expandedKeys" in props.state)) {
        return;
      }

      if (event.altKey || event.ctrlKey || event.metaKey) {
        return;
      }

      if (event.key !== "ArrowDown") {
        return;
      }

      const firstBodyRow = getTableBodyRows(refObject.value)[0] ?? null;
      if (!firstBodyRow) {
        return;
      }

      if (focusCellInRowByColIndex(firstBodyRow, refObject.value?.getAttribute("aria-colindex") ?? null)) {
        event.preventDefault();
      }
    };
    const headerCellProps = computed(() =>
      mergeProps(columnHeaderProps, {
        onKeydown: handleHeaderArrowDown,
        onKeyDown: handleHeaderArrowDown,
      }) as Record<string, unknown>
    );

    return () =>
      h(
        "th",
        {
          ...headerCellProps.value,
          ref: refObject,
          class: [
            "spectrum-Table-headCell",
            "react-spectrum-Table-headCell",
            "react-spectrum-Table-cell",
            {
              "react-spectrum-Table-cell--selectionCell": isSelectionCell.value,
              "is-sortable": Boolean(columnProps.value.allowsSorting),
              "is-sorted-asc": sortDirection.value === "ascending",
              "is-sorted-desc": sortDirection.value === "descending",
              "react-spectrum-Table-cell--alignStart": alignment.value === "start",
              "react-spectrum-Table-cell--alignCenter": alignment.value === "center",
              "react-spectrum-Table-cell--alignEnd": alignment.value === "end",
              "spectrum-Table-cell--hideHeader": Boolean(columnProps.value.hideHeader),
            },
          ],
          "aria-colindex":
            props.node.colIndex != null ? props.node.colIndex + 1 : props.node.index + 1,
        },
        isSelectionCell.value
          ? h(TableSelectionCheckbox, { checkboxProps: selectAllCheckboxProps })
          : Boolean(columnProps.value.hideHeader)
            ? h("span", { class: "spectrum-Table-visuallyHidden" }, props.node.rendered as any)
            : h("div", { class: "spectrum-Table-headCellContents" }, props.node.rendered as any)
      );
  },
});

const TableBodyCell = defineComponent({
  name: "SpectrumTableBodyCell",
  props: {
    node: {
      type: Object as PropType<GridNode<NormalizedSpectrumTableRow>>,
      required: true,
    },
    state: {
      type: Object as PropType<TableState<NormalizedSpectrumTableRow>>,
      required: true,
    },
  },
  setup(props) {
    const refObject = ref<HTMLElement | null>(null);
    const domRef = {
      get current() {
        return refObject.value;
      },
      set current(value: HTMLElement | null) {
        refObject.value = value;
      },
    };

    const { gridCellProps } = useTableCell(
      {
        get node() {
          return props.node;
        },
      },
      props.state,
      domRef
    );

    const resolvedColSpan = computed(() =>
      props.node.colSpan != null && props.node.colSpan > 1 ? props.node.colSpan : undefined
    );
    const isTreeGridState = computed(() => "expandedKeys" in props.state);
    const isSelectionCell = computed(
      () =>
        Boolean((props.node.props as Record<string, unknown> | undefined)?.isSelectionCell)
        || Boolean((props.node.column?.props as Record<string, unknown> | undefined)?.isSelectionCell)
    );
    const firstRowHeaderKey = computed(() => Array.from(props.state.collection.rowHeaderColumnKeys)[0]);
    const isPrimaryRowHeaderCell = computed(
      () =>
        props.node.column != null
        && props.node.column.key === firstRowHeaderKey.value
        && props.state.collection.rowHeaderColumnKeys.has(props.node.column.key)
    );
    const treeGridRowNode = computed(() => {
      if (!isTreeGridState.value) {
        return null;
      }

      const rowKey = props.node.parentKey;
      if (rowKey == null) {
        return null;
      }

      return (props.state as TreeGridState<NormalizedSpectrumTableRow>).keyMap.get(rowKey) ?? null;
    });
    const hasExpandableChildren = computed(() => {
      const treeNode = treeGridRowNode.value;
      if (!treeNode) {
        return false;
      }

      return (
        !!(treeNode.props as { UNSTABLE_childItems?: Iterable<unknown> } | undefined)?.UNSTABLE_childItems
        || ((treeNode.props as { children?: unknown[] } | undefined)?.children?.length ?? 0)
          > (props.state as TreeGridState<NormalizedSpectrumTableRow>).userColumnCount
      );
    });
    const isExpanded = computed(() => {
      if (!isTreeGridState.value || !treeGridRowNode.value) {
        return false;
      }

      const expandedKeys = (props.state as TreeGridState<NormalizedSpectrumTableRow>).expandedKeys;
      return expandedKeys === "all" || expandedKeys.has(treeGridRowNode.value.key);
    });
    const canRenderExpander = computed(
      () => isTreeGridState.value && isPrimaryRowHeaderCell.value && hasExpandableChildren.value
    );
    const stringFormatter = useLocalizedStringFormatter(
      intlMessages as any,
      "@react-spectrum/table"
    );
    const alignment = computed(() => resolveCellAlignment(props.node));
    const { checkboxProps: selectionCheckboxProps } = useTableSelectionCheckbox(
      {
        get key() {
          return props.node.parentKey as TableKey;
        },
      } as any,
      props.state
    );
    const toggleExpanded = () => {
      if (!canRenderExpander.value || !treeGridRowNode.value) {
        return;
      }

      (props.state as TreeGridState<NormalizedSpectrumTableRow>).toggleKey(treeGridRowNode.value.key);
    };
    const bodyCellProps = computed(() =>
      mergeProps(gridCellProps, {
        onKeydown: (event: KeyboardEvent) => {
          if (!isTreeGridState.value) {
            return;
          }

          if (event.altKey || event.ctrlKey || event.metaKey) {
            return;
          }

          if (event.key !== "ArrowDown" && event.key !== "ArrowUp") {
            return;
          }

          const direction = event.key === "ArrowDown" ? 1 : -1;
          if (focusCellInAdjacentBodyRow(refObject.value, direction)) {
            event.preventDefault();
          }
        },
      }) as Record<string, unknown>
    );

    return () =>
      h(
        "td",
        {
          ...bodyCellProps.value,
          ref: refObject,
          class: [
            "spectrum-Table-cell",
            "react-spectrum-Table-cell",
            {
              "react-spectrum-Table-cell--selectionCell": isSelectionCell.value,
              "react-spectrum-Table-cell--alignStart": alignment.value === "start",
              "react-spectrum-Table-cell--alignCenter": alignment.value === "center",
              "react-spectrum-Table-cell--alignEnd": alignment.value === "end",
              "spectrum-Table-cell--hideHeader": Boolean((props.node.column?.props as Record<string, unknown> | undefined)?.hideHeader),
              "spectrum-Table-cell--divider":
                Boolean((props.node.column?.props as Record<string, unknown> | undefined)?.showDivider)
                && props.node.column?.nextKey != null,
            },
          ],
          colSpan: resolvedColSpan.value,
          "aria-colspan": resolvedColSpan.value,
        },
        isSelectionCell.value
          ? h(TableSelectionCheckbox, { checkboxProps: selectionCheckboxProps })
          : h("div", { class: "spectrum-Table-cellContents" }, [
            canRenderExpander.value
              ? h(
                "button",
                {
                  type: "button",
                  class: "react-spectrum-Table-expander",
                  "data-table-expander": "true",
                  "aria-label": stringFormatter.format(isExpanded.value ? "collapse" : "expand"),
                  "aria-expanded": isExpanded.value ? "true" : "false",
                  onClick: () => {
                    toggleExpanded();
                  },
                },
                isExpanded.value ? "▼" : "▶"
              )
              : null,
            props.node.rendered as any,
          ])
      );
  },
});

const TableBodyRow = defineComponent({
  name: "SpectrumTableBodyRow",
  props: {
    node: {
      type: Object as PropType<GridNode<NormalizedSpectrumTableRow>>,
      required: true,
    },
    state: {
      type: Object as PropType<TableState<NormalizedSpectrumTableRow>>,
      required: true,
    },
    rowIndex: {
      type: Number,
      required: true,
    },
    rowOffset: {
      type: Number,
      required: true,
    },
    rowCount: {
      type: Number,
      required: true,
    },
    onAction: {
      type: Function as PropType<((key: TableKey) => void) | undefined>,
      required: false,
      default: undefined,
    },
    selectedKeys: {
      type: Object as PropType<Set<TableKey>>,
      required: true,
    },
  },
  setup(props) {
    const refObject = ref<HTMLElement | null>(null);
    const domRef = {
      get current() {
        return refObject.value;
      },
      set current(value: HTMLElement | null) {
        refObject.value = value;
      },
    };

    const { rowProps } = useTableRow(
      {
        get node() {
          return props.node;
        },
        onAction: props.onAction ? () => props.onAction?.(props.node.key) : undefined,
      } as any,
      props.state,
      domRef
    );
    const mergedRowProps = computed(() =>
      mergeProps(rowProps, {
        onKeydown: (event: KeyboardEvent) => {
          if (!("expandedKeys" in props.state)) {
            return;
          }

          if (event.target !== refObject.value) {
            return;
          }

          if (event.altKey || event.ctrlKey || event.metaKey) {
            return;
          }

          if (event.key !== "ArrowDown" && event.key !== "ArrowUp") {
            return;
          }

          const rows = getTableBodyRows(refObject.value);
          const currentRowIndex = refObject.value ? rows.indexOf(refObject.value) : -1;
          if (currentRowIndex < 0) {
            return;
          }

          const direction = event.key === "ArrowDown" ? 1 : -1;
          const nextRow = rows[currentRowIndex + direction] ?? null;
          if (!nextRow) {
            return;
          }

          nextRow.focus();
          event.preventDefault();
        },
      }) as Record<string, unknown>
    );

    return () => {
      const childNodes = Array.from(props.node.childNodes) as GridNode<NormalizedSpectrumTableRow>[];
      const isSelected =
        props.state.selectionManager.selectionMode !== "none"
        && props.selectedKeys.has(props.node.key);
      const ariaDisabled = (rowProps as Record<string, unknown>)["aria-disabled"];
      const isDisabled = ariaDisabled === true || ariaDisabled === "true";
      const isTreeGridRow = "expandedKeys" in props.state;

      return h(
        "tr",
        {
          ...mergedRowProps.value,
          ref: refObject,
          class: [
            "react-spectrum-Table-row",
            "spectrum-Table-row",
            {
              "spectrum-Table-row--highlightSelection": props.state.selectionManager.selectionBehavior === "replace",
              "spectrum-Table-row--firstRow": props.rowIndex === 0,
              "spectrum-Table-row--lastRow": props.rowIndex === props.rowCount - 1,
              "is-selected": isSelected,
              "is-disabled": isDisabled,
            },
          ],
          "aria-rowindex": isTreeGridRow ? undefined : props.rowOffset + props.rowIndex + 1,
          "aria-selected":
            props.state.selectionManager.selectionMode !== "none"
              ? (isSelected ? "true" : "false")
              : undefined,
        },
        childNodes.map((childNode) =>
          h(TableBodyCell, {
            key: String(childNode.key),
            node: childNode,
            state: props.state,
          })
        )
      );
    };
  },
});

export const Column = createStaticTableComponent("Column", {
  id: {
    type: [String, Number] as PropType<TableKey | undefined>,
    default: undefined,
  },
  name: {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  title: {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  textValue: {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  allowsSorting: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined,
  },
  isRowHeader: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined,
  },
  align: {
    type: String as PropType<"start" | "center" | "end" | undefined>,
    default: undefined,
  },
  hideHeader: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined,
  },
  showDivider: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined,
  },
  colSpan: {
    type: Number as PropType<number | undefined>,
    default: undefined,
  },
});
(Column as any).__spectrumTableNodeType = "column";

export const TableHeader = createStaticTableComponent("TableHeader", {
  columns: {
    type: Array as PropType<SpectrumTableColumnData[] | undefined>,
    default: undefined,
  },
});
(TableHeader as any).__spectrumTableNodeType = "table-header";

export const TableBody = createStaticTableComponent("TableBody", {
  items: {
    type: Array as PropType<SpectrumTableRowData[] | undefined>,
    default: undefined,
  },
});
(TableBody as any).__spectrumTableNodeType = "table-body";

export const Section = createStaticTableComponent("Section", {
  id: {
    type: [String, Number] as PropType<TableKey | undefined>,
    default: undefined,
  },
  title: {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  "aria-label": {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
});
(Section as any).__spectrumTableNodeType = "section";

export const Row = createStaticTableComponent("Row", {
  id: {
    type: [String, Number] as PropType<TableKey | undefined>,
    default: undefined,
  },
  textValue: {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  isDisabled: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined,
  },
  UNSTABLE_childItems: {
    type: [Array, Object] as PropType<Iterable<SpectrumTableRowData> | undefined>,
    default: undefined,
  },
});
(Row as any).__spectrumTableNodeType = "row";

export const Cell = createStaticTableComponent("Cell", {
  id: {
    type: [String, Number] as PropType<TableKey | undefined>,
    default: undefined,
  },
  textValue: {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  colSpan: {
    type: Number as PropType<number | undefined>,
    default: undefined,
  },
});
(Cell as any).__spectrumTableNodeType = "cell";

export const EditableCell = createStaticTableComponent("EditableCell", {
  id: {
    type: [String, Number] as PropType<TableKey | undefined>,
    default: undefined,
  },
  textValue: {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  colSpan: {
    type: Number as PropType<number | undefined>,
    default: undefined,
  },
});
(EditableCell as any).__spectrumTableNodeType = "editable-cell";

export const TableView = defineComponent({
  name: "SpectrumTableView",
  inheritAttrs: false,
  props: {
    id: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    columns: {
      type: Array as PropType<SpectrumTableColumnData[] | undefined>,
      default: undefined,
    },
    items: {
      type: Array as PropType<SpectrumTableRowData[] | undefined>,
      default: undefined,
    },
    selectionMode: {
      type: String as PropType<SpectrumTableSelectionMode | undefined>,
      default: undefined,
    },
    selectionStyle: {
      type: String as PropType<SpectrumTableSelectionStyle | undefined>,
      default: undefined,
    },
    selectedKeys: {
      type: [Object, Array, Set] as PropType<Iterable<TableKey> | undefined>,
      default: undefined,
    },
    defaultSelectedKeys: {
      type: [Object, Array, Set] as PropType<Iterable<TableKey> | undefined>,
      default: undefined,
    },
    disabledKeys: {
      type: [Object, Array, Set] as PropType<Iterable<TableKey> | undefined>,
      default: undefined,
    },
    disabledBehavior: {
      type: String as PropType<"all" | "selection" | undefined>,
      default: undefined,
    },
    disallowEmptySelection: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    allowDuplicateSelectionEvents: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    disallowSelectAll: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    disallowTypeAhead: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    escapeKeyBehavior: {
      type: String as PropType<"clearSelection" | "none" | undefined>,
      default: undefined,
    },
    shouldSelectOnPressUp: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    density: {
      type: String as PropType<"compact" | "regular" | "spacious" | undefined>,
      default: undefined,
    },
    overflowMode: {
      type: String as PropType<"wrap" | "truncate" | undefined>,
      default: undefined,
    },
    isQuiet: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    isDisabled: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    isKeyboardNavigationDisabled: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    autoFocus: {
      type: [Boolean, String] as PropType<true | "first" | "last" | undefined>,
      default: undefined,
    },
    sortDescriptor: {
      type: Object as PropType<SpectrumSortDescriptor | null | undefined>,
      default: undefined,
    },
    defaultSortDescriptor: {
      type: Object as PropType<SpectrumSortDescriptor | null | undefined>,
      default: undefined,
    },
    UNSTABLE_allowsExpandableRows: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    UNSTABLE_expandedKeys: {
      type: [String, Object, Array, Set] as PropType<"all" | Iterable<TableKey> | undefined>,
      default: undefined,
    },
    UNSTABLE_defaultExpandedKeys: {
      type: [String, Object, Array, Set] as PropType<"all" | Iterable<TableKey> | undefined>,
      default: undefined,
    },
    UNSTABLE_onExpandedChange: {
      type: Function as PropType<((keys: Set<TableKey>) => void) | undefined>,
      default: undefined,
    },
    onSortChange: {
      type: Function as PropType<((descriptor: SpectrumSortDescriptor) => void) | undefined>,
      default: undefined,
    },
    onSelectionChange: {
      type: Function as PropType<((keys: Set<TableKey>) => void) | undefined>,
      default: undefined,
    },
    onAction: {
      type: Function as PropType<((key: TableKey) => void) | undefined>,
      default: undefined,
    },
    renderEmptyState: {
      type: Function as PropType<(() => unknown) | undefined>,
      default: undefined,
    },
    ariaLabel: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    ariaLabelledby: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    ariaDescribedby: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    ariaLabelAttr: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    ariaLabelledbyAttr: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    ariaDescribedbyAttr: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    onFocus: {
      type: Function as PropType<((event: FocusEvent) => void) | undefined>,
      default: undefined,
    },
    onBlur: {
      type: Function as PropType<((event: FocusEvent) => void) | undefined>,
      default: undefined,
    },
    onFocusChange: {
      type: Function as PropType<((isFocused: boolean) => void) | undefined>,
      default: undefined,
    },
    onKeydown: {
      type: Function as PropType<((event: KeyboardEvent) => void) | undefined>,
      default: undefined,
    },
    onKeyup: {
      type: Function as PropType<((event: KeyboardEvent) => void) | undefined>,
      default: undefined,
    },
    slot: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    isHidden: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    UNSAFE_className: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    UNSAFE_style: {
      type: Object as PropType<Record<string, string | number> | undefined>,
      default: undefined,
    },
    "aria-label": {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    "aria-labelledby": {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    "aria-describedby": {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
  },
  setup(props, { attrs, slots, expose }) {
    const tableElementRef = ref<HTMLElement | null>(null);
    const tableRefObject = {
      get current() {
        return tableElementRef.value;
      },
      set current(value: HTMLElement | null) {
        tableElementRef.value = value;
      },
    };

    const resolvedSortDescriptor = ref<SpectrumSortDescriptor | null>(
      props.sortDescriptor ?? props.defaultSortDescriptor ?? null
    );
    const resolvedSelectedKeys = ref<Set<TableKey>>(
      new Set((props.selectedKeys ?? props.defaultSelectedKeys ?? []) as Iterable<TableKey>)
    );

    watchEffect(() => {
      if (props.sortDescriptor !== undefined) {
        resolvedSortDescriptor.value = props.sortDescriptor ?? null;
      }
    });

    watchEffect(() => {
      if (props.selectedKeys !== undefined) {
        resolvedSelectedKeys.value = new Set(props.selectedKeys as Iterable<TableKey>);
      }
    });

    const slotDefinition = shallowRef<ParsedSpectrumTableDefinition | null>(null);
    const slotDefinitionSignature = ref("");
    const disabledKeysVersion = computed(() => {
      const keySegment = props.disabledKeys
        ? Array.from(props.disabledKeys).map((key) => String(key)).sort().join("|")
        : "";
      return `${props.isDisabled ? "__all__|" : ""}${keySegment}`;
    });

    const normalizedDefinition = computed<NormalizedSpectrumTableDefinition>(() => {
      const normalized = normalizeTableDefinition({
        columns: props.columns,
        items: props.items,
        slotDefinition: slotDefinition.value,
      });
      return sortDefinition(normalized, resolvedSortDescriptor.value);
    });

    const allRows = computed(() => flattenNormalizedRows(normalizedDefinition.value.rows));
    const allowsExpandableRows = Boolean(props.UNSTABLE_allowsExpandableRows && tableNestedRows());
    const showSelectionCheckboxes = computed(
      () => props.selectionStyle !== "highlight" && (props.selectionMode ?? "none") !== "none"
    );
    const collection = computed(() =>
      createCollection(normalizedDefinition.value, {
        allowsExpandableRows,
        showSelectionCheckboxes: showSelectionCheckboxes.value,
      })
    );
    const resolvedDisabledKeys = computed(() => {
      const disabledKeys = new Set((props.disabledKeys ?? []) as Iterable<TableKey>);
      if (props.isDisabled) {
        for (const row of allRows.value) {
          disabledKeys.add(row.key);
        }
      }

      return disabledKeys;
    });

    const stateProps = {
      get collection() {
        return collection.value;
      },
      get selectionMode() {
        return props.selectionMode ?? "none";
      },
      get selectionBehavior() {
        return props.selectionStyle === "highlight" ? "replace" : "toggle";
      },
      get showSelectionCheckboxes() {
        return showSelectionCheckboxes.value;
      },
      get selectedKeys() {
        return resolvedSelectedKeys.value as any;
      },
      get defaultSelectedKeys() {
        return undefined;
      },
      get disabledKeys() {
        return resolvedDisabledKeys.value;
      },
      get disabledBehavior() {
        return props.isDisabled ? "all" : props.disabledBehavior;
      },
      get disallowEmptySelection() {
        return props.disallowEmptySelection;
      },
      get allowDuplicateSelectionEvents() {
        return props.allowDuplicateSelectionEvents;
      },
      get sortDescriptor() {
        return resolvedSortDescriptor.value ?? undefined;
      },
      get UNSTABLE_expandedKeys() {
        return props.UNSTABLE_expandedKeys;
      },
      get UNSTABLE_defaultExpandedKeys() {
        return props.UNSTABLE_defaultExpandedKeys;
      },
      get UNSTABLE_onExpandedChange() {
        return props.UNSTABLE_onExpandedChange;
      },
      onSortChange(descriptor: SortDescriptor) {
        if (props.sortDescriptor == null) {
          resolvedSortDescriptor.value = descriptor;
        }
        props.onSortChange?.(descriptor as SpectrumSortDescriptor);
      },
      onSelectionChange(keys: Set<TableKey> | "all") {
        if (keys === "all") {
          const disabledKeys = new Set((props.disabledKeys ?? []) as Iterable<TableKey>);
          if (props.isDisabled) {
            for (const row of allRows.value) {
              disabledKeys.add(row.key);
            }
          }
          const allKeys = new Set<TableKey>();
          for (const row of allRows.value) {
            if (row.isDisabled || disabledKeys.has(row.key)) {
              continue;
            }

            allKeys.add(row.key);
          }

          const currentSelectedKeys = new Set((props.selectedKeys ?? resolvedSelectedKeys.value) as Iterable<TableKey>);
          if (!props.allowDuplicateSelectionEvents && setsEqual(allKeys, currentSelectedKeys)) {
            return;
          }

          if (props.selectedKeys === undefined) {
            resolvedSelectedKeys.value = allKeys;
          }

          props.onSelectionChange?.(allKeys);
          return;
        }

        const nextKeys = new Set(keys as Set<TableKey>);
        if (props.selectedKeys === undefined) {
          resolvedSelectedKeys.value = nextKeys;
        }
        props.onSelectionChange?.(nextKeys);
      },
    };

    const state: TableState<NormalizedSpectrumTableRow> | TreeGridState<NormalizedSpectrumTableRow> =
      allowsExpandableRows
        ? UNSTABLE_useTreeGridState<NormalizedSpectrumTableRow>(stateProps as any)
        : useTableState<NormalizedSpectrumTableRow>(stateProps as any);

    watchEffect(() => {
      state.setKeyboardNavigationDisabled(Boolean(props.isKeyboardNavigationDisabled));
    });

    const tableAriaProps = {
      get id() {
        return props.id;
      },
      get "aria-label"() {
        return props["aria-label"] ?? props.ariaLabel;
      },
      get "aria-labelledby"() {
        return props["aria-labelledby"] ?? props.ariaLabelledby;
      },
      get "aria-describedby"() {
        return props["aria-describedby"] ?? props.ariaDescribedby;
      },
      get onFocus() {
        return props.onFocus;
      },
      get onBlur() {
        return props.onBlur;
      },
      get onFocusChange() {
        return props.onFocusChange;
      },
      get onKeydown() {
        return props.onKeydown;
      },
      get onKeyup() {
        return props.onKeyup;
      },
      get onRowAction() {
        return props.onAction;
      },
      get escapeKeyBehavior() {
        return props.escapeKeyBehavior;
      },
      get disallowSelectAll() {
        return props.disallowSelectAll;
      },
      get disallowTypeAhead() {
        return props.disallowTypeAhead;
      },
      get shouldSelectOnPressUp() {
        return props.shouldSelectOnPressUp;
      },
    };

    const { gridProps } = useTable(tableAriaProps as any, state as any, tableRefObject);

    expose({
      focus: () => tableElementRef.value?.focus(),
      blur: () => tableElementRef.value?.blur(),
      UNSAFE_getDOMNode: () => tableElementRef.value,
    });

    return () => {
      const slotChildren = (slots.default?.() ?? []).filter((node): node is VNode => isRenderableNode(node));
      const nextSlotDefinition = parseTableSlotDefinition(slotChildren) as ParsedSpectrumTableDefinition | null;
      const nextSlotSignature = getTableSlotDefinitionSignature(nextSlotDefinition);
      if (nextSlotSignature !== slotDefinitionSignature.value) {
        slotDefinitionSignature.value = nextSlotSignature;
        slotDefinition.value = nextSlotDefinition;
      }

      const attrsRecord = attrs as Record<string, unknown>;
      const attrsClass = attrsRecord.class;
      const attrsStyle = attrsRecord.style;
      const attrsWithoutClassStyle = { ...attrsRecord };
      delete attrsWithoutClassStyle.class;
      delete attrsWithoutClassStyle.style;

      const headerRows = state.collection.headerRows;
      const bodyRows = Array.from(state.collection.body.childNodes) as GridNode<NormalizedSpectrumTableRow>[];
      const rowOffset = headerRows.length;
      const isTreeGridState = "expandedKeys" in state;

      const tableProps = mergeProps(gridProps, attrsWithoutClassStyle, {
        role: (gridProps as Record<string, unknown>).role ?? "grid",
        "aria-colcount": state.collection.columnCount,
        "aria-rowcount": state.collection.size + headerRows.length,
        class: [
          attrsClass,
          "spectrum-Table",
          `spectrum-Table--${props.density ?? "regular"}`,
          "react-spectrum-Table",
          "react-spectrum-TableView",
          {
            "spectrum-Table--quiet": props.isQuiet,
            "spectrum-Table--wrap": (props.overflowMode ?? "truncate") === "wrap",
            "is-disabled": props.isDisabled,
            "is-hidden": props.isHidden,
          },
          props.UNSAFE_className,
        ],
        style: [attrsStyle, props.UNSAFE_style],
      }) as Record<string, unknown>;

      return h(
        "table",
        {
          ...tableProps,
          ref: tableElementRef,
        },
        [
          h(
            "thead",
            {
              role: "rowgroup",
              class: "spectrum-Table-head",
            },
            headerRows.map((headerRow, headerRowIndex) =>
              h(
                "tr",
                {
                  key: String(headerRow.key),
                  role: "row",
                  class: "spectrum-Table-headRow react-spectrum-Table-headRow",
                  "aria-rowindex": isTreeGridState ? undefined : headerRowIndex + 1,
                },
                Array.from(headerRow.childNodes).map((headerCellNode) =>
                  h(TableHeaderCell, {
                    key: String(headerCellNode.key),
                    node: headerCellNode as GridNode<NormalizedSpectrumTableRow>,
                    state,
                    isDisabled: props.isDisabled,
                  })
                )
              )
            )
          ),
          h(
            "tbody",
            {
              role: "rowgroup",
              class: "spectrum-Table-body",
            },
            bodyRows.length > 0
              ? bodyRows.map((rowNode, rowIndex) =>
                h(TableBodyRow, {
                  key: `${String(rowNode.key)}:${disabledKeysVersion.value}`,
                  node: rowNode,
                  state,
                  rowIndex,
                  rowOffset,
                  rowCount: bodyRows.length,
                  onAction: props.onAction,
                  selectedKeys: resolvedSelectedKeys.value,
                })
              )
              : [
                h(
                  "tr",
                  {
                    role: "row",
                    class: "spectrum-Table-row spectrum-Table-row--firstRow spectrum-Table-row--lastRow react-spectrum-Table-row",
                    "aria-rowindex": isTreeGridState ? undefined : rowOffset + 1,
                    "aria-level": isTreeGridState ? 1 : undefined,
                    "aria-posinset": isTreeGridState ? 1 : undefined,
                    "aria-setsize": isTreeGridState ? 1 : undefined,
                  },
                  [
                    h(
                      "td",
                      {
                        role: isTreeGridState ? "rowheader" : "gridcell",
                        colSpan: Math.max(1, state.collection.columnCount),
                        "aria-colspan": Math.max(1, state.collection.columnCount),
                        class: "spectrum-Table-cell react-spectrum-Table-cell react-spectrum-Table-empty",
                      },
                      props.renderEmptyState ? (props.renderEmptyState() as any) : null
                    ),
                  ]
                ),
              ]
          ),
        ]
      );
    };
  },
});
