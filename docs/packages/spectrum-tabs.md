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

## Keyboard Activation Modes

- `automatic`: arrow-key navigation moves focus and updates selected tab.
- `manual`: arrow-key navigation moves focus only; selection commits with `Enter` or `Space`.

Tabs also wrap keyboard navigation at boundaries (for example first to last with `ArrowLeft` in horizontal orientation).
`Home` and `End` move focus/selection to first and last enabled tabs.
Disabled tabs are skipped during keyboard navigation.

## Accessibility

- Tab list uses `role="tablist"`.
- Tabs expose `role="tab"` and selected/disabled ARIA state.
- Panel uses `role="tabpanel"` and links to selected tab id.

## Related

- `Spectrum S2` remains out of scope unless explicitly requested.
