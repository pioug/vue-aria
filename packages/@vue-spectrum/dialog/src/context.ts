import { inject, provide } from "vue";

export type DialogType =
  | "modal"
  | "popover"
  | "tray"
  | "fullscreen"
  | "fullscreenTakeover";

export interface DialogContextValue {
  type: DialogType;
  onClose?: (() => void) | undefined;
  isDismissable?: boolean | undefined;
}

const DIALOG_CONTEXT_SYMBOL: unique symbol = Symbol("vue-spectrum-dialog-context");

export function provideDialogContext(value: DialogContextValue): void {
  provide(DIALOG_CONTEXT_SYMBOL, value);
}

export function useDialogContext(): DialogContextValue | null {
  return inject<DialogContextValue | null>(DIALOG_CONTEXT_SYMBOL, null);
}
