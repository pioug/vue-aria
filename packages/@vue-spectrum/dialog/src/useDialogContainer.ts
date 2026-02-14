import { inject } from "vue";
import { DialogContext, type DialogContextValue } from "./context";

export interface DialogContainerValue {
  type: DialogContextValue["type"];
  dismiss(): void;
}

export function useDialogContainer(): DialogContainerValue {
  const context = inject(DialogContext, null);
  if (!context) {
    throw new Error("Cannot call useDialogContext outside a <DialogTrigger> or <DialogContainer>.");
  }

  return {
    type: context.value?.type,
    dismiss() {
      context.value?.onClose?.();
    },
  };
}
