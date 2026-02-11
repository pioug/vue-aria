import clsx from "clsx";
import { computed, defineComponent, h, type PropType } from "vue";
import {
  Cell as SpectrumCell,
  Column as SpectrumColumn,
  Row as SpectrumRow,
  TableBody as SpectrumTableBody,
  TableHeader as SpectrumTableHeader,
  TableView as SpectrumTableView,
  type SpectrumCellProps,
  type SpectrumColumnProps,
  type SpectrumTableBodyProps,
  type SpectrumTableViewProps,
  type SpectrumTableHeaderProps,
  type SpectrumRowProps,
} from "@vue-spectrum/table";
import { useProviderProps } from "@vue-spectrum/provider";

export interface S2TableViewProps extends SpectrumTableViewProps {}
export interface S2ColumnProps extends SpectrumColumnProps {}
export interface S2TableHeaderProps extends SpectrumTableHeaderProps {}
export interface S2TableBodyProps extends SpectrumTableBodyProps {}
export interface S2RowProps extends SpectrumRowProps {}
export interface S2CellProps extends SpectrumCellProps {}

export const TableView = defineComponent({
  name: "S2TableView",
  inheritAttrs: false,
  props: {
    UNSAFE_className: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    UNSAFE_style: {
      type: Object as PropType<Record<string, string | number> | undefined>,
      default: undefined,
    },
  },
  setup(props, { attrs, slots }) {
    const forwardedProps = computed(() => {
      const attrsRecord = attrs as Record<string, unknown>;
      const attrsClassName =
        typeof attrsRecord.UNSAFE_className === "string"
          ? (attrsRecord.UNSAFE_className as string)
          : undefined;
      const attrsStyle =
        (attrsRecord.UNSAFE_style as Record<string, string | number> | undefined) ??
        undefined;

      return useProviderProps({
        ...attrsRecord,
        UNSAFE_className: clsx("s2-TableView", attrsClassName, props.UNSAFE_className),
        UNSAFE_style: {
          ...(attrsStyle ?? {}),
          ...(props.UNSAFE_style ?? {}),
        },
      });
    });

    return () =>
      h(SpectrumTableView, forwardedProps.value as Record<string, unknown>, slots);
  },
});

export const Column = SpectrumColumn;
export const TableHeader = SpectrumTableHeader;
export const TableBody = SpectrumTableBody;
export const Row = SpectrumRow;
export const Cell = SpectrumCell;

export type {
  SpectrumSortDescriptor as S2SortDescriptor,
  SpectrumSortDirection as S2SortDirection,
  SpectrumTableCellData as S2TableCellData,
  SpectrumTableColumnData as S2TableColumnData,
  SpectrumTableRowData as S2TableRowData,
  SpectrumTableSelectionMode as S2TableSelectionMode,
  SpectrumTableSelectionStyle as S2TableSelectionStyle,
  TableKey as S2TableKey,
} from "@vue-spectrum/table";
