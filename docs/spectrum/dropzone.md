# @vue-spectrum/dropzone

Vue port baseline of `@react-spectrum/dropzone`.

<script setup lang="ts">
import {
  Button,
  Content,
  DropZone,
  Header,
  IllustratedMessage,
} from "@vue-spectrum/vue-spectrum";
</script>

## Preview

<div class="spectrum-preview">
  <DropZone :isFilled="true">
    <IllustratedMessage>
      <Header>No files</Header>
      <Content>
        <Button variant="primary">Select a file</Button>
      </Content>
    </IllustratedMessage>
  </DropZone>
</div>

## Exports

- `DropZone`

## Example

```vue
<script setup lang="ts">
import { DropZone } from "@vue-spectrum/dropzone";
import { Content, Header } from "@vue-spectrum/view";
import { IllustratedMessage } from "@vue-spectrum/illustratedmessage";
</script>

<template>
  <DropZone />
</template>
```

## Notes

- Baseline includes drop-target lifecycle via `@vue-aria/dnd/useDrop`, filled banner behavior (with locale-aware default replace banner copy), and starter drag/drop tests.
- Ref forwarding (`UNSAFE_getDOMNode`) and SSR coverage are included.
- Advanced upstream heading-context wiring and full visual/theming parity remain in progress.
