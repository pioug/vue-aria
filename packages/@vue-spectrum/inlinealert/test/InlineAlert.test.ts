/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {InlineAlert} from '../src';
import React from 'react';
import {render, screen} from '@testing-library/react';

vi.mock('@vue-spectrum/provider', () => ({
  useProviderProps: <T,>(props: T) => props
}));

vi.mock('@vue-aria/i18n', () => ({
  useLocale: () => ({
    locale: 'en-US',
    direction: 'ltr'
  }),
  useLocalizedStringFormatter: () => ({
    format: (key: string) => key
  })
}));

describe('InlineAlert', () => {
  it('renders an alert role', () => {
    render(
      React.createElement(
        InlineAlert,
        null,
        React.createElement('h3', null, 'Title'),
        React.createElement('div', null, 'Content')
      )
    );

    expect(screen.getByRole('alert')).toBeTruthy();
  });

  it('applies variant classes', () => {
    let {rerender} = render(
      React.createElement(
        InlineAlert,
        {variant: 'neutral', 'data-testid': 'alert'},
        React.createElement('h3', null, 'Title')
      )
    );
    expect(screen.getByTestId('alert').className.includes('spectrum-InLineAlert--neutral')).toBe(true);

    rerender(
      React.createElement(
        InlineAlert,
        {variant: 'negative', 'data-testid': 'alert'},
        React.createElement('h3', null, 'Title')
      )
    );
    expect(screen.getByTestId('alert').className.includes('spectrum-InLineAlert--negative')).toBe(true);
  });

  it('supports autoFocus', () => {
    render(
      React.createElement(
        InlineAlert,
        {autoFocus: true},
        React.createElement('h3', null, 'Title')
      )
    );

    let alert = screen.getByRole('alert');
    expect(alert.getAttribute('tabindex')).toBe('-1');
    expect(document.activeElement).toBe(alert);
  });
});
