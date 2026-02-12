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

import {NumberField} from '../src';
import React from 'react';
import {render, screen} from '@testing-library/react';

vi.mock('@vue-spectrum/provider', () => ({
  useProviderProps: <T,>(props: T) => props,
  useProvider: () => ({
    scale: 'medium'
  })
}));

vi.mock('@vue-spectrum/form', () => ({
  useFormProps: <T,>(props: T) => props
}));

vi.mock('@vue-aria/i18n', () => ({
  useLocale: () => ({
    locale: 'en-US',
    direction: 'ltr'
  }),
  useNumberFormatter: (options: Record<string, any> = {}) => ({
    format: (value: number) => String(value),
    formatRange: (start: number, end: number) => `${start}-${end}`,
    resolvedOptions: () => ({
      maximumFractionDigits: options.maximumFractionDigits ?? 0
    })
  }),
  useLocalizedStringFormatter: () => ({
    format: (value: string) => value
  })
}));

vi.mock('@vue-spectrum/label', async () => {
  let React = await vi.importActual<typeof import('react')>('react');

  return {
    Field: React.forwardRef(function Field(props: any, ref: any) {
      let {
        label,
        children,
        wrapperProps = {},
        wrapperClassName,
        elementType = 'div'
      } = props;
      let Element = elementType;
      return React.createElement(
        Element,
        {
          ...wrapperProps,
          className: wrapperClassName,
          ref
        },
        label ? React.createElement('span', null, label) : null,
        children
      );
    })
  };
});

vi.mock('@vue-spectrum/textfield', async () => {
  let React = await vi.importActual<typeof import('react')>('react');

  return {
    TextFieldBase: (props: any) => {
      let {
        inputProps = {},
        inputRef,
        inputClassName,
        UNSAFE_className
      } = props;

      return React.createElement(
        'div',
        {
          className: UNSAFE_className
        },
        React.createElement('input', {
          ...inputProps,
          className: inputClassName,
          ref: inputRef
        })
      );
    }
  };
});

function renderNumberField(props: Record<string, unknown> = {}) {
  return render(
    React.createElement(NumberField, {
      'aria-label': 'labelled',
      ...props
    })
  );
}

describe('NumberField', () => {
  it('has correct roles and stepper buttons by default', () => {
    renderNumberField();

    let group = screen.getByRole('group');
    let textbox = screen.getByRole('textbox');
    let buttons = screen.getAllByRole('button');

    expect(group).toBeTruthy();
    expect(textbox.getAttribute('type')).toBe('text');
    expect(textbox.getAttribute('inputmode')).toBe('numeric');
    expect(buttons.length).toBe(2);
  });

  it('can hide stepper buttons', () => {
    renderNumberField({hideStepper: true});
    expect(screen.queryAllByRole('button').length).toBe(0);
  });

  it('supports disabled state', () => {
    renderNumberField({isDisabled: true});
    let textbox = screen.getByRole('textbox');
    expect(textbox.hasAttribute('disabled')).toBe(true);
  });
});
