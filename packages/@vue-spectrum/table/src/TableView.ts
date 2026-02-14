import { useTable, useTableCell, useTableColumnHeader, useTableRow } from "@vue-aria/table";
import { TableCollection, useTableState, type GridNode, type SortDescriptor, type TableState } from "@vue-aria/table-state";
import { mergeProps } from "@vue-aria/utils";
import { defineComponent, h, ref, computed, watchEffect, type PropType, type VNode, type VNodeChild } from "vue";
import type {
  NormalizedSpectrumTableCell,
  NormalizedSpectrumTableColumn,
  NormalizedSpectrumTableDefinition,
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

export interface SpectrumTableViewProps {
  id?: string | undefined;
  columns?: SpectrumTableColumnData[] | undefined;
  items?: SpectrumTableRowData[] | undefined;
  selectionMode?: SpectrumTableSelectionMode | undefined;
  selectionStyle?: SpectrumTableSelectionStyle | undefined;
  selectedKeys?: Iterable<TableKey> | undefined;
  defaultSelectedKeys?: Iterable<TableKey> | undefined;
  disabledKeys?: Iterable<TableKey> | undefined;
  disallowEmptySelection?: boolean | undefined;
  isDisabled?: boolean | undefined;
  autoFocus?: true | "first" | "last" | undefined;
  sortDescriptor?: SpectrumSortDescriptor | null | undefined;
  defaultSortDescriptor?: SpectrumSortDescriptor | null | undefined;
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
      colSpan: column.colSpan,
    },
  }));
}

function createRowCellNodes(
  row: NormalizedSpectrumTableRow,
  rowIndex: number,
  columns: NormalizedSpectrumTableColumn[]
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
      index: cellIndex,
      hasChildNodes: false,
      childNodes: [],
      parentKey: row.key,
      prevKey: cellIndex > 0 ? cells[cellIndex - 1]?.key ?? null : null,
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

function createCollection(definition: NormalizedSpectrumTableDefinition): TableCollection<NormalizedSpectrumTableRow> {
  const columnNodes = createColumnNodes(definition);
  for (let index = 0; index < columnNodes.length; index += 1) {
    if (index < columnNodes.length - 1) {
      columnNodes[index]!.nextKey = columnNodes[index + 1]!.key;
    }
  }

  const bodyRows = definition.rows.map((row, rowIndex) => {
    const cells = createRowCellNodes(row, rowIndex, definition.columns);
    for (let cellIndex = 0; cellIndex < cells.length; cellIndex += 1) {
      if (cellIndex < cells.length - 1) {
        cells[cellIndex]!.nextKey = cells[cellIndex + 1]!.key;
      }
    }

    return {
      type: "item",
      key: row.key,
      value: row,
      rendered: null,
      textValue: row.textValue,
      level: 1,
      index: rowIndex,
      hasChildNodes: true,
      childNodes: cells,
      parentKey: "body",
      prevKey: rowIndex > 0 ? definition.rows[rowIndex - 1]?.key ?? null : null,
      nextKey: null,
      firstChildKey: cells[0]?.key ?? null,
      lastChildKey: cells[cells.length - 1]?.key ?? null,
      props: {
        isDisabled: row.isDisabled,
      },
    } as GridNode<NormalizedSpectrumTableRow>;
  });

  for (let rowIndex = 0; rowIndex < bodyRows.length; rowIndex += 1) {
    if (rowIndex < bodyRows.length - 1) {
      bodyRows[rowIndex]!.nextKey = bodyRows[rowIndex + 1]!.key;
    }
  }

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
  return new TableCollection<NormalizedSpectrumTableRow>(topLevelNodes, null);
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
      } as any,
      props.state,
      domRef
    );

    return () =>
      h(
        "th",
        {
          ...columnHeaderProps,
          ref: refObject,
          class: "react-spectrum-Table-headCell",
          "aria-colindex":
            props.node.colIndex != null ? props.node.colIndex + 1 : props.node.index + 1,
        },
        props.node.rendered as any
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

    return () =>
      h(
        "td",
        {
          ...gridCellProps,
          ref: refObject,
          class: "react-spectrum-Table-cell",
          colSpan: resolvedColSpan.value,
          "aria-colspan": resolvedColSpan.value,
        },
        props.node.rendered as any
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

    return () => {
      const childNodes = Array.from(props.node.childNodes) as GridNode<NormalizedSpectrumTableRow>[];

      return h(
        "tr",
        {
          ...rowProps,
          ref: refObject,
          class: "react-spectrum-Table-row",
          "aria-rowindex": props.rowOffset + props.rowIndex + 1,
          "aria-selected":
            props.state.selectionManager.selectionMode !== "none"
              ? (props.selectedKeys.has(props.node.key) ? "true" : "false")
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
    disallowEmptySelection: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    isDisabled: {
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

    const slotDefinition = computed(() => parseTableSlotDefinition(slots.default?.() as VNode[] | undefined));
    const disabledKeysVersion = computed(() =>
      props.disabledKeys ? Array.from(props.disabledKeys).map((key) => String(key)).sort().join("|") : ""
    );

    const normalizedDefinition = computed<NormalizedSpectrumTableDefinition>(() => {
      const normalized = normalizeTableDefinition({
        columns: props.columns,
        items: props.items,
        slotDefinition: slotDefinition.value,
      });
      return sortDefinition(normalized, resolvedSortDescriptor.value);
    });

    const collection = computed(() => createCollection(normalizedDefinition.value));

    const state = useTableState<NormalizedSpectrumTableRow>({
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
        return props.selectionStyle !== "highlight" && (props.selectionMode ?? "none") !== "none";
      },
      get selectedKeys() {
        return resolvedSelectedKeys.value as any;
      },
      get defaultSelectedKeys() {
        return undefined;
      },
      get disabledKeys() {
        return props.disabledKeys;
      },
      get disallowEmptySelection() {
        return props.disallowEmptySelection;
      },
      get sortDescriptor() {
        return resolvedSortDescriptor.value ?? undefined;
      },
      onSortChange(descriptor) {
        if (props.sortDescriptor == null) {
          resolvedSortDescriptor.value = descriptor;
        }
        props.onSortChange?.(descriptor as SpectrumSortDescriptor);
      },
      onSelectionChange(keys) {
        if (keys === "all") {
          const allKeys = new Set<TableKey>();
          for (const row of normalizedDefinition.value.rows) {
            allKeys.add(row.key);
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
    };

    const { gridProps } = useTable(tableAriaProps as any, state as any, tableRefObject);

    expose({
      focus: () => tableElementRef.value?.focus(),
      blur: () => tableElementRef.value?.blur(),
      UNSAFE_getDOMNode: () => tableElementRef.value,
    });

    return () => {
      const attrsRecord = attrs as Record<string, unknown>;
      const attrsClass = attrsRecord.class;
      const attrsStyle = attrsRecord.style;
      const attrsWithoutClassStyle = { ...attrsRecord };
      delete attrsWithoutClassStyle.class;
      delete attrsWithoutClassStyle.style;

      const headerRows = state.collection.headerRows;
      const bodyRows = Array.from(state.collection.body.childNodes) as GridNode<NormalizedSpectrumTableRow>[];
      const rowOffset = headerRows.length;

      const tableProps = mergeProps(gridProps, attrsWithoutClassStyle, {
        role: "grid",
        "aria-colcount": state.collection.columnCount,
        "aria-rowcount": state.collection.size + headerRows.length,
        class: [
          attrsClass,
          "react-spectrum-TableView",
          {
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
            },
            headerRows.map((headerRow, headerRowIndex) =>
              h(
                "tr",
                {
                  key: String(headerRow.key),
                  role: "row",
                  class: "react-spectrum-Table-headRow",
                  "aria-rowindex": headerRowIndex + 1,
                },
                Array.from(headerRow.childNodes).map((headerCellNode) =>
                  h(TableHeaderCell, {
                    key: String(headerCellNode.key),
                    node: headerCellNode as GridNode<NormalizedSpectrumTableRow>,
                    state,
                  })
                )
              )
            )
          ),
          h(
            "tbody",
            {
              role: "rowgroup",
            },
            bodyRows.length > 0
              ? bodyRows.map((rowNode, rowIndex) =>
                h(TableBodyRow, {
                  key: `${String(rowNode.key)}:${disabledKeysVersion.value}`,
                  node: rowNode,
                  state,
                  rowIndex,
                  rowOffset,
                  onAction: props.onAction,
                  selectedKeys: resolvedSelectedKeys.value,
                })
              )
              : [
                h(
                  "tr",
                  {
                    role: "row",
                    class: "react-spectrum-Table-row",
                    "aria-rowindex": rowOffset + 1,
                  },
                  [
                    h(
                      "td",
                      {
                        role: "gridcell",
                        colSpan: Math.max(1, normalizedDefinition.value.columns.length),
                        class: "react-spectrum-Table-cell react-spectrum-Table-empty",
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
