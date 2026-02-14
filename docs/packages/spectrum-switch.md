# @vue-spectrum/switch - Switch

`Switch` allows toggling an individual option on or off.

## Example

```vue
<script setup lang="ts">
import { Switch } from "@vue-spectrum/switch";
</script>

<template>
  <Switch>Low power mode</Switch>
</template>
```

## Content

`Switch` renders its label from slot content.

Switches communicate activation state (on/off). For multi-selection semantics, use checkboxes.

## Accessibility

If no visible label is rendered, provide `aria-label` or `aria-labelledby`.

```vue
<Switch aria-label="Low power mode" />
```

## Internationalization

Provide localized label content (or localized `aria-label`). RTL layouts are handled through shared i18n direction behavior.

## Value

- Uncontrolled: `defaultSelected`
- Controlled: `isSelected` + `onChange`

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Switch } from "@vue-spectrum/switch";

const selected = ref(false);
const onChange = (next: boolean) => {
  selected.value = next;
};
</script>

<template>
  <Switch defaultSelected>
    Low power mode (uncontrolled)
  </Switch>

  <Switch :isSelected="selected" :onChange="onChange">
    Low power mode (controlled)
  </Switch>
</template>
```

### HTML forms

Use `name` and `value` for form integration.

```vue
<Switch name="power" value="low">Low power mode</Switch>
```

## Events

`onChange` fires whenever users toggle the switch.

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Switch } from "@vue-spectrum/switch";

const selected = ref(false);
const onChange = (next: boolean) => {
  selected.value = next;
};
</script>

<template>
  <Switch :onChange="onChange">Switch Label</Switch>
  <div>The Switch is on: {{ selected.toString() }}</div>
</template>
```

## Visual options

### Disabled

```vue
<Switch isDisabled>Switch Label</Switch>
```

### Emphasized

```vue
<Switch isEmphasized defaultSelected>Switch Label</Switch>
```

### Read only

```vue
<Switch isReadOnly isSelected>Switch Label</Switch>
```

### State matrix example

```vue
<template>
  <Switch defaultSelected>Default on</Switch>
  <Switch isDisabled>Disabled off</Switch>
  <Switch isReadOnly isSelected>Read only on</Switch>
  <Switch isEmphasized defaultSelected>Emphasized on</Switch>
</template>
```

## Interaction options

### Excluding from tab order

```vue
<Switch :excludeFromTabOrder="true">Mouse-only toggle</Switch>
```

### Form reset behavior

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Switch } from "@vue-spectrum/switch";

const selected = ref(false);
const onChange = (next: boolean) => {
  selected.value = next;
};
</script>

<template>
  <form>
    <Switch :isSelected="selected" :onChange="onChange">Resettable switch</Switch>
    <input type="reset">
  </form>
</template>
```

## Related

- `Spectrum S2` remains out of scope unless explicitly requested.
