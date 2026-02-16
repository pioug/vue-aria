import type { CheckboxGroupState } from "@vue-stately/checkbox";

export interface CheckboxGroupData {
  name?: string;
  form?: string;
  descriptionId?: string;
  errorMessageId?: string;
  validationBehavior?: "aria" | "native";
}

export const checkboxGroupData = new WeakMap<CheckboxGroupState, CheckboxGroupData>();
