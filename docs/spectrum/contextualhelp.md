# @vue-spectrum/contextualhelp

Vue port baseline of `@react-spectrum/contextualhelp`.

<script setup lang="ts">
import { Content, ContextualHelp, Footer, Header, Link } from "@vue-spectrum/vue-spectrum";
</script>

## Preview

<div class="spectrum-preview">
  <ContextualHelp>
    <Header>About this field</Header>
    <Content>Use at least 12 characters and include one symbol.</Content>
    <Footer>
      <Link href="#">Learn more</Link>
    </Footer>
  </ContextualHelp>
</div>

## Exports

- `ContextualHelp`

## Example

```ts
import { h } from "vue";
import { Content, Footer, Header } from "@vue-spectrum/view";
import { Link } from "@vue-spectrum/link";
import { ContextualHelp } from "@vue-spectrum/contextualhelp";

const component = h(ContextualHelp, null, {
  default: () => [
    h(Header, null, () => "Title"),
    h(Content, null, () => "Help details."),
    h(Footer, null, () => h(Link, { href: "#" }, () => "Learn more")),
  ],
});
```

## Notes

- Baseline includes quiet action-button trigger, default/help labels, popover dialog rendering, trigger-anchored placement support, trigger ref exposure (`UNSAFE_getDOMNode`, `focus()`), and portal-container routing via `UNSAFE_PortalProvider` (including nested null override behavior).
- Advanced icon assets and animation parity remain in progress.
