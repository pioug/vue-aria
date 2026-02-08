interface CheckboxGroupData {
  name?: string;
  form?: string;
  descriptionId?: string;
  errorMessageId?: string;
  validationBehavior: "aria" | "native";
}

export const checkboxGroupData = new WeakMap<object, CheckboxGroupData>();
