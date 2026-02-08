# @vue-aria/dialog

Dialog semantics and focus behavior.

## `useDialog`

Provides role, labeling attributes, and mount-time focus behavior for dialog
containers.

```ts
import { useDialog } from "@vue-aria/dialog";

const { dialogProps, titleProps } = useDialog(
  {
    role: "dialog",
  },
  dialogElement
);
```
