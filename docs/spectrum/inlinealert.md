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

```ts
import { h } from "vue";
import { Content, Header } from "@vue-spectrum/view";
import { InlineAlert } from "@vue-spectrum/inlinealert";

const component = h(
  InlineAlert,
  {
    variant: "negative",
    autoFocus: true,
  },
  {
    default: () => [
      h(Header, null, () => "Could not save changes"),
      h(Content, null, () => "Please retry after checking your network connection."),
    ],
  }
);
```

## Notes

- Baseline includes alert semantics (`role="alert"`), variant classes, and `autoFocus` behavior.
- Advanced icon/theming parity remains in progress.
