# @vue-aria/label

Labeling and field-description primitives.

## `useLabel`

Creates accessible relationships between a visible label and a field.

```ts
import { useLabel } from "@vue-aria/label";

const { labelProps, fieldProps } = useLabel({
  label: "Email",
});
```

### Behavior

- Generates stable ids for label and field.
- Connects label via `aria-labelledby`.
- Supports non-`label` label elements with `labelElementType`.
- Warns when no visible label or aria labels are provided.

## `useField`

Extends `useLabel` with description/error wiring.

```ts
import { useField } from "@vue-aria/label";

const { labelProps, fieldProps, descriptionProps, errorMessageProps } = useField({
  label: "Email",
  description: "We will not share your email.",
  errorMessage: "Email is required",
  isInvalid: true,
});
```

### Behavior

- Composes `aria-describedby` from description, error message, and user-provided ids.
- Includes error message id when invalid.
