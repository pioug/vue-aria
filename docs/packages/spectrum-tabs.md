# @vue-spectrum/tabs - Tabs

`Tabs` organizes content into selectable tab panels.

## Example

```vue
<script setup lang="ts">
import { TabList, TabPanels, Tabs } from "@vue-spectrum/tabs";

const items = [
  { key: "first", title: "First", children: "First panel" },
  { key: "second", title: "Second", children: "Second panel" },
];
</script>

<template>
  <Tabs aria-label="Sample tabs" :items="items">
    <TabList />
    <TabPanels />
  </Tabs>
</template>
```

## Static Composition

```vue
<script setup lang="ts">
import { Item, TabList, TabPanels, Tabs } from "@vue-spectrum/tabs";
</script>

<template>
  <Tabs aria-label="Static tabs">
    <TabList>
      <Item id="a" title="A" />
      <Item id="b" title="B" />
    </TabList>
    <TabPanels>
      <Item id="a">Panel A</Item>
      <Item id="b">Panel B</Item>
    </TabPanels>
  </Tabs>
</template>
```

## Key Props

- `orientation="horizontal" | "vertical"`.
- `keyboardActivation="automatic" | "manual"`.
- `selectedKey` / `defaultSelectedKey`.
- `disabledKeys` and `isDisabled`.

## Accessibility

- Tab list uses `role="tablist"`.
- Tabs expose `role="tab"` and selected/disabled ARIA state.
- Panel uses `role="tabpanel"` and links to selected tab id.

## Related

- `Spectrum S2` remains out of scope unless explicitly requested.
