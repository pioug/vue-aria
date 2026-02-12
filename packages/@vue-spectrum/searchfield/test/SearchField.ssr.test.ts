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

import {SearchField} from '../src';
import React from 'react';
import {renderToString} from 'react-dom/server';

vi.mock('@vue-spectrum/provider', () => ({
  useProviderProps: <T,>(props: T) => props
}));

vi.mock('@vue-spectrum/form', () => ({
  useFormProps: <T,>(props: T) => props
}));

vi.mock('@vue-spectrum/text', () => ({
  Heading: ({children, ...props}: any) => React.createElement('h3', props, children),
  Text: ({children, ...props}: any) => React.createElement('span', props, children)
}));

vi.mock('@vue-aria/i18n', () => ({
  useLocale: () => ({
    locale: 'en-US',
    direction: 'ltr'
  }),
  useLocalizedStringFormatter: () => ({
    format: (value: string) => value
  })
}));

vi.mock('@vue-spectrum/textfield', () => ({
  TextFieldBase: (props: any) => {
    let {
      inputProps = {},
      inputRef,
      wrapperChildren,
      icon,
      description,
      descriptionProps = {},
      errorMessage,
      errorMessageProps = {},
      validationState
    } = props;

    return React.createElement(
      'div',
      null,
      icon,
      React.createElement('input', {
        ...inputProps,
        'data-testid': props['data-testid'],
        'aria-label': props['aria-label'],
        ref: inputRef
      }),
      wrapperChildren,
      description ? React.createElement('div', descriptionProps, description) : null,
      validationState === 'invalid' && errorMessage ? React.createElement('div', errorMessageProps, errorMessage) : null
    );
  }
}));

describe('SearchField SSR', () => {
  it('should render without errors', () => {
    expect(() => {
      renderToString(
        React.createElement(SearchField, {label: 'search'})
      );
    }).not.toThrow();
  });
});
