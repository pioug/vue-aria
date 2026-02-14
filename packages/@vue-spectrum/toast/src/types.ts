import type { AriaToastRegionProps } from "@vue-aria/toast";
import type { QueuedToast, ToastOptions, ToastState } from "@vue-aria/toast-state";

export type ToastPlacement = "top" | "top end" | "bottom" | "bottom end";
export type ToastVariant = "positive" | "negative" | "info" | "neutral";

export interface SpectrumToastValue {
  children: string;
  variant: ToastVariant;
  actionLabel?: string;
  onAction?: () => void;
  shouldCloseOnAction?: boolean;
  [key: string]: unknown;
}

export interface SpectrumToastProps {
  toast: QueuedToast<SpectrumToastValue>;
  state: ToastState<SpectrumToastValue>;
  UNSAFE_className?: string;
  UNSAFE_style?: Record<string, unknown>;
}

export interface SpectrumToastContainerProps extends AriaToastRegionProps {
  placement?: ToastPlacement;
}

export interface SpectrumToastOptions extends ToastOptions {
  actionLabel?: string;
  onAction?: () => void;
  shouldCloseOnAction?: boolean;
  [key: string]: unknown;
}
