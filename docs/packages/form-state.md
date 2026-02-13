# @vue-aria/form-state

`@vue-aria/form-state` ports React Stately form validation state primitives used by form controls.

## API

### `useFormValidationState(props)`

Returns validation state with parity-oriented commit behavior:

- `realtimeValidation`
- `displayValidation`
- `updateValidation(result)`
- `commitValidation()`
- `resetValidation()`

### Key props

- `validationBehavior`: `"aria"` (realtime display) or `"native"` (commit-based display).
- `validate(value)`: custom validation callback returning string/string[]/undefined.
- `isInvalid` / `validationState`: controlled-invalid compatibility path.
- `name`: field name(s) used for server-error context lookups.

### Exports

- `FormValidationContext`
- `privateValidationStateProp`
- `VALID_VALIDITY_STATE`
- `DEFAULT_VALIDATION_RESULT`
- `mergeValidation(...)`

## Example

```ts
import { ref } from "vue";
import { useFormValidationState } from "@vue-aria/form-state";

const value = ref(5);

const validation = useFormValidationState<number>({
  value,
  validationBehavior: "native",
  validate: (nextValue) => (nextValue < 0 ? "Must be non-negative" : undefined),
});

validation.commitValidation();
```

## Upstream-aligned usage patterns

### Native validation commit flow

```ts
const validation = useFormValidationState<string>({
  value,
  validationBehavior: "native",
  validate: (nextValue) => (!nextValue ? "Required" : undefined),
});

// Queue display update after the next render.
validation.commitValidation();
```

### Aria realtime flow

```ts
const validation = useFormValidationState<string>({
  value,
  validationBehavior: "aria",
  validate: (nextValue) => (nextValue.length < 3 ? "Minimum length is 3" : undefined),
});
// displayValidation updates in realtime as value changes.
```

### Server-error context integration

```ts
import { FormValidationContext } from "@vue-aria/form-state";

// Provider value example:
// { email: ["Address already in use"] }
// Hook usage reads matching errors by `name`.
```

### Merge multiple validation results

```ts
import { mergeValidation } from "@vue-aria/form-state";

const merged = mergeValidation(clientValidation, nativeValidation);
```
