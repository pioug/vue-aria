# @vue-aria/utils

Low-level shared helpers.

## `mergeProps`

Merges multiple prop objects with React Aria-style event chaining semantics.

```ts
import { mergeProps } from "@vue-aria/utils";

const props = mergeProps(
  { onClick: () => console.log("first"), class: "base" },
  { onClick: () => console.log("second"), class: "active" }
);
```

## Merge Rules

- Event handlers (`onX`) are chained in order.
- `class` values are merged into an array.
- `style` objects are shallow-merged.
- `undefined` values are ignored.

## `useDescription`

Provides hidden assistive text and returns `aria-describedby`.

```ts
import { useDescription } from "@vue-aria/utils";

const { descriptionProps } = useDescription("Long press to open menu");
```

## `useErrorMessage`

Provides shared error-message id and invalid-state derivation used by field hooks.

```ts
import { useErrorMessage } from "@vue-aria/utils";

const { errorMessageProps, errorMessageId, isInvalid } = useErrorMessage({
  errorMessage: "Email is required",
  validationState: "invalid",
});
```
