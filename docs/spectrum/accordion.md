# @vue-spectrum/accordion

Vue port of `@react-spectrum/accordion`.

> Status: complete parity baseline for component behavior, tests, and docs.

<script setup lang="ts">
import {
  Accordion,
  Disclosure,
  DisclosureHeader,
  DisclosurePanel,
  DisclosureTitle,
  Flex,
} from "@vue-spectrum/vue-spectrum";
</script>

## Preview

<div class="spectrum-preview">
  <Flex direction="column" gap="size-200" class="spectrum-preview-panel">
    <Accordion>
      <Disclosure id="files">
        <DisclosureTitle>Files</DisclosureTitle>
        <DisclosurePanel>
          Upload and organize project files with quick keyboard navigation.
        </DisclosurePanel>
      </Disclosure>
      <Disclosure id="people">
        <DisclosureTitle>People</DisclosureTitle>
        <DisclosurePanel>
          Invite collaborators and manage workspace roles from this section.
        </DisclosurePanel>
      </Disclosure>
    </Accordion>
  </Flex>
</div>

## Exports

- `Accordion`
- `Disclosure`
- `DisclosureHeader`
- `DisclosureTitle`
- `DisclosurePanel`

## Example

```ts
import { h } from "vue";
import {
  Accordion,
  Disclosure,
  DisclosurePanel,
  DisclosureTitle,
} from "@vue-spectrum/accordion";

const component = h(Accordion, null, {
  default: () => [
    h(
      Disclosure,
      { id: "files" },
      {
        default: () => [
          h(DisclosureTitle, () => "Files"),
          h(DisclosurePanel, () => "Files content"),
        ],
      }
    ),
  ],
});
```

## Notes

- Supports uncontrolled and controlled expansion with `defaultExpandedKeys`/`expandedKeys`.
- Supports accordion-level and item-level disabled behavior via `isDisabled`.
- Preserves disclosure relationships (`aria-expanded`, `aria-controls`, `aria-labelledby`, region role) in line with upstream behavior.
- `DisclosureHeader` is available as an upstream-compatible alias for `DisclosureTitle`.
