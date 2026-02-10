# @vue-spectrum/card

Vue port of `@react-spectrum/card`.

> Status: in progress. Current port includes `Card`, `CardView`, and the layout classes (`GridLayout`, `GalleryLayout`, `WaterfallLayout`) with baseline behavior and tests. Full React Spectrum parity is still ongoing.

<script setup lang="ts">
import { Card, CardView, Content, GridLayout, Heading, Image, Text } from "@vue-spectrum/vue-spectrum";

const items = [
  { src: "https://i.imgur.com/Z7AzH2c.jpg", title: "Title 1" },
  { src: "https://i.imgur.com/DhygPot.jpg", title: "Title 2" },
  { src: "https://i.imgur.com/L7RTlvI.png", title: "Title 3" },
];
const layout = new GridLayout();
</script>

## Preview

<div class="spectrum-preview">
  <div class="spectrum-preview-panel">
    <CardView :layout="layout" :items="items" aria-label="Card examples">
      <template #default="{ item }">
        <Card>
          <Image :src="item.src" />
          <Heading>{{ item.title }}</Heading>
          <Text slot="detail">PNG</Text>
          <Content>Description</Content>
        </Card>
      </template>
    </CardView>
  </div>
</div>

## Exports

- `Card`
- `CardView`
- `GridLayout`
- `GalleryLayout`
- `WaterfallLayout`

## Example

```ts
import { h } from "vue";
import { Card, Content, GridLayout, Heading, Image, Text } from "@vue-spectrum/card";

const card = h(
  Card,
  {},
  {
    default: () => [
      h(Image, { src: "https://i.imgur.com/Z7AzH2c.jpg" }),
      h(Heading, () => "File"),
      h(Text, { slot: "detail" }, () => "PNG"),
      h(Content, () => "Description"),
    ],
  }
);

const layout = new GridLayout();
```

## Notes

- `Card` currently ports core labeling/description semantics, quiet variant classing, focusability, image-alt handling parity, and baseline selected/disabled card states.
- `Card` currently ports upstream-like warnings for additional focusable children while excluding the internal selection checkbox control.
- `CardView` currently ports baseline grid rendering for static/dynamic card collections with layout class selection plus baseline keyboard navigation (`Arrow*`, `Home`, `End`, `PageUp`, `PageDown`, including RTL-aware left/right mapping) and selection state handling (`selectedKeys`, `defaultSelectedKeys`, `disabledKeys`, `onSelectionChange`) for `single`/`multiple` modes, including controlled selection updates, single-mode deselection on re-activate, scroll-bottom `onLoadMore` callback behavior, falsy-key handling, checkbox interaction behavior, and `selectionMode="none"` support.
- Additional React Spectrum parity cases (advanced layout behavior details, virtualization, and deeper interaction semantics) remain planned.
