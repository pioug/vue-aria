import { useDialogContext, type DialogType } from "./context";

export interface DialogContainerValue {
  type: DialogType;
  dismiss: () => void;
}

export function useDialogContainer(): DialogContainerValue {
  const context = useDialogContext();
  if (!context) {
    throw new Error(
      "Cannot call useDialogContainer outside a <DialogTrigger> or <DialogContainer>."
    );
  }

  return {
    type: context.type,
    dismiss() {
      context.onClose?.();
    },
  };
}
