# @vue-spectrum/label

Vue port of `@react-spectrum/label` primitives.

<script setup lang="ts">
import { Field } from "@vue-spectrum/vue-spectrum";

const emailFieldProps = {
  labelProps: { for: "spectrum-label-preview-email" },
  descriptionProps: { id: "spectrum-label-preview-email-description" },
  errorMessageProps: { id: "spectrum-label-preview-email-error" },
};

const passwordFieldProps = {
  labelProps: { for: "spectrum-label-preview-password" },
  descriptionProps: { id: "spectrum-label-preview-password-description" },
};
</script>

## Preview

<div class="spectrum-preview spectrum-preview-stack">
  <Field
    label="Email"
    description="We only use this for account alerts."
    error-message="Enter a valid email address."
    validation-state="invalid"
    :is-invalid="true"
    :label-props="emailFieldProps.labelProps"
    :description-props="emailFieldProps.descriptionProps"
    :error-message-props="emailFieldProps.errorMessageProps"
  >
    <input
      id="spectrum-label-preview-email"
      aria-describedby="spectrum-label-preview-email-description spectrum-label-preview-email-error"
      class="spectrum-preview-input"
      type="email"
      value="not-an-email"
    />
  </Field>

  <Field
    label="Password"
    label-position="side"
    description="Minimum 8 characters."
    :label-props="passwordFieldProps.labelProps"
    :description-props="passwordFieldProps.descriptionProps"
  >
    <input
      id="spectrum-label-preview-password"
      aria-describedby="spectrum-label-preview-password-description"
      class="spectrum-preview-input"
      type="password"
      value="password123"
    />
  </Field>
</div>

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
