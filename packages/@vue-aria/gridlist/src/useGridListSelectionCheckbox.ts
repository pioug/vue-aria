import { useGridSelectionCheckbox, type AriaGridSelectionCheckboxProps, type GridSelectionCheckboxAria } from "@vue-aria/grid";
import type { ListState } from "@vue-aria/list-state";
import { getRowId } from "./utils";

/**
 * Provides selection-checkbox wiring for grid list rows.
 */
export function useGridListSelectionCheckbox<T>(
  props: AriaGridSelectionCheckboxProps,
  state: ListState<T>
): GridSelectionCheckboxAria {
  const { key } = props;
  const { checkboxProps } = useGridSelectionCheckbox(props, state as any);

  return {
    checkboxProps: {
      ...checkboxProps,
      "aria-labelledby": `${checkboxProps.id} ${getRowId(state as object, key)}`,
    },
  };
}
