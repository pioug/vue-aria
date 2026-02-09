# @vue-spectrum/form

Vue port of the `@react-spectrum/form` foundation package.

## Exports

- `Form`
- `useFormProps`
- `useFormValidationErrors`

## Example

```ts
import { Form } from "@vue-spectrum/form";
import { h } from "vue";

const node = h(
  Form,
  {
    "aria-label": "Profile",
    labelPosition: "side",
    validationBehavior: "native",
  },
  {
    default: () => [
      h("input", { name: "email", type: "email", required: true }),
    ],
  }
);
```

## Notes

- Form context values (`labelPosition`, `labelAlign`, `necessityIndicator`, `validationBehavior`) are merged by `useFormProps`.
- Form-level `validationErrors` are exposed to descendants through `useFormValidationErrors`.
