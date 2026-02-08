# @vue-aria/textfield

Text-input accessibility primitives.

## `useTextField`

Provides label, description, error wiring, and input props for `<input>` or `<textarea>`.

```ts
import { useTextField } from "@vue-aria/textfield";

const { labelProps, inputProps, descriptionProps, errorMessageProps, isInvalid } =
  useTextField({
    label: "Email",
    description: "We will not share your email.",
    errorMessage: "Email is required",
    validationState: "invalid",
  });
```

### Behavior

- Composes labeling and help-text semantics via `useField`.
- Supports `validationBehavior` (`aria` or `native`) for required semantics.
- Supports controlled/uncontrolled values with `onChange`.
- Omits input-only props (`type`, `pattern`) when `inputElementType` is `textarea`.
