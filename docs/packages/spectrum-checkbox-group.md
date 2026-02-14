# @vue-spectrum/checkbox - CheckboxGroup

`CheckboxGroup` manages a set of related `Checkbox` options.

## Example

```vue
<script setup lang="ts">
import { Checkbox, CheckboxGroup } from "@vue-spectrum/checkbox";
</script>

<template>
  <CheckboxGroup label="Favorite sports">
    <Checkbox value="soccer">Soccer</Checkbox>
    <Checkbox value="baseball">Baseball</Checkbox>
    <Checkbox value="basketball">Basketball</Checkbox>
  </CheckboxGroup>
</template>
```

## Content

`CheckboxGroup` accepts multiple `Checkbox` children. Each item is selected based on its `value`.

## Value

- Uncontrolled: `defaultValue` (`string[]`)
- Controlled: `value` (`string[]`) + `onChange`

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Checkbox, CheckboxGroup } from "@vue-spectrum/checkbox";

const selected = ref(["soccer", "baseball"]);
const onChange = (next: string[]) => {
  selected.value = next;
};
</script>

<template>
  <CheckboxGroup label="Favorite sports (uncontrolled)" :defaultValue="['soccer', 'baseball']">
    <Checkbox value="soccer">Soccer</Checkbox>
    <Checkbox value="baseball">Baseball</Checkbox>
    <Checkbox value="basketball">Basketball</Checkbox>
  </CheckboxGroup>

  <CheckboxGroup label="Favorite sports (controlled)" :value="selected" :onChange="onChange">
    <Checkbox value="soccer">Soccer</Checkbox>
    <Checkbox value="baseball">Baseball</Checkbox>
    <Checkbox value="basketball">Basketball</Checkbox>
  </CheckboxGroup>
</template>
```

### HTML forms

Use `name` on the group with `value` on each checkbox.

```vue
<CheckboxGroup label="Condiments" name="condiments">
  <Checkbox value="mayo">Mayo</Checkbox>
  <Checkbox value="mustard">Mustard</Checkbox>
  <Checkbox value="ketchup">Ketchup</Checkbox>
</CheckboxGroup>
```

## Labeling

- Prefer visible `label`.
- If no visible label is present, provide `aria-label` or `aria-labelledby`.

## Events

`onChange` is called when selection array changes.

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Checkbox, CheckboxGroup } from "@vue-spectrum/checkbox";

const selected = ref<string[]>([]);
const onChange = (next: string[]) => {
  selected.value = next;
};
</script>

<template>
  <CheckboxGroup label="Favorite sports" :value="selected" :onChange="onChange">
    <Checkbox value="soccer">Soccer</Checkbox>
    <Checkbox value="baseball">Baseball</Checkbox>
    <Checkbox value="basketball">Basketball</Checkbox>
  </CheckboxGroup>
  <div>You have selected: {{ selected.join(", ") }}</div>
</template>
```

## Validation

`isRequired` enforces at least one selected item when using validation behavior.

```vue
<CheckboxGroup label="Agree to the following" isRequired>
  <Checkbox value="terms">Terms and conditions</Checkbox>
  <Checkbox value="privacy">Privacy policy</Checkbox>
  <Checkbox value="cookies">Cookie policy</Checkbox>
</CheckboxGroup>
```

## Visual options

### Orientation

```vue
<CheckboxGroup label="Favorite sports" orientation="horizontal">
  <Checkbox value="soccer">Soccer</Checkbox>
  <Checkbox value="baseball">Baseball</Checkbox>
  <Checkbox value="basketball">Basketball</Checkbox>
</CheckboxGroup>
```

### Help text

```vue
<CheckboxGroup
  label="Pets"
  description="Select your pets."
  errorMessage="Select only dogs and dragons."
  isInvalid>
  <Checkbox value="dogs">Dogs</Checkbox>
  <Checkbox value="cats">Cats</Checkbox>
  <Checkbox value="dragons">Dragons</Checkbox>
</CheckboxGroup>
```

### Disabled

```vue
<CheckboxGroup label="Favorite sports" isDisabled>
  <Checkbox value="soccer">Soccer</Checkbox>
  <Checkbox value="baseball">Baseball</Checkbox>
  <Checkbox value="basketball">Basketball</Checkbox>
</CheckboxGroup>
```

### Read only

```vue
<CheckboxGroup label="Favorite sports" :defaultValue="['baseball']" isReadOnly>
  <Checkbox value="soccer">Soccer</Checkbox>
  <Checkbox value="baseball">Baseball</Checkbox>
  <Checkbox value="basketball">Basketball</Checkbox>
</CheckboxGroup>
```

### Emphasized

```vue
<CheckboxGroup label="Favorite sports" :defaultValue="['soccer', 'baseball']" isEmphasized>
  <Checkbox value="soccer">Soccer</Checkbox>
  <Checkbox value="baseball">Baseball</Checkbox>
  <Checkbox value="basketball">Basketball</Checkbox>
</CheckboxGroup>
```

### Invalid + emphasized

```vue
<CheckboxGroup
  label="Favorite sports"
  isEmphasized
  isInvalid
  errorMessage="Select only soccer and baseball."
  :defaultValue="['soccer']"
>
  <Checkbox value="soccer">Soccer</Checkbox>
  <Checkbox value="baseball">Baseball</Checkbox>
  <Checkbox value="basketball">Basketball</Checkbox>
</CheckboxGroup>
```
