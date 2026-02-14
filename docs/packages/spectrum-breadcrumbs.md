# @vue-spectrum/breadcrumbs - Breadcrumbs

`Breadcrumbs` shows hierarchy and navigational context for the current location in an app.

## Example

```vue
<script setup lang="ts">
import { Breadcrumbs, Item } from "@vue-spectrum/breadcrumbs";
</script>

<template>
  <Breadcrumbs>
    <Item key="home">Home</Item>
    <Item key="trendy">Trendy</Item>
    <Item key="march-assets">March 2020 Assets</Item>
  </Breadcrumbs>
</template>
```

## Content

`Breadcrumbs` accepts static `Item` children. Each item key is passed to `onAction` when activated (actions are suppressed when breadcrumbs are disabled).

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Breadcrumbs, Item } from "@vue-spectrum/breadcrumbs";

const selected = ref<string | number | null>(null);
const onAction = (key: string | number) => {
  selected.value = key;
};
</script>

<template>
  <Breadcrumbs :onAction="onAction">
    <Item key="home">Home</Item>
    <Item key="trendy">Trendy</Item>
    <Item key="march-assets">March 2020 Assets</Item>
  </Breadcrumbs>
  <p>Selected key: {{ selected }}</p>
</template>
```

## Links

Items can navigate by providing `href`.

```vue
<Breadcrumbs>
  <Item href="#">Home</Item>
  <Item href="#">Vue Spectrum</Item>
  <Item key="breadcrumbs">Breadcrumbs</Item>
</Breadcrumbs>
```

## Root Customization

```vue
<template>
  <Breadcrumbs
    id="project-breadcrumbs"
    UNSAFE_className="custom-breadcrumbs"
    :UNSAFE_style="{ marginBottom: '12px' }"
  >
    <Item key="home">Home</Item>
    <Item key="reports">Reports</Item>
    <Item key="current">Current report</Item>
  </Breadcrumbs>
</template>
```

## Accessibility

- If no visible context is available, pass `aria-label`.
- Current item is exposed with `aria-current="page"`.

## Visual options

### Size

```vue
<template>
  <Breadcrumbs size="S">
    <Item key="home">Home</Item>
    <Item key="trendy">Trendy</Item>
  </Breadcrumbs>

  <Breadcrumbs size="M">
    <Item key="home">Home</Item>
    <Item key="trendy">Trendy</Item>
  </Breadcrumbs>

  <Breadcrumbs size="L">
    <Item key="home">Home</Item>
    <Item key="trendy">Trendy</Item>
  </Breadcrumbs>
</template>
```

### Multiline

```vue
<Breadcrumbs isMultiline>
  <Item key="home">Home</Item>
  <Item key="trendy">Trendy</Item>
  <Item key="march-assets">March 2020 Assets</Item>
</Breadcrumbs>
```

### Root context

```vue
<Breadcrumbs showRoot>
  <Item key="home">Home</Item>
  <Item key="trendy">Trendy</Item>
  <Item key="winter">Winter</Item>
  <Item key="holiday">Holiday</Item>
</Breadcrumbs>
```

### Disabled

```vue
<Breadcrumbs isDisabled>
  <Item key="home">Home</Item>
  <Item key="trendy">Trendy</Item>
  <Item key="march-assets">March 2020 Assets</Item>
</Breadcrumbs>
```

## Related

- `Spectrum S2` remains out of scope unless explicitly requested.
