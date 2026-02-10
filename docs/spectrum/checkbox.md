# @vue-spectrum/checkbox

Vue port of `@react-spectrum/checkbox`.

> Status: complete parity baseline for component behavior, tests, and docs.

<script setup lang="ts">
import { Checkbox, CheckboxGroup, Flex } from "@vue-spectrum/vue-spectrum";
</script>

## Preview

<div class="spectrum-preview">
  <Flex direction="column" gap="size-200" class="spectrum-preview-panel">
    <Checkbox defaultSelected>Enable notifications</Checkbox>
    <Checkbox :isIndeterminate="true">Sync status</Checkbox>

    <CheckboxGroup label="Favorite pets" :defaultValue="['cats']">
      <Checkbox value="dogs">Dogs</Checkbox>
      <Checkbox value="cats">Cats</Checkbox>
      <Checkbox value="dragons">Dragons</Checkbox>
    </CheckboxGroup>
  </Flex>
</div>

## Exports

- `Checkbox`
- `CheckboxGroup`

## Example

```ts
import { h } from "vue";
import { Checkbox, CheckboxGroup } from "@vue-spectrum/checkbox";

const field = h(
  CheckboxGroup,
  {
    label: "Favorite pets",
    defaultValue: ["cats"],
    onChange: (value) => {
      console.log(value);
    },
  },
  {
    default: () => [
      h(Checkbox, { value: "dogs" }, () => "Dogs"),
      h(Checkbox, { value: "cats" }, () => "Cats"),
    ],
  }
);
```

## Notes

- Supports controlled and uncontrolled modes for both `Checkbox` and `CheckboxGroup`.
- Supports `isDisabled`, `isReadOnly`, `isRequired`, and invalid state semantics.
- Group-level `isEmphasized` is inherited by child checkboxes through provider context.
