# @vue-spectrum/inlinealert

Vue port baseline of `@react-spectrum/inlinealert`.

<script setup lang="ts">
import { Content, Header, InlineAlert } from "@vue-spectrum/vue-spectrum";
</script>

## Preview

<div class="spectrum-preview">
  <InlineAlert class="spectrum-preview-panel" variant="notice">
    <Header>Storage almost full</Header>
    <Content>
      Remove old files or upgrade your storage plan to avoid sync interruptions.
    </Content>
  </InlineAlert>
</div>

## Exports

- `InlineAlert`

## Example

```vue
<script setup lang="ts">
import { Content, Header } from "@vue-spectrum/view";
import { InlineAlert } from "@vue-spectrum/inlinealert";
</script>

<template>
  <InlineAlert />
</template>
```

## Notes

- Baseline includes alert semantics (`role="alert"`), variant classes, variant-specific icon semantics (`info`/`positive`/`notice`/`negative` with localized accessible labels), and `autoFocus` behavior.
- Advanced icon/theming parity remains in progress.
