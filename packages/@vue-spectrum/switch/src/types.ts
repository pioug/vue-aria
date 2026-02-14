import type { AriaToggleProps } from "@vue-aria/toggle";

export interface SpectrumSwitchProps extends AriaToggleProps {
  isSelected?: boolean;
  defaultSelected?: boolean;
  isEmphasized?: boolean;
  autoFocus?: boolean;
  excludeFromTabOrder?: boolean;
  onChange?: (isSelected: boolean) => void;
  UNSAFE_className?: string;
  UNSAFE_style?: Record<string, unknown>;
}
