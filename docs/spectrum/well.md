# @vue-spectrum/well

Vue port of `@react-spectrum/well`.

<script setup lang="ts">
import { Well, Heading, Text } from "@vue-spectrum/vue-spectrum";
</script>

## Preview

<div class="spectrum-preview">
  <Well class="spectrum-preview-panel" role="region" aria-label="Code sample">
    <Heading level="4">Code Snippet</Heading>
    <Text class="spectrum-preview-muted">
      const result = portToVueSpectrum(source);
    </Text>
  </Well>
</div>

## Exports

- `Well`

## Example

```vue
<script setup lang="ts">
import { Well } from "@vue-spectrum/well";
</script>

<template>
  <Well />
</template>
```

## Notes

- Provides a lightweight content container with Spectrum class parity (`spectrum-Well`).
- If a label is provided (`aria-label`/`aria-labelledby`), set an explicit `role`.
