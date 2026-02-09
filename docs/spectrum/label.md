# @vue-spectrum/label

Vue port of `@react-spectrum/label` primitives.

## Exports

- `Label`
- `HelpText`
- `Field`

## Example

```ts
import { h } from "vue";
import { useField } from "@vue-aria/label";
import { Field } from "@vue-spectrum/label";

const { labelProps, fieldProps, descriptionProps, errorMessageProps } = useField({
  label: "Email",
  description: "We never share your email.",
});

const node = h(
  Field,
  {
    label: "Email",
    labelProps: labelProps.value,
    descriptionProps: descriptionProps.value,
    errorMessageProps: errorMessageProps.value,
    description: "We never share your email.",
  },
  {
    default: () => [h("input", { ...fieldProps.value, type: "email", name: "email" })],
  }
);
```

## Notes

- `Field` composes `Label` and `HelpText` while preserving `useField` ARIA wiring.
- Form-level label settings are inherited through `useFormProps` when rendered inside `@vue-spectrum/form`.
