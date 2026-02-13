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
