# @vue-spectrum/combobox - ComboBox

`ComboBox` combines a text input with a listbox of suggestions.

## Example

```vue
<script setup lang="ts">
import { ComboBox } from "@vue-spectrum/combobox";

const items = [
  { key: "vue", label: "Vue" },
  { key: "svelte", label: "Svelte" },
  { key: "react", label: "React" },
];
</script>

<template>
  <ComboBox label="Framework" :items="items" />
</template>
```

## Slot Collection

```vue
<script setup lang="ts">
import { ComboBox, Item, Section } from "@vue-spectrum/combobox";
</script>

<template>
  <ComboBox label="State">
    <Section title="West">
      <Item id="ca">California</Item>
      <Item id="or">Oregon</Item>
    </Section>
    <Item id="ny">New York</Item>
  </ComboBox>
</template>
```

## Key Props

- `items` for data-driven suggestions.
- `disabledKeys` for externally disabling specific option keys.
- `selectedKey` / `defaultSelectedKey` for selection state.
- `inputValue` / `defaultInputValue` for text input control.
- `isOpen` / `defaultOpen` for popup state control.
- `menuTrigger` (`"input" | "focus" | "manual"`) for suggestion-open behavior.
- `loadingState`, `maxHeight`, and `onLoadMore` for async loading flows.
- `onSelectionChange`, `onInputChange`, and `onOpenChange` callbacks.
- `onFocus` and `onBlur` for combobox focus event hooks.
- `formValue` (`"text" | "key"`) for native form submission payload strategy.
- `name` / `form` for form participation when used inside or alongside native forms.
- `validationState` for invalid semantics and styling.
- `validationBehavior` (`"aria" | "native"`) for ARIA-only vs native validation behavior.

Filtering behavior:
- uncontrolled item collections (for example slot-defined items) use default locale-aware `contains` filtering.
- controlled `items` collections are not auto-filtered; update `items` in `onInputChange` for fully controlled filtering.

## Controlled Selection

When `selectedKey` is provided, selection is controlled by parent state. User selection emits `onSelectionChange`, and the rendered value follows the controlled prop.

```vue
<script setup lang="ts">
import { ref } from "vue";
import { ComboBox } from "@vue-spectrum/combobox";

const selectedKey = ref("vue");
const items = [
  { key: "vue", label: "Vue" },
  { key: "react", label: "React" },
  { key: "svelte", label: "Svelte" },
];

const onSelectionChange = (key: string | number | null) => {
  selectedKey.value = key == null ? "" : String(key);
};
</script>

<template>
  <ComboBox
    label="Framework"
    :items="items"
    :selected-key="selectedKey"
    :on-selection-change="onSelectionChange"
  />
</template>
```

## Open State Control

Use `isOpen` for controlled popup visibility or `defaultOpen` for initial uncontrolled visibility.

## Form Integration

Set `name` and optional `form` to attach the combobox input to form submission, including cases where the input is outside the target `<form>` element.

- `formValue="text"` (default) submits the typed input text.
- `formValue="key"` submits the selected option key through a hidden input.
- `allowsCustomValue` always uses text submission semantics.
- `validationBehavior="native"` enables native required semantics on the input when `isRequired` is set.

## Validation

Use `validate` for custom client validation and `errorMessage` for custom invalid text rendering.

- `validate` receives `{ inputValue, selectedKey }`.
- `validationBehavior="aria"` renders invalid messaging with ARIA semantics.
- `validationBehavior="native"` integrates with native form validity (`checkValidity`, required fields, and browser validity APIs).

```vue
<script setup lang="ts">
import { ComboBox } from "@vue-spectrum/combobox";

const items = [
  { key: "vue", label: "Vue" },
  { key: "react", label: "React" },
  { key: "svelte", label: "Svelte" },
];

const validateSelection = ({ selectedKey }: { inputValue: string; selectedKey: string | number | null }) =>
  selectedKey == null ? "Please choose a framework" : null;
</script>

<template>
  <ComboBox
    label="Framework (ARIA validation)"
    :items="items"
    :validate="validateSelection"
    validation-behavior="aria"
  />

  <ComboBox
    label="Framework (Native validation)"
    :items="items"
    is-required
    validation-behavior="native"
    :error-message="({ validationDetails }) =>
      validationDetails?.valueMissing ? 'Please choose a framework' : null"
  />
</template>
```

## Async Loading

Use `loadingState` to expose loading UI and `onLoadMore` for incremental loading when the listbox scroll reaches the end.

- `loadingState="loading"` and `loadingState="filtering"` show a delayed (`500ms`) input loading spinner.
- `loadingState="filtering"` shows the spinner while the menu is open (or while closed when `menuTrigger="manual"`).
- `loadingState="loading"` renders a `"Loading…"` placeholder in the open menu when no items are available.
- `loadingState="loadingMore"` renders a trailing listbox spinner row while additional items stream in.
- Async comboboxes with no items in non-loading states render a `No results` menu placeholder.

```vue
<script setup lang="ts">
import { ref } from "vue";
import { ComboBox } from "@vue-spectrum/combobox";

const items = ref(Array.from({ length: 30 }, (_, index) => ({
  key: `item-${index + 1}`,
  label: `Item ${index + 1}`,
})));

const loadingState = ref<"idle" | "loading" | "filtering" | "loadingMore">("idle");

const onLoadMore = async () => {
  if (loadingState.value !== "idle") {
    return;
  }

  loadingState.value = "loadingMore";
  const nextStart = items.value.length + 1;
  items.value = items.value.concat(
    Array.from({ length: 20 }, (_, offset) => ({
      key: `item-${nextStart + offset}`,
      label: `Item ${nextStart + offset}`,
    }))
  );
  loadingState.value = "idle";
};
</script>

<template>
  <ComboBox
    label="Async items"
    :items="items"
    :max-height="240"
    :loading-state="loadingState"
    :on-load-more="onLoadMore"
  />
</template>
```

## Keyboard and Focus

- `ArrowDown` opens suggestions and focuses the first option.
- `ArrowUp` opens suggestions and focuses the last option.
- `Enter` and `Tab` commit the currently focused option when the menu is open.
- `menuTrigger="manual"` keeps suggestions closed while typing.

## Accessibility

- Input exposes combobox semantics (`role="combobox"`).
- Popup options use listbox semantics via `@vue-spectrum/listbox`.
- Keyboard interaction and focus management are delegated to `@vue-aria/combobox`.

## Related

- `Spectrum S2` remains out of scope unless explicitly requested.
