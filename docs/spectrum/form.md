# @vue-spectrum/form

Vue port of the `@react-spectrum/form` foundation package.

<script setup lang="ts">
import { Field, Form } from "@vue-spectrum/vue-spectrum";

const previewFieldProps = {
  labelProps: { for: "spectrum-form-preview-email" },
  descriptionProps: { id: "spectrum-form-preview-email-description" },
};
</script>

## Preview

<div class="spectrum-preview">
  <Form aria-label="Profile form preview" label-position="side" validation-behavior="native">
    <Field
      label="Email"
      label-position="side"
      description="Used for account notifications."
      :label-props="previewFieldProps.labelProps"
      :description-props="previewFieldProps.descriptionProps"
    >
      <input
        id="spectrum-form-preview-email"
        aria-describedby="spectrum-form-preview-email-description"
        class="spectrum-preview-input"
        type="email"
        placeholder="you@example.com"
        required
      />
    </Field>
  </Form>
</div>

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
