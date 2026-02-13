import { useLocalizedStringFormatter } from "@vue-aria/i18n";
import { useId } from "@vue-aria/utils";
import type { Key } from "@vue-aria/collections";
import type { GridCollectionType, GridState } from "@vue-aria/grid-state";
import { intlMessages } from "./intlMessages";

export interface AriaGridSelectionCheckboxProps {
  key: Key;
}

export interface GridSelectionCheckboxAria {
  checkboxProps: Record<string, unknown>;
}

export function useGridSelectionCheckbox<T, C extends GridCollectionType<T>>(
  props: AriaGridSelectionCheckboxProps,
  state: GridState<T, C>
): GridSelectionCheckboxAria {
  const { key } = props;
  const manager = state.selectionManager;
  const checkboxId = useId();
  const isDisabled = !state.selectionManager.canSelectItem(key);
  const isSelected = state.selectionManager.isSelected(key);
  const onChange = () => manager.toggleSelection(key);
  const stringFormatter = useLocalizedStringFormatter(intlMessages as any);

  return {
    checkboxProps: {
      id: checkboxId,
      "aria-label": stringFormatter.format("select"),
      isSelected,
      isDisabled,
      onChange,
    },
  };
}
