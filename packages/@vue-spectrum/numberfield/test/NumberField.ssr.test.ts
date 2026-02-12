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
import {renderToString} from 'react-dom/server';

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

vi.mock('@vue-spectrum/label', () => ({
  Field: ({children}: {children: React.ReactNode}) => children
}));

vi.mock('@vue-spectrum/textfield', async () => {
  let React = await vi.importActual<typeof import('react')>('react');
  return {
    TextFieldBase: (props: any) => React.createElement('input', props.inputProps)
  };
});

describe('NumberField SSR', () => {
  it('should render without errors', () => {
    expect(() => {
      renderToString(
        React.createElement(NumberField, {'aria-label': 'number'})
      );
    }).not.toThrow();
  });
});
