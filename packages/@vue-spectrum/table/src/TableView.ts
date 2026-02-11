import {
  computed,
  defineComponent,
  h,
  nextTick,
  onMounted,
  ref,
  watch,
  type PropType,
} from "vue";
import {
  useTable,
  useTableCell,
  useTableColumnHeader,
  useTableRow,
} from "@vue-aria/table";
import {
  useTableState,
  type SortDescriptor,
  type TableRowNode,
  type UseTableStateResult,
} from "@vue-aria/table-state";
import { filterDOMProps, mergeProps } from "@vue-aria/utils";
import { classNames, useStyleProps, type ClassValue } from "@vue-spectrum/utils";
import type {
  NormalizedSpectrumTableCell,
  NormalizedSpectrumTableColumn,
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

export const TableHeader = createStaticTableComponent("TableHeader", {
  columns: {
    type: Array as PropType<SpectrumTableColumnData[] | undefined>,
    default: undefined,
  },
});

export const TableBody = createStaticTableComponent("TableBody", {
  items: {
    type: Array as PropType<SpectrumTableRowData[] | undefined>,
    default: undefined,
  },
});

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

const cellPropOptions = {
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
};

export const Cell = createStaticTableComponent("Cell", cellPropOptions);
export const EditableCell = createStaticTableComponent(
  "EditableCell",
  cellPropOptions
);

interface HeaderCellProps {
  state: UseTableStateResult<SpectrumTableRowData>;
  column: NormalizedSpectrumTableColumn;
  columnIndex: number;
}

const TableHeaderCellView = defineComponent({
  name: "TableHeaderCellView",
  props: {
    state: {
      type: Object as PropType<UseTableStateResult<SpectrumTableRowData>>,
      required: true,
    },
    column: {
      type: Object as PropType<NormalizedSpectrumTableColumn>,
      required: true,
    },
    columnIndex: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const headerRef = ref<HTMLElement | null>(null);

    const { columnHeaderProps } = useTableColumnHeader(
      {
        column: props.column,
        columnIndex: props.columnIndex,
        allowsSorting: props.column.allowsSorting,
      },
      props.state,
      headerRef
    );

    return () =>
      h(
        "div",
        mergeProps(columnHeaderProps.value, {
          ref: (value: unknown) => {
            headerRef.value = value as HTMLElement | null;
          },
          class: classNames(
            "spectrum-Table-headCell",
            "react-spectrum-TableView-headCell"
          ),
        }),
        props.column.content ?? props.column.title ?? props.column.textValue ?? ""
      );
  },
});

interface RowCellProps {
  state: UseTableStateResult<SpectrumTableRowData>;
  row: TableRowNode<SpectrumTableRowData>;
  column: NormalizedSpectrumTableColumn;
  columnIndex: number;
  cell: NormalizedSpectrumTableCell | undefined;
}

const TableCellView = defineComponent({
  name: "TableCellView",
  props: {
    state: {
      type: Object as PropType<UseTableStateResult<SpectrumTableRowData>>,
      required: true,
    },
    row: {
      type: Object as PropType<TableRowNode<SpectrumTableRowData>>,
      required: true,
    },
    column: {
      type: Object as PropType<NormalizedSpectrumTableColumn>,
      required: true,
    },
    columnIndex: {
      type: Number,
      required: true,
    },
    cell: {
      type: Object as PropType<NormalizedSpectrumTableCell | undefined>,
      default: undefined,
    },
  },
  setup(props) {
    const cellRef = ref<HTMLElement | null>(null);

    const { gridCellProps } = useTableCell(
      {
        row: props.row,
        column: props.column,
        columnIndex: props.columnIndex,
        cell: props.cell,
        colSpan: props.cell?.colSpan,
      },
      props.state,
      cellRef
    );

    return () =>
      h(
        "div",
        mergeProps(gridCellProps.value, {
          ref: (value: unknown) => {
            cellRef.value = value as HTMLElement | null;
          },
          class: classNames(
            "spectrum-Table-cell",
            "react-spectrum-TableView-cell"
          ),
        }),
        (props.cell?.value ?? props.cell?.textValue ?? "") as any
      );
  },
});

interface TableRowViewProps {
  state: UseTableStateResult<SpectrumTableRowData>;
  row: TableRowNode<SpectrumTableRowData>;
  rowIndex: number;
  columns: NormalizedSpectrumTableColumn[];
  onAction?: ((key: TableKey) => void) | undefined;
}

const TableRowView = defineComponent({
  name: "TableRowView",
  props: {
    state: {
      type: Object as PropType<UseTableStateResult<SpectrumTableRowData>>,
      required: true,
    },
    row: {
      type: Object as PropType<TableRowNode<SpectrumTableRowData>>,
      required: true,
    },
    rowIndex: {
      type: Number,
      required: true,
    },
    columns: {
      type: Array as PropType<NormalizedSpectrumTableColumn[]>,
      required: true,
    },
    onAction: {
      type: Function as PropType<((key: TableKey) => void) | undefined>,
      default: undefined,
    },
  },
  setup(props) {
    const rowRef = ref<HTMLElement | null>(null);

    const { rowProps, isSelected, isDisabled } = useTableRow(
      {
        row: props.row,
        rowIndex: props.rowIndex,
        onAction: props.onAction,
      },
      props.state,
      rowRef
    );

    return () =>
      h(
        "div",
        mergeProps(rowProps.value, {
          ref: (value: unknown) => {
            rowRef.value = value as HTMLElement | null;
          },
          class: classNames("spectrum-Table-row", "react-spectrum-TableView-row", {
            "is-selected": isSelected.value,
            "is-disabled": isDisabled.value,
          }),
        }),
        props.columns.map((column, columnIndex) => {
          const cell = props.row.cells[columnIndex] as NormalizedSpectrumTableCell | undefined;

          return h(TableCellView, {
            key: `${String(props.row.key)}-${String(column.key)}`,
            state: props.state,
            row: props.row,
            column,
            columnIndex,
            cell,
          });
        })
      );
  },
});

export const TableView = defineComponent({
  name: "TableView",
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
      type: [Array, Set] as unknown as PropType<Iterable<TableKey> | undefined>,
      default: undefined,
    },
    defaultSelectedKeys: {
      type: [Array, Set] as unknown as PropType<Iterable<TableKey> | undefined>,
      default: undefined,
    },
    disabledKeys: {
      type: [Array, Set] as unknown as PropType<Iterable<TableKey> | undefined>,
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
      type: Function as PropType<((descriptor: SortDescriptor) => void) | undefined>,
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
  },
  setup(props, { attrs, expose, slots }) {
    const rootRef = ref<HTMLElement | null>(null);
    const uncontrolledSortDescriptor = ref<SpectrumSortDescriptor | null>(
      props.defaultSortDescriptor ?? null
    );

    const parsedSlotDefinition = computed(() =>
      parseTableSlotDefinition(slots.default?.() ?? [])
    );

    const tableDefinition = computed(() =>
      normalizeTableDefinition({
        columns: props.columns,
        items: props.items,
        slotDefinition: parsedSlotDefinition.value,
      })
    );

    const selectionBehavior = computed(() =>
      props.selectionStyle === "highlight" ? "replace" : "toggle"
    );

    const sortDescriptor = computed<SpectrumSortDescriptor | null>(() =>
      props.sortDescriptor !== undefined
        ? props.sortDescriptor ?? null
        : uncontrolledSortDescriptor.value
    );

    const sortedRows = computed<NormalizedSpectrumTableRow[]>(() => {
      const rows = tableDefinition.value.rows;
      const descriptor = sortDescriptor.value;
      if (!descriptor) {
        return rows;
      }

      const columnIndex = tableDefinition.value.columns.findIndex(
        (column) => column.key === descriptor.column
      );
      if (columnIndex < 0) {
        return rows;
      }

      const withIndex = rows.map((row, index) => ({ row, index }));
      withIndex.sort((left, right) => {
        const result = compareSortValues(
          getSortCellValue(left.row, columnIndex),
          getSortCellValue(right.row, columnIndex)
        );

        if (result !== 0) {
          return result;
        }

        return left.index - right.index;
      });

      if (descriptor.direction === "descending") {
        withIndex.reverse();
      }

      return withIndex.map((entry) => entry.row);
    });

    const effectiveDisabledKeys = computed(() => {
      const keys = new Set<TableKey>(props.disabledKeys ?? []);
      if (props.isDisabled) {
        for (const row of sortedRows.value) {
          keys.add(row.key);
        }
      }

      return keys;
    });

    const state = useTableState<SpectrumTableRowData>({
      columns: computed(() => tableDefinition.value.columns),
      collection: sortedRows,
      selectionMode: computed(() => props.selectionMode ?? "none"),
      selectionBehavior,
      selectedKeys: props.selectedKeys,
      defaultSelectedKeys: props.defaultSelectedKeys,
      disabledKeys: effectiveDisabledKeys,
      disallowEmptySelection: props.disallowEmptySelection,
      sortDescriptor,
      onSortChange: (descriptor) => {
        if (props.sortDescriptor === undefined) {
          uncontrolledSortDescriptor.value = descriptor;
        }

        props.onSortChange?.(descriptor);
      },
      onSelectionChange: (keys) => {
        props.onSelectionChange?.(new Set(keys));
      },
    });

    const { gridProps } = useTable(
      {
        id: props.id,
        "aria-label": props["aria-label"] ?? props.ariaLabel,
        "aria-labelledby": props["aria-labelledby"] ?? props.ariaLabelledby,
        "aria-describedby": props["aria-describedby"] ?? props.ariaDescribedby,
        selectionBehavior,
        onAction: (key) => {
          props.onAction?.(key);
        },
        onFocus: props.onFocus,
        onBlur: props.onBlur,
        onFocusChange: props.onFocusChange,
        onKeydown: props.onKeydown,
        onKeyup: props.onKeyup,
      },
      state,
      rootRef
    );

    const applyAutoFocus = () => {
      if (!props.autoFocus) {
        return;
      }

      const rows = state.collection.value.rows;
      if (rows.length === 0) {
        return;
      }

      const nextKey =
        props.autoFocus === "last"
          ? rows[rows.length - 1]?.key ?? null
          : rows[0]?.key ?? null;

      if (nextKey === null) {
        return;
      }

      state.selectionManager.setFocused(true);
      state.selectionManager.setFocusedKey(nextKey);
    };

    onMounted(() => {
      void nextTick(() => {
        applyAutoFocus();
      });
    });

    watch(
      () => props.autoFocus,
      (value) => {
        if (!value) {
          return;
        }

        void nextTick(() => {
          applyAutoFocus();
        });
      }
    );

    watch(
      sortedRows,
      () => {
        if (!props.autoFocus) {
          return;
        }

        void nextTick(() => {
          applyAutoFocus();
        });
      },
      { deep: true }
    );

    expose({
      UNSAFE_getDOMNode: () => rootRef.value,
      focus: () => {
        rootRef.value?.focus();
      },
    });

    return () => {
      const domProps = filterDOMProps(attrs as Record<string, unknown>, {
        labelable: true,
      });
      const { styleProps } = useStyleProps({
        isHidden: props.isHidden,
        UNSAFE_className: props.UNSAFE_className,
        UNSAFE_style: props.UNSAFE_style,
      });

      const columns = state.collection.value.columns as NormalizedSpectrumTableColumn[];
      const rows = state.collection.value.rows as TableRowNode<SpectrumTableRowData>[];

      const bodyRows = rows.map((row, rowIndex) =>
        h(TableRowView, {
          key: String(row.key),
          state,
          row,
          rowIndex,
          columns,
          onAction: props.onAction,
        })
      );

      if (rows.length === 0) {
        const emptyState = slots.emptyState?.() ?? props.renderEmptyState?.();
        if (emptyState) {
          bodyRows.push(
            h(
              "div",
              {
                role: "row",
                class: classNames("spectrum-Table-row", "react-spectrum-TableView-row"),
              },
              [
                h(
                  "div",
                  {
                    role: "gridcell",
                    "aria-colindex": 1,
                    "aria-colspan": Math.max(columns.length, 1),
                    class: classNames(
                      "spectrum-Table-cell",
                      "react-spectrum-TableView-cell",
                      "react-spectrum-TableView-empty"
                    ),
                  },
                  emptyState as any
                ),
              ]
            )
          );
        }
      }

      return h(
        "div",
        mergeProps(domProps, gridProps.value, styleProps, {
          ref: (value: unknown) => {
            rootRef.value = value as HTMLElement | null;
          },
          class: classNames(
            "spectrum-TableView",
            "react-spectrum-TableView",
            {
              "spectrum-Table--quiet": props.selectionStyle === "highlight",
            },
            styleProps.class as ClassValue | undefined
          ),
        }),
        [
          h(
            "div",
            {
              role: "rowgroup",
              class: classNames("spectrum-Table-head", "react-spectrum-TableView-head"),
            },
            [
              h(
                "div",
                {
                  role: "row",
                  "aria-rowindex": 1,
                  class: classNames("spectrum-Table-headRow", "react-spectrum-TableView-headRow"),
                },
                columns.map((column, columnIndex) =>
                  h(TableHeaderCellView, {
                    key: String(column.key),
                    state,
                    column,
                    columnIndex,
                  })
                )
              ),
            ]
          ),
          h(
            "div",
            {
              role: "rowgroup",
              class: classNames("spectrum-Table-body", "react-spectrum-TableView-body"),
            },
            bodyRows
          ),
        ]
      );
    };
  },
});
