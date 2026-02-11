# @vue-spectrum/dialog

Vue port baseline of `@react-spectrum/dialog`.

<script setup lang="ts">
import { ActionButton, Dialog, DialogTrigger, Heading } from "@vue-spectrum/vue-spectrum";
</script>

## Preview

<div class="spectrum-preview">
  <div class="spectrum-preview-panel" style="display: flex; flex-wrap: wrap; gap: 0.6rem;">
    <DialogTrigger>
      <ActionButton>Open modal</ActionButton>
      <Dialog isDismissable>
        <Heading level="3">Modal dialog</Heading>
        <p>Dialogs display contextual content and actions.</p>
      </Dialog>
    </DialogTrigger>
    <DialogTrigger type="popover">
      <ActionButton>Open popover</ActionButton>
      <Dialog isDismissable>
        <Heading level="3">Popover dialog</Heading>
        <p>Popover dialogs anchor to a trigger.</p>
      </Dialog>
    </DialogTrigger>
    <DialogTrigger type="tray">
      <ActionButton>Open tray</ActionButton>
      <Dialog isDismissable>
        <Heading level="3">Tray dialog</Heading>
        <p>Tray overlays are optimized for constrained viewports.</p>
      </Dialog>
    </DialogTrigger>
  </div>
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
- Baseline now includes mobile popover fallback parity in `DialogTrigger` (`type="popover"` renders as `modal` on mobile, with `mobileType="tray"` override support) and matches upstream dismissability by forcing outside-click dismissal when that fallback resolves to `modal`.
- Baseline `DialogTrigger` dismissal behavior now covers outside-click gating parity across overlay modes (dismissable modal closes, non-dismissable modal stays open, popover/tray close on outside interaction) plus hidden dismiss-button close paths with focus restoration.
- Baseline `DialogTrigger` state parity now includes controlled/uncontrolled open flows (`isOpen`/`onOpenChange` and `defaultOpen`), keyboard-dismiss disabling (`isKeyboardDismissDisabled`), custom close-button wiring through injected close callbacks, and built-in `Dialog` dismiss-button close paths.
- Baseline `DialogTrigger` now includes focus-restore parity when closing by trigger-toggle, hidden dismiss button, `Escape`, and outside-dismiss flows (including `defaultOpen` mount cases).
- Baseline `DialogTrigger` now preserves nested popover interactivity by ignoring outside-dismiss logic for pointer events that originate inside another dialog overlay.
- Baseline modal focus containment now tracks and restores the last in-overlay focused control, including nested modal stacks where outside focus attempts should remain in the inner dialog.
- Baseline `DialogTrigger` and `DialogContainer` now include keyboard focus-containment loops (`Tab`/`Shift+Tab`) so focus stays trapped within the active dialog overlay.
- Baseline modal/tray overlays now set `aria-hidden="true"` on non-overlay body content while open, and restore original values on close.
- Baseline `DialogContainer` dismissal semantics now cover `Escape` handling, keyboard-dismiss disabling, and outside-click dismissal rules (`isDismissable` gated).
- Baseline `DialogTrigger` now matches upstream unmount safety behavior by warning in development when a non-popover dialog trigger unmounts while still open.
- Baseline `DialogTrigger` and `DialogContainer` now support custom portal container targeting via `container` across modal, tray, and popover overlays.
- Baseline `Dialog` label semantics now match explicit-prop precedence (`aria-labelledby` / `aria-label`) and automatically link `aria-labelledby` to the first heading when no explicit label props are supplied.
- Advanced overlay positioning and complete React Spectrum parity for dialog internals remain in progress.
