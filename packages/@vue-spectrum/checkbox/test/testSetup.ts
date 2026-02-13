/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import React from 'react';

function classNames(...values: Array<unknown>) {
  let classes: string[] = [];

  for (let value of values) {
    if (!value) {
      continue;
    }

    if (typeof value === 'string') {
      classes.push(value);
      continue;
    }

    if (typeof value === 'object') {
      for (let [key, enabled] of Object.entries(value)) {
        if (enabled) {
          classes.push(key);
        }
      }
    }
  }

  return classes.join(' ');
}

vi.mock('react-aria-components', () => ({
  CheckboxContext: React.createContext({}),
  useContextProps: (props: Record<string, unknown>, ref: unknown) => [props, ref]
}));

vi.mock('@vue-spectrum/utils', () => ({
  classNames,
  useFocusableRef: (_ref: unknown, focusableRef: unknown) => focusableRef,
  useDOMRef: (ref: unknown) => ref,
  useStyleProps: (props: Record<string, unknown> = {}) => ({
    styleProps: {
      className: typeof props.UNSAFE_className === 'string' ? props.UNSAFE_className : undefined,
      'data-testid': props['data-testid']
    }
  })
}));

vi.mock('@vue-aria/focus', () => ({
  FocusRing: ({children}: {children?: React.ReactNode}) => children
}));

vi.mock('@vue-spectrum/form', () => ({
  useFormProps: (props: unknown) => props
}));

vi.mock('@vue-aria/interactions', () => ({
  useHover: () => ({
    hoverProps: {},
    isHovered: false
  })
}));

vi.mock('@vue-spectrum/provider', () => ({
  Provider: ({children}: {children?: React.ReactNode}) => children,
  useProviderProps: (props: unknown) => props
}));

vi.mock('@vue-stately/toggle', () => ({
  useToggleState: () => ({})
}));

vi.mock('@vue-stately/checkbox', () => ({
  useCheckboxGroupState: (props: Record<string, unknown>) => {
    let isControlled = Array.isArray(props.value);
    let [internalSelectedValues, setInternalSelectedValues] = React.useState(
      new Set<string>((props.defaultValue as string[] | undefined) ?? [])
    );

    let selectedValues = isControlled
      ? new Set<string>((props.value as string[]) ?? [])
      : internalSelectedValues;

    let setSelectedValues = (nextSelectedValues: Set<string>) => {
      if (!isControlled) {
        setInternalSelectedValues(new Set(nextSelectedValues));
      }

      let onChange = props.onChange;
      if (typeof onChange === 'function') {
        onChange(Array.from(nextSelectedValues));
      }
    };

    return {
      isDisabled: Boolean(props.isDisabled),
      isReadOnly: Boolean(props.isReadOnly),
      name: props.name,
      selectedValues,
      setSelectedValues
    };
  }
}));

vi.mock('@vue-aria/checkbox', () => ({
  useCheckbox: (props: Record<string, unknown>) => {
    let isControlled = props.isSelected !== undefined;
    let [internalSelected, setInternalSelected] = React.useState(Boolean(props.defaultSelected));
    let checked = isControlled ? Boolean(props.isSelected) : internalSelected;
    let isDisabled = Boolean(props.isDisabled);
    let isReadOnly = Boolean(props.isReadOnly);

    return {
      inputProps: {
        type: 'checkbox',
        value: props.value ?? 'on',
        checked,
        disabled: isDisabled || undefined,
        tabIndex: props.excludeFromTabOrder ? -1 : undefined,
        'aria-label': props['aria-label'],
        'aria-labelledby': props['aria-labelledby'],
        'aria-describedby': props['aria-describedby'],
        'aria-errormessage': props['aria-errormessage'],
        'aria-invalid': props.isInvalid ? 'true' : undefined,
        'aria-readonly': isReadOnly ? 'true' : undefined,
        onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
          if (isDisabled || isReadOnly) {
            return;
          }

          let nextValue = event.target.checked;
          if (!isControlled) {
            setInternalSelected(nextValue);
          }

          let onChange = props.onChange;
          if (typeof onChange === 'function') {
            onChange(nextValue);
          }
        }
      },
      isInvalid: Boolean(props.isInvalid),
      isDisabled
    };
  },
  useCheckboxGroup: (props: Record<string, unknown>) => ({
    groupProps: {
      role: 'group',
      'aria-label': props['aria-label'],
      'aria-disabled': props.isDisabled ? 'true' : undefined,
      'data-testid': props['data-testid']
    }
  }),
  useCheckboxGroupItem: (
    props: Record<string, unknown>,
    state: {
      isDisabled: boolean,
      isReadOnly: boolean,
      name?: string,
      selectedValues: Set<string>,
      setSelectedValues: (nextSelectedValues: Set<string>) => void
    }
  ) => {
    let value = String(props.value ?? 'on');
    let isDisabled = state.isDisabled || Boolean(props.isDisabled);
    let isReadOnly = state.isReadOnly || Boolean(props.isReadOnly);
    let checked = state.selectedValues.has(value);

    return {
      inputProps: {
        type: 'checkbox',
        name: state.name,
        value,
        checked,
        disabled: isDisabled || undefined,
        'aria-readonly': isReadOnly ? 'true' : undefined,
        onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
          if (isDisabled || isReadOnly) {
            return;
          }

          let nextSelectedValues = new Set(state.selectedValues);
          if (event.target.checked) {
            nextSelectedValues.add(value);
          } else {
            nextSelectedValues.delete(value);
          }

          state.setSelectedValues(nextSelectedValues);
        }
      },
      isInvalid: false,
      isDisabled
    };
  }
}));

vi.mock('@vue-spectrum/label', () => ({
  Field: React.forwardRef(function MockField(
    props: {
      children?: React.ReactNode,
      label?: React.ReactNode
    } & Record<string, unknown>,
    ref: React.ForwardedRef<HTMLSpanElement>
  ) {
    let {
      children,
      label,
      wrapperClassName: _wrapperClassName,
      elementType: _elementType,
      includeNecessityIndicatorInAccessibilityName: _includeNecessityIndicatorInAccessibilityName,
      isDisabled: _isDisabled,
      isEmphasized: _isEmphasized,
      orientation: _orientation,
      ...domProps
    } = props;

    return React.createElement(
      'span',
      {
        ...domProps,
        ref
      },
      label ? React.createElement('span', null, label) : null,
      children
    );
  })
}));

vi.mock('@spectrum-icons/ui/CheckmarkSmall', () => ({
  default: () => React.createElement('span', {'aria-hidden': true})
}));

vi.mock('@spectrum-icons/ui/DashSmall', () => ({
  default: () => React.createElement('span', {'aria-hidden': true})
}));
