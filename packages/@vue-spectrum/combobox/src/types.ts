import type { Key } from "@vue-aria/types";
import type {
  CompletionMode,
  FilterFn,
  MenuTrigger,
  MenuTriggerAction,
} from "@vue-aria/combobox-state";

export type ComboBoxKey = Key;

export interface SpectrumComboBoxItemData {
  key: ComboBoxKey;
  label: string;
  textValue?: string | undefined;
  isDisabled?: boolean | undefined;
  "aria-label"?: string | undefined;
}

export type SpectrumComboBoxCompletionMode = CompletionMode;
export type SpectrumComboBoxMenuTrigger = MenuTrigger;
export type SpectrumComboBoxMenuTriggerAction = MenuTriggerAction;
export type SpectrumComboBoxFilterFn = FilterFn;
