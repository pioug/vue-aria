# @vue-spectrum/view

Vue port of `@react-spectrum/view` container primitives.

<script setup lang="ts">
import { Content, Footer, Header, View } from "@vue-spectrum/vue-spectrum";
</script>

## Preview

<div class="spectrum-preview">
  <View element-type="section" class="spectrum-preview-panel">
    <Header class="spectrum-preview-panel-header">Release Notes</Header>
    <Content class="spectrum-preview-panel-content">
      <p class="spectrum-preview-muted">
        This panel demonstrates semantic section wrappers composed with View, Header, Content,
        and Footer primitives.
      </p>
    </Content>
    <Footer class="spectrum-preview-panel-footer">Updated 2 minutes ago</Footer>
  </View>
</div>

## Exports

- `View`
- `Content`
- `Header`
- `Footer`

## Example

```ts
import { h } from "vue";
import { View, Header, Content, Footer } from "@vue-spectrum/view";

const panel = h(View, { elementType: "section" }, () => [
  h(Header, null, () => "Panel title"),
  h(Content, null, () => "Panel body"),
  h(Footer, null, () => "Panel footer"),
]);
```

## Notes

- `View` is a generic container with configurable element type.
- `Content`, `Header`, and `Footer` provide semantic wrappers for common panel composition.
