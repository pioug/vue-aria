# @vue-spectrum/dialog

Vue port baseline of `@react-spectrum/dialog`.

<script setup lang="ts">
import { ActionButton, Dialog, DialogTrigger, Heading } from "@vue-spectrum/vue-spectrum";
</script>

## Preview

<div class="spectrum-preview">
  <DialogTrigger>
    <ActionButton>Open dialog</ActionButton>
    <Dialog isDismissable>
      <Heading level="3">Dialog title</Heading>
      <p>Dialogs display contextual content and actions.</p>
    </Dialog>
  </DialogTrigger>
</div>

## Exports

- `Dialog`
- `AlertDialog`
- `DialogTrigger`
- `DialogContainer`
- `useDialogContainer`

## Example

```ts
import { h } from "vue";
import { ActionButton } from "@vue-spectrum/button";
import { Dialog, DialogTrigger } from "@vue-spectrum/dialog";

const component = h(DialogTrigger, null, {
  default: () => [
    h(ActionButton, null, () => "Trigger"),
    h(Dialog, { isDismissable: true }, () => "Dialog content"),
  ],
});
```

## Notes

- Baseline includes modal/tray/popover trigger shells, dialog container management, and alert-dialog action flows.
- Baseline now includes mobile popover fallback parity in `DialogTrigger` (`type="popover"` renders as `modal` on mobile, with `mobileType="tray"` override support).
- Advanced overlay positioning and complete React Spectrum parity for dialog internals remain in progress.
