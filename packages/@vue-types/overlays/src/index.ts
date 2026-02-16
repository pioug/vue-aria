import type { RefObject, StyleProps } from "@vue-types/shared";
import type { VNodeChild } from "vue";

export type Placement = "bottom" | "bottom left" | "bottom right" | "bottom start" | "bottom end" |
  "top" | "top left" | "top right" | "top start" | "top end" |
  "left" | "left top" | "left bottom" | "start" | "start top" | "start bottom" |
  "right" | "right top" | "right bottom" | "end" | "end top" | "end bottom";

export type Axis = "top" | "bottom" | "left" | "right";
export type SizeAxis = "width" | "height";
export type PlacementAxis = Axis | "center";

export interface PositionProps {
  placement?: Placement;
  containerPadding?: number;
  offset?: number;
  crossOffset?: number;
  shouldFlip?: boolean;
  isOpen?: boolean;
}

export interface OverlayProps {
  children: VNodeChild;
  isOpen?: boolean;
  container?: HTMLElement;
  isKeyboardDismissDisabled?: boolean;
  onEnter?: () => void;
  onEntering?: () => void;
  onEntered?: () => void;
  onExit?: () => void;
  onExiting?: () => void;
  onExited?: () => void;
  nodeRef: RefObject<HTMLElement | null>;
  disableFocusManagement?: boolean;
  shouldContainFocus?: boolean;
}

export interface ModalProps extends StyleProps, Omit<OverlayProps, "nodeRef"> {
  children: VNodeChild;
  onClose?: () => void;
  type?: "modal" | "fullscreen" | "fullscreenTakeover";
  isDismissable?: boolean;
}

export interface PopoverProps extends StyleProps, Omit<OverlayProps, "nodeRef"> {
  children: VNodeChild;
  placement?: PlacementAxis;
  arrowProps?: Record<string, unknown>;
  hideArrow?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  shouldCloseOnBlur?: boolean;
  isNonModal?: boolean;
  isDismissable?: boolean;
}

export interface TrayProps extends StyleProps, Omit<OverlayProps, "nodeRef"> {
  children: VNodeChild;
  isOpen?: boolean;
  onClose?: () => void;
  shouldCloseOnBlur?: boolean;
  isFixedHeight?: boolean;
  isNonModal?: boolean;
}

export interface OverlayTriggerProps {
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}
