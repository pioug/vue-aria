import type { PropType, VNode } from "vue";
import {
  textFieldBasePropOptions,
  type SpectrumTextFieldBaseProps,
} from "@vue-spectrum/textfield";

export interface SpectrumSearchFieldProps extends SpectrumTextFieldBaseProps {
  icon?: VNode | "" | null | undefined;
  excludeFromTabOrder?: boolean | undefined;
  onSubmit?: ((value: string) => void) | undefined;
  onClear?: (() => void) | undefined;
}

export const searchFieldPropOptions = {
  ...textFieldBasePropOptions,
  icon: {
    type: null as unknown as PropType<VNode | "" | null | undefined>,
    default: undefined,
  },
  excludeFromTabOrder: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined,
  },
  onSubmit: {
    type: Function as PropType<((value: string) => void) | undefined>,
    default: undefined,
  },
  onClear: {
    type: Function as PropType<(() => void) | undefined>,
    default: undefined,
  },
} as const;
