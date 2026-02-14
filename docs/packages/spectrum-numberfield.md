# @vue-spectrum/numberfield - NumberField

`NumberField` allows users to enter numeric values and adjust them with stepper buttons.

## Example

```vue
<script setup lang="ts">
import { NumberField } from "@vue-spectrum/numberfield";
</script>

<template>
  <NumberField label="Width" :defaultValue="1024" :minValue="0" />
</template>
```

## Value

- Uncontrolled: `defaultValue`
- Controlled: `value` + `onChange`

```vue
<script setup lang="ts">
import { ref } from "vue";
import { NumberField } from "@vue-spectrum/numberfield";

const value = ref(15);
const onChange = (next: number) => {
  value.value = next;
};
</script>

<template>
  <NumberField label="Cookies (Uncontrolled)" :defaultValue="15" :minValue="0" />
  <NumberField label="Cookies (Controlled)" :value="value" :onChange="onChange" :minValue="0" />
</template>
```

### HTML forms

`name` is supported and submits the raw number value through a hidden input.

```vue
<NumberField
  label="Transaction amount"
  name="amount"
  :defaultValue="45"
  :formatOptions="{ style: 'currency', currency: 'USD' }" />
```

## Labeling

- Prefer visible `label`.
- If no visible label is provided, pass `aria-label` or `aria-labelledby`.

## Number formatting

Use `formatOptions` to format values using `Intl.NumberFormat` options.

```vue
<template>
  <NumberField label="Sales tax" :formatOptions="{ style: 'percent' }" :minValue="0" :defaultValue="0.05" />
  <NumberField label="Transaction amount" :defaultValue="45" :formatOptions="{ style: 'currency', currency: 'EUR' }" />
</template>
```

## Minimum, maximum, and step

Use `minValue`, `maxValue`, and `step` to constrain and snap values.

```vue
<template>
  <NumberField label="Age" :minValue="0" />
  <NumberField label="Step" :step="10" />
  <NumberField label="Step + minValue" :minValue="2" :step="3" />
  <NumberField label="Step + range" :minValue="2" :maxValue="21" :step="3" />
</template>
```

## Events

`onChange` fires when the value is committed (blur, keyboard stepping, or stepper button interaction).

## Validation

Use `isRequired`, `validationState`, `isInvalid`, `description`, and `errorMessage`.

## Visual options

### Quiet

```vue
<NumberField label="Cookies" isQuiet :minValue="0" />
```

### Hidden steppers

```vue
<NumberField label="Cookies" hideStepper :minValue="0" />
```

### Disabled

```vue
<NumberField label="Cookies" isDisabled :minValue="0" />
```

### Read only

```vue
<NumberField label="Cookies" isReadOnly :defaultValue="12" />
```

## Related

- `Spectrum S2` remains out of scope unless explicitly requested.
