import type { InjectionKey, Ref } from "vue";

export interface DialogContextValue {
  type?: "modal" | "popover" | "tray" | "fullscreen" | "fullscreenTakeover";
  onClose?: () => void;
  isDismissable?: boolean;
  isKeyboardDismissDisabled?: boolean;
  role?: "dialog" | "alertdialog";
  "aria-label"?: string;
  "aria-labelledby"?: string;
}

export const DialogContext: InjectionKey<Ref<DialogContextValue | null>> = Symbol("SpectrumDialogContext");

export const DialogTitlePropsContext: InjectionKey<Ref<Record<string, unknown> | null>> = Symbol("SpectrumDialogTitlePropsContext");

export const DialogFooterContext: InjectionKey<Ref<boolean>> = Symbol("SpectrumDialogFooterContext");

export interface DialogHeaderContextValue {
  inHeader: boolean;
  hasTypeIcon: boolean;
}

export const DialogHeaderContext: InjectionKey<Ref<DialogHeaderContextValue | null>> = Symbol("SpectrumDialogHeaderContext");
