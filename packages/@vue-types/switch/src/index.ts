import type { VNodeChild } from "vue";

import type { AriaLabelingProps, FocusableDOMProps, FocusableProps, InputBase, InputDOMProps, StyleProps } from "@vue-types/shared";

interface SwitchBase extends InputBase, FocusableProps {
  children?: VNodeChild;
  defaultSelected?: boolean;
  isSelected?: boolean;
  onChange?: (isSelected: boolean) => void;
  value?: string;
}

export interface SwitchProps extends SwitchBase {}

export interface AriaSwitchBase extends SwitchBase, FocusableDOMProps, InputDOMProps, AriaLabelingProps {
  "aria-controls"?: string;
}

export interface AriaSwitchProps extends SwitchProps, AriaSwitchBase {}

export interface SpectrumSwitchProps extends AriaSwitchProps, StyleProps {
  isEmphasized?: boolean;
}
