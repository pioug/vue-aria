interface RadioGroupData {
  name: string;
  form?: string;
  descriptionId?: string;
  errorMessageId?: string;
  validationBehavior: "aria" | "native";
}

export const radioGroupData = new WeakMap<object, RadioGroupData>();
