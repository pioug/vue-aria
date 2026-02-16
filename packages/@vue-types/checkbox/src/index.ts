import type { VNodeChild } from "vue";

import type {
  AriaLabelingProps,
  AriaValidationProps,
  DOMProps,
  FocusableDOMProps,
  FocusableProps,
  HelpTextProps,
  InputBase,
  InputDOMProps,
  LabelableProps,
  Orientation,
  PressEvents,
  SpectrumHelpTextProps,
  SpectrumLabelableProps,
  StyleProps,
  Validation,
  ValueBase
} from "@vue-types/shared";

interface ToggleStateOptions extends InputBase {
  /**
   * Whether the element should be selected (uncontrolled).
   */
  defaultSelected?: boolean,
  /**
   * Whether the element should be selected (controlled).
   */
  isSelected?: boolean,
  /**
   * Handler that is called when the element's selection state changes.
   */
  onChange?: (isSelected: boolean) => void
}

export interface ToggleProps extends ToggleStateOptions, Validation<boolean>, FocusableProps {
  /**
   * The label for the element.
   */
  children?: VNodeChild,
  /**
   * The value of the input element, used when submitting an HTML form.
   */
  value?: string
}

export interface AriaToggleProps extends ToggleProps, FocusableDOMProps, AriaLabelingProps, AriaValidationProps, InputDOMProps, PressEvents {
  /**
   * Identifies the element (or elements) whose contents or presence are controlled by the current element.
   */
  "aria-controls"?: string
}

export interface CheckboxGroupProps extends ValueBase<string[]>, Pick<InputDOMProps, "name">, InputBase, LabelableProps, HelpTextProps, Validation<string[]> {}

export interface CheckboxProps extends ToggleProps {
  /**
   * Indeterminism is presentational only.
   * The indeterminate visual representation remains regardless of user interaction.
   */
  isIndeterminate?: boolean
}

export interface AriaCheckboxProps extends CheckboxProps, InputDOMProps, AriaToggleProps {}

export interface AriaCheckboxGroupProps extends CheckboxGroupProps, InputDOMProps, DOMProps, AriaLabelingProps, AriaValidationProps, FocusableProps {}

export interface AriaCheckboxGroupItemProps extends Omit<AriaCheckboxProps, "isSelected" | "defaultSelected"> {
  value: string
}

export interface SpectrumCheckboxProps extends Omit<AriaCheckboxProps, "onClick">, StyleProps {
  /**
   * This prop sets the emphasized style which provides visual prominence.
   */
  isEmphasized?: boolean,
  slot?: string | null
}

export interface SpectrumCheckboxGroupProps extends AriaCheckboxGroupProps, SpectrumLabelableProps, Validation<string[]>, StyleProps, SpectrumHelpTextProps {
  /**
   * The Checkboxes contained within the CheckboxGroup.
   */
  children: VNodeChild,
  /**
   * The axis the checkboxes should align with.
   * @default 'vertical'
   */
  orientation?: Orientation,
  /**
   * By default, checkboxes are not emphasized (gray).
   * The emphasized (blue) version provides visual prominence.
   */
  isEmphasized?: boolean
}
