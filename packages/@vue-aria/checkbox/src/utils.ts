import type { CheckboxGroupState } from "@vue-aria/checkbox-state";

export interface CheckboxGroupData {
  name?: string;
  form?: string;
  descriptionId?: string;
  errorMessageId?: string;
  validationBehavior?: "aria" | "native";
}

export const checkboxGroupData = new WeakMap<CheckboxGroupState, CheckboxGroupData>();
