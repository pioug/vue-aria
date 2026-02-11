# @vue-spectrum/toast

Vue port baseline of `@react-spectrum/toast`.

<script setup lang="ts">
import { Button, ToastContainer, ToastQueue } from "@vue-spectrum/vue-spectrum";

const showToast = () => {
  ToastQueue.positive("Settings saved", {
    actionLabel: "Undo",
  });
};
</script>

## Preview

<div class="spectrum-preview">
  <ToastContainer />
  <Button variant="primary" :onPress="showToast">Show toast</Button>
</div>

## Exports

- `ToastContainer`
- `ToastQueue`
- `clearToastQueue`

## Example

```ts
import { h } from "vue";
import { Button } from "@vue-spectrum/button";
import { ToastContainer, ToastQueue } from "@vue-spectrum/toast";

const component = h("div", null, [
  h(ToastContainer),
  h(
    Button,
    {
      onPress: () =>
        ToastQueue.positive("Saved successfully", {
          actionLabel: "Undo",
        }),
    },
    {
      default: () => "Show toast",
    }
  ),
]);
```

## Notes

- Baseline includes global queue helpers (`neutral`, `positive`, `negative`, `info`) and a single active container.
- Action button behavior, close-button behavior, timeout behavior, event interception, programmatic close behavior (via returned close callbacks from `ToastQueue.*`), focus restoration to the previously focused element after toast dismissal, and `F6` keyboard focus transfer into the toast region are covered by starter tests.
- Advanced icon assets, transition styling, and full focus-management parity remain in progress.
