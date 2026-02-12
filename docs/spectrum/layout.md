# @vue-spectrum/layout

Vue port of `@react-spectrum/layout` primitives.

<script setup lang="ts">
import { Flex, Grid, repeat } from "@vue-spectrum/vue-spectrum";

const chipLabels = ["Default", "Quiet", "Emphasized"];
const gridCells = ["A", "B", "C", "D"];
const autoFitColumns = repeat("auto-fit", "minmax(100px, 1fr)");
</script>

## Preview

<div class="spectrum-preview spectrum-preview-stack">
  <Flex direction="row" :gap="10" align-items="center" wrap>
    <div
      v-for="label in chipLabels"
      :key="label"
      class="spectrum-preview-chip"
    >
      {{ label }}
    </div>
  </Flex>

  <Grid :columns="autoFitColumns" :gap="10">
    <div
      v-for="cell in gridCells"
      :key="cell"
      class="spectrum-preview-grid-cell"
    >
      {{ cell }}
    </div>
  </Grid>
</div>

## Exports

- `Flex`
- `Grid`
- `repeat`
- `minmax`
- `fitContent`

## Example

```vue
<script setup lang="ts">
import { Flex, Grid, repeat } from "@vue-spectrum/layout";
</script>

<template>
  <Flex />
</template>
```

## Notes

- `Flex` normalizes `start`/`end` alignment to browser-compatible flex values.
- `Grid` includes helper utilities for CSS grid template generation.
- Numeric gap and dimension values are converted to pixel strings.
