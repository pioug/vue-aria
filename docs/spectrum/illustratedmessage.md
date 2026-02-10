# @vue-spectrum/illustratedmessage

Vue port baseline of `@react-spectrum/illustratedmessage`.

<script setup lang="ts">
import { Content, Heading, IllustratedMessage } from "@vue-spectrum/vue-spectrum";
</script>

## Preview

<div class="spectrum-preview">
  <IllustratedMessage class="spectrum-preview-panel" style="padding: 24px;">
    <svg
      aria-hidden="true"
      viewBox="0 0 48 48"
      width="56"
      height="56">
      <circle cx="24" cy="24" r="20" fill="currentColor" opacity="0.15" />
      <path d="M16 24h16M24 16v16" stroke="currentColor" stroke-width="2" />
    </svg>
    <Heading level="3" class="spectrum-IllustratedMessage-heading">No results</Heading>
    <Content class="spectrum-IllustratedMessage-description">
      Try adjusting your filters or search terms.
    </Content>
  </IllustratedMessage>
</div>

## Exports

- `IllustratedMessage`

## Example

```ts
import { h } from "vue";
import { Content } from "@vue-spectrum/view";
import { Heading } from "@vue-spectrum/text";
import { IllustratedMessage } from "@vue-spectrum/illustratedmessage";

const component = h(
  IllustratedMessage,
  null,
  {
    default: () => [
      h("svg", { "aria-hidden": "true", viewBox: "0 0 48 48" }, [h("path")]),
      h(Heading, null, () => "Nothing here"),
      h(Content, null, () => "Create your first item to get started."),
    ],
  }
);
```

## Notes

- Baseline includes root rendering semantics, slot-based heading/content class wiring, and SSR-safe behavior.
- Advanced visual/theming parity remains in progress.
