# @vue-spectrum/radio - RadioGroup

`RadioGroup` and `Radio` allow selecting a single option from a list of mutually exclusive choices.

## Example

```vue
<script setup lang="ts">
import { Radio, RadioGroup } from "@vue-spectrum/radio";
</script>

<template>
  <RadioGroup label="Favorite pet">
    <Radio value="dogs">Dogs</Radio>
    <Radio value="cats">Cats</Radio>
  </RadioGroup>
</template>
```

## Content

`RadioGroup` accepts multiple `Radio` children. Each `Radio` is labeled by slot content.

`Radio` must be rendered inside a `RadioGroup`.

## Value

`RadioGroup` supports single selection.

- Uncontrolled: `defaultValue`
- Controlled: `value` + `onChange`

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Radio, RadioGroup } from "@vue-spectrum/radio";

const selected = ref("yes");
const onChange = (next: string | null) => {
  selected.value = next ?? "";
};
</script>

<template>
  <RadioGroup label="Are you a wizard? (uncontrolled)" defaultValue="yes">
    <Radio value="yes">Yes</Radio>
    <Radio value="no">No</Radio>
  </RadioGroup>

  <RadioGroup label="Are you a wizard? (controlled)" :value="selected" :onChange="onChange">
    <Radio value="yes">Yes</Radio>
    <Radio value="no">No</Radio>
  </RadioGroup>
</template>
```

### HTML forms

Use `name` on `RadioGroup` and `value` on each `Radio`.

```vue
<RadioGroup label="Favorite pet" name="pet">
  <Radio value="dogs">Dogs</Radio>
  <Radio value="cats">Cats</Radio>
</RadioGroup>
```

## Labeling

- Prefer a visible `label` on `RadioGroup`.
- If no visible label is used, provide `aria-label` or `aria-labelledby`.
- `Radio` items should always have visible label text (or an explicit ARIA label).

## Accessibility

`RadioGroup` exposes `role="radiogroup"` and supports required, read-only, disabled, and invalid ARIA semantics.

## Internationalization

Provide localized strings for `label`, `description`, `errorMessage`, and `Radio` label content.

## Events

`onChange` receives the selected radio value when selection changes.

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Radio, RadioGroup } from "@vue-spectrum/radio";

const selected = ref<string | null>(null);
const onChange = (next: string | null) => {
  selected.value = next;
};
</script>

<template>
  <RadioGroup label="Favorite avatar" :value="selected" :onChange="onChange">
    <Radio value="wizard">Wizard</Radio>
    <Radio value="dragon">Dragon</Radio>
  </RadioGroup>
  <div>You have selected: {{ selected }}</div>
</template>
```

## Validation

Use `isRequired` to require a selection. Use `isInvalid` and `errorMessage` for custom validation state and messaging.

For browser-native constraints, use `validationBehavior="native"`.

```vue
<RadioGroup label="Favorite pet" name="pet" isRequired validationBehavior="native">
  <Radio value="dogs">Dogs</Radio>
  <Radio value="cats">Cats</Radio>
  <Radio value="dragons">Dragons</Radio>
</RadioGroup>
```

## Visual options

### Orientation

`RadioGroup` is vertical by default. Set `orientation="horizontal"` for inline layout.

```vue
<RadioGroup label="Favorite avatar" orientation="horizontal">
  <Radio value="wizard">Wizard</Radio>
  <Radio value="dragon">Dragon</Radio>
</RadioGroup>
```

### Help text

Use `description` and `errorMessage` to provide additional context.

```vue
<RadioGroup
  aria-label="Favorite pet"
  isInvalid
  description="Please select a pet."
  errorMessage="No cats allowed.">
  <Radio value="dogs">Dogs</Radio>
  <Radio value="cats">Cats</Radio>
  <Radio value="dragons">Dragons</Radio>
</RadioGroup>
```

### Disabled

```vue
<RadioGroup label="Favorite avatar" isDisabled>
  <Radio value="wizard">Wizard</Radio>
  <Radio value="dragon">Dragon</Radio>
</RadioGroup>
```

```vue
<RadioGroup label="Favorite avatar">
  <Radio value="wizard">Wizard</Radio>
  <Radio value="dragon" isDisabled>Dragon</Radio>
</RadioGroup>
```

### Read only

```vue
<RadioGroup label="Favorite avatar" defaultValue="wizard" isReadOnly>
  <Radio value="wizard">Wizard</Radio>
  <Radio value="dragon">Dragon</Radio>
</RadioGroup>
```

### Emphasized

```vue
<RadioGroup label="Favorite avatar" defaultValue="dragon" isEmphasized>
  <Radio value="wizard">Wizard</Radio>
  <Radio value="dragon">Dragon</Radio>
</RadioGroup>
```

### State matrix example

```vue
<template>
  <RadioGroup
    label="Delivery speed"
    orientation="horizontal"
    description="Choose one shipping option."
    defaultValue="standard"
    isEmphasized>
    <Radio value="standard">Standard</Radio>
    <Radio value="express">Express</Radio>
    <Radio value="overnight" isDisabled>Overnight</Radio>
  </RadioGroup>

  <RadioGroup
    label="Account mode"
    defaultValue="readonly"
    isReadOnly>
    <Radio value="readonly">Read only</Radio>
    <Radio value="edit">Editable</Radio>
  </RadioGroup>
</template>
```

## Related

- `Spectrum S2` remains out of scope unless explicitly requested.
