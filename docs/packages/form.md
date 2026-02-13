# @vue-aria/form

`@vue-aria/form` ports form-validation helpers from upstream `@react-aria/form`.

## API

- `useFormValidation`

## Features

- Native custom-validity synchronization from realtime validation state.
- Invalid/change/reset event handling for validation commit/reset lifecycle.
- Focus routing to the invalid control (or custom `focus` callback).
- Interaction-modality update to keyboard on first invalid focus.
- Programmatic reset ignore path aligned with upstream scheduling behavior.

## Example

```ts
import { ref } from "vue";
import { useFormValidation } from "@vue-aria/form";

const inputRef = ref<HTMLInputElement | null>(null);
useFormValidation({ validationBehavior: "native" }, state as any, inputRef);
```

## Integration Notes

- Most consumers should integrate this through higher-level hooks like `useHiddenSelect` in `@vue-aria/select`.
- For native validation parity, pass the actual form-associated input/select/textarea ref.
- For non-native (`aria`) validation, preserve the same state shape but skip browser validity enforcement.

## Notes

- Current implementation focuses on native validity wiring and invalid/reset/change event integration.
- `Spectrum S2` is ignored for this port.
