# @vue-aria/searchfield

Search-input accessibility primitives.

## `useSearchField`

Builds on `useTextField` with search-specific keyboard and clear-button behavior.

```ts
import { useSearchField } from "@vue-aria/searchfield";

const { inputProps, clearButtonProps } = useSearchField({
  "aria-label": "Search",
  onSubmit: (value) => console.log("submit", value),
  onClear: () => console.log("cleared"),
});
```

### Behavior

- Defaults input `type` to `search`.
- Supports Enter submit handling via `onSubmit`.
- Supports Escape-to-clear and clear-button behavior.
- Returns clear button props with accessibility defaults.
