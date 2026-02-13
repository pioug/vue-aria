import { useGridSelectionCheckbox } from "@vue-aria/grid";
import { useLocalizedStringFormatter } from "@vue-aria/i18n";
import type { Key } from "@vue-aria/collections";
import type { TableState } from "@vue-aria/table-state";
import { intlMessages } from "./intlMessages";
import { getRowLabelledBy } from "./utils";

export interface AriaTableSelectionCheckboxProps {
  key: Key;
}

export interface TableSelectionCheckboxAria {
  checkboxProps: Record<string, unknown>;
}

export interface TableSelectAllCheckboxAria {
  checkboxProps: Record<string, unknown>;
}

export function useTableSelectionCheckbox<T>(
  props: AriaTableSelectionCheckboxProps,
  state: TableState<T>
): TableSelectionCheckboxAria {
  const { key } = props;
  const { checkboxProps } = useGridSelectionCheckbox(props, state as any);

  return {
    checkboxProps: {
      ...checkboxProps,
      "aria-labelledby": `${checkboxProps.id} ${getRowLabelledBy(state, key)}`,
    },
  };
}

export function useTableSelectAllCheckbox<T>(
  state: TableState<T>
): TableSelectAllCheckboxAria {
  const { isEmpty, isSelectAll, selectionMode } = state.selectionManager;
  const stringFormatter = useLocalizedStringFormatter(
    intlMessages as any,
    "@react-aria/table"
  );

  return {
    checkboxProps: {
      "aria-label": stringFormatter.format(
        selectionMode === "single" ? "select" : "selectAll"
      ),
      isSelected: isSelectAll,
      isDisabled:
        selectionMode !== "multiple"
        || state.collection.size === 0
        || (state.collection.rows.length === 1
          && state.collection.rows[0].type === "loader"),
      isIndeterminate: !isEmpty && !isSelectAll,
      onChange: () => state.selectionManager.toggleSelectAll(),
    },
  };
}
