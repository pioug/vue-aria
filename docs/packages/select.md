# @vue-aria/select

`@vue-aria/select` ports select accessibility hooks from upstream `@react-aria/select`.

## API

- `useSelect`
- `useHiddenSelect`
- `HiddenSelect`
- `selectData`

## Features

- Trigger button semantics for a listbox popup (`aria-haspopup="listbox"`).
- Keyboard interaction wiring for open/close/select flows.
- Typeahead behavior via selection keyboard delegate integration.
- Hidden native `<select>` and hidden-input fallback for browser form integration.
- Native validation bridge via `@vue-aria/form`.

## Anatomy

`useSelect` returns:

- `labelProps`
- `triggerProps`
- `valueProps`
- `menuProps`
- `descriptionProps`
- `errorMessageProps`
- `hiddenSelectProps`

State is expected to be upstream-compatible with `@react-stately/select` behavior (or an adapter that mirrors that shape).

## Example (Composable Usage)

```ts
import { useSelect, HiddenSelect } from "@vue-aria/select";
import { ref } from "vue";

const triggerRef = { current: null as HTMLElement | null };
const state = {} as any;

const { triggerProps, menuProps, hiddenSelectProps } = useSelect(
  { label: "Color", name: "color" },
  state,
  triggerRef
);

// In template/render:
// <HiddenSelect v-bind="hiddenSelectProps" />
// <button ref="..." v-bind="triggerProps">
//   <span v-bind="valueProps">...</span>
// </button>
// <ul v-bind="menuProps">...</ul>
```

## Usage Patterns

### Dynamic collections

Provide item collections from reactive data and keep item keys stable. The selected key should map to each item key/id.

### Controlled selection

Drive selected state externally and feed updates back through your state adapter’s selection change handler.

### Controlled open state

If you control open state, make sure `state.isOpen` and open/close/toggle handlers remain synchronized with trigger/menu handlers from `useSelect`.

### Disabled select and disabled options

Use `isDisabled` for full-control disablement and provide disabled keys on the state collection/selection manager for per-option disablement.

### Native validation behavior

Use `validationBehavior: "native"` to enable required/custom-validity propagation through hidden native elements.

### Native form integration details

- Hidden select invalid events only transfer focus to the trigger when it is the first invalid form control.
- If an invalid event is already prevented, trigger focus transfer is skipped.
- Hidden select wiring participates in native form reset; calling `form.reset()` restores `state.defaultValue`.

```ts
// Pseudocode example:
const form = document.querySelector("form");
form?.reset(); // hidden select integration restores default selection value
```

## Notes

- Current select state integration is adapter-based and expects an upstream-equivalent state shape.
- `Spectrum S2` is ignored for this port.
