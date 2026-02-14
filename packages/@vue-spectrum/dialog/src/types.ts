import type { AriaDialogProps } from "@vue-aria/dialog";

export type SpectrumDialogType = "modal" | "popover" | "tray" | "fullscreen" | "fullscreenTakeover";
export type SpectrumDialogSize = "S" | "M" | "L" | "fullscreen" | "fullscreenTakeover";

export interface SpectrumDialogProps extends AriaDialogProps {
  type?: SpectrumDialogType;
  size?: SpectrumDialogSize;
  isDismissable?: boolean;
  onDismiss?: () => void;
  UNSAFE_className?: string;
  UNSAFE_style?: Record<string, unknown>;
}
