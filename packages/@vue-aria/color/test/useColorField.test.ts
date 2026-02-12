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
import {renderHook} from '@testing-library/react';
import {useColorField} from '../src/useColorField';
import type {ColorFieldState} from '@vue-stately/color';

vi.mock('@vue-aria/i18n', () => ({
  useLocalizedStringFormatter: () => ({
    format: (key: string) => key
  })
}));

vi.mock('@vue-aria/textfield', () => ({
  useFormattedTextField: (props: any) => {
    let labelProps = props.label
      ? {
          id: 'label-id',
          htmlFor: props.id
        }
      : {};

    return {
      labelProps,
      inputProps: {
        id: props.id,
        type: props.type,
        autoComplete: props.autoComplete,
        'aria-label': props['aria-label'],
        'aria-labelledby': props.label ? 'label-id' : undefined,
        'aria-required': props.isRequired ? true : undefined,
        'aria-invalid': props.isInvalid ? true : undefined,
        disabled: !!props.isDisabled,
        readOnly: !!props.isReadOnly,
        value: props.value
      },
      descriptionProps: {},
      errorMessageProps: {}
    };
  }
}));

vi.mock('@vue-aria/spinbutton', () => ({
  useSpinButton: (props: any) => ({
    spinButtonProps: {
      role: 'spinbutton',
      'aria-valuenow': props.value ?? undefined,
      'aria-valuetext': props.textValue,
      'aria-valuemin': props.minValue,
      'aria-valuemax': props.maxValue,
      'aria-required': props.isRequired || undefined,
      'aria-disabled': props.isDisabled || undefined,
      'aria-readonly': props.isReadOnly || undefined
    }
  })
}));

describe('useColorField', function () {
  let ref: React.RefObject<HTMLInputElement | null>;

  beforeEach(() => {
    ref = React.createRef<HTMLInputElement>();
    ref.current = document.createElement('input');
  });

  let createState = (overrides: Partial<ColorFieldState> = {}): ColorFieldState => ({
    validate: () => true,
    colorValue: null,
    defaultColorValue: null,
    setColorValue: vi.fn(),
    inputValue: '',
    setInputValue: vi.fn(),
    commit: vi.fn(),
    increment: vi.fn(),
    incrementToMax: vi.fn(),
    decrement: vi.fn(),
    decrementToMin: vi.fn(),
    realtimeValidation: {isInvalid: false, validationErrors: [], validationDetails: {}},
    displayValidation: {isInvalid: false, validationErrors: [], validationDetails: {}},
    updateValidation: vi.fn(),
    resetValidation: vi.fn(),
    commitValidation: vi.fn(),
    ...overrides
  });

  let renderColorFieldHook = (props: Record<string, unknown>, state: ColorFieldState = createState()) => {
    let {result} = renderHook(() => useColorField({
      'aria-label': 'Primary Color',
      ...props
    } as any, state, ref));
    return result.current;
  };

  it('handles defaults', function () {
    let {inputProps} = renderColorFieldHook({});
    expect(inputProps.type).toBe('text');
    expect(inputProps.autoComplete).toBe('off');
    expect(inputProps.autoCorrect).toBe('off');
    expect(inputProps.id).toBeTruthy();
    expect(inputProps.role).toBe('textbox');
    expect(inputProps['aria-valuenow']).toBeNull();
    expect(inputProps['aria-valuetext']).toBeNull();
    expect(inputProps['aria-valuemin']).toBeNull();
    expect(inputProps['aria-valuemax']).toBeNull();
    expect(inputProps['aria-required']).toBeUndefined();
    expect(inputProps['aria-disabled']).toBeUndefined();
    expect(inputProps['aria-readonly']).toBeUndefined();
    expect(inputProps['aria-invalid']).toBeUndefined();
    expect(inputProps.disabled).toBe(false);
    expect(inputProps.readOnly).toBe(false);
    expect(inputProps.spellCheck).toBe('false');
  });

  it('should return props for colorValue provided', function () {
    let colorValue = {
      toHexInt: () => 0xFF88A0,
      toString: () => '#FF88A0'
    };
    let {inputProps} = renderColorFieldHook({}, createState({
      colorValue: colorValue as any,
      inputValue: '#FF88A0'
    }));
    expect(inputProps['aria-valuenow']).toBeNull();
    expect(inputProps['aria-valuetext']).toBeNull();
    expect(inputProps.value).toBe('#FF88A0');
  });

  it('should return props for label', function () {
    let {labelProps, inputProps} = renderColorFieldHook({
      'aria-label': undefined,
      label: 'Secondary Color'
    });
    expect(labelProps.id).toBeTruthy();
    expect(labelProps.htmlFor).toBe(inputProps.id);
    expect(inputProps.id).toBeTruthy();
    expect(inputProps['aria-labelledby']).toBe(labelProps.id);
    expect(inputProps['aria-label']).toBeUndefined();
  });

  it('should return prop for invalid', function () {
    let {inputProps} = renderColorFieldHook({isInvalid: true});
    expect(inputProps['aria-invalid']).toBe(true);
  });

  it('should return prop for required', function () {
    let {inputProps} = renderColorFieldHook({isRequired: true});
    expect(inputProps['aria-required']).toBe(true);
  });

  it('should return prop for readonly', function () {
    let {inputProps} = renderColorFieldHook({isReadOnly: true});
    expect(inputProps['aria-readonly']).toBe(true);
    expect(inputProps.readOnly).toBe(true);
  });

  it('should return prop for disabled', function () {
    let {inputProps} = renderColorFieldHook({isDisabled: true});
    expect(inputProps['aria-disabled']).toBe(true);
    expect(inputProps.disabled).toBe(true);
  });
});
