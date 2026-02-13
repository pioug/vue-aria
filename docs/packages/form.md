# @vue-aria/form

`@vue-aria/form` ports form-validation helpers from upstream `@react-aria/form`.

## Implemented modules

- `useFormValidation`

## Upstream-aligned example

```ts
import { ref } from "vue";
import { useFormValidation } from "@vue-aria/form";

const inputRef = ref<HTMLInputElement | null>(null);
useFormValidation({ validationBehavior: "native" }, state as any, inputRef);
```

## Notes

- Current implementation focuses on native validity wiring and invalid/reset/change event integration.
- `Spectrum S2` is ignored for this port.
