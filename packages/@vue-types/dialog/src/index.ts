import type { VNodeChild } from "vue";

import type { AriaLabelingProps, DOMProps, RefObject, StyleProps } from "@vue-types/shared";
import type { OverlayTriggerProps, PositionProps } from "@vue-types/overlays";

export type SpectrumDialogClose = (close: () => void) => VNodeChild;

export interface SpectrumDialogTriggerProps extends OverlayTriggerProps, PositionProps {
  children: [VNodeChild, SpectrumDialogClose | VNodeChild];
  type?: "modal" | "popover" | "tray" | "fullscreen" | "fullscreenTakeover";
  mobileType?: "modal" | "tray" | "fullscreen" | "fullscreenTakeover";
  hideArrow?: boolean;
  targetRef?: RefObject<HTMLElement | null>;
  isDismissable?: boolean;
  isKeyboardDismissDisabled?: boolean;
}

export interface SpectrumDialogContainerProps {
  children: VNodeChild;
  onDismiss: () => void;
  type?: "modal" | "fullscreen" | "fullscreenTakeover";
  isDismissable?: boolean;
  isKeyboardDismissDisabled?: boolean;
}

export interface AriaDialogProps extends DOMProps, AriaLabelingProps {
  role?: "dialog" | "alertdialog";
}

export interface SpectrumDialogProps extends AriaDialogProps, StyleProps {
  children: VNodeChild;
  size?: "S" | "M" | "L";
  isDismissable?: boolean;
  onDismiss?: () => void;
}

export interface SpectrumAlertDialogProps extends DOMProps, StyleProps {
  variant?: "confirmation" | "information" | "destructive" | "error" | "warning";
  title: string;
  children: VNodeChild;
  cancelLabel?: string;
  primaryActionLabel: string;
  secondaryActionLabel?: string;
  isPrimaryActionDisabled?: boolean;
  isSecondaryActionDisabled?: boolean;
  onCancel?: () => void;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
  autoFocusButton?: "cancel" | "primary" | "secondary";
}
