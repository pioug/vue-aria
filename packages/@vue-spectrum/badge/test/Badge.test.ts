/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import CheckmarkCircle from '@spectrum-icons/workflow/CheckmarkCircle';
import {Badge} from '../src';
import React from 'react';
import {render, screen, within} from '@testing-library/react';
import {Text} from '@vue-spectrum/text';

vi.mock('@vue-spectrum/provider', () => ({
  useProviderProps: <T,>(props: T) => props
}));

vi.mock('@vue-spectrum/text', () => ({
  Text: ({children, ...props}: {children?: React.ReactNode}) => React.createElement('span', props, children)
}));

vi.mock('@vue-aria/i18n', () => ({
  useLocale: () => ({
    locale: 'en-US',
    direction: 'ltr'
  })
}));

describe('Badge', () => {
  it('renders text-only content', () => {
    render(
      React.createElement(
        Badge,
        {'data-testid': 'badge'},
        'Badge of honor'
      )
    );

    let badge = screen.getByTestId('badge');
    expect(within(badge).getByText('Badge of honor')).toBeTruthy();
  });

  it('renders icon-only content', () => {
    render(
      React.createElement(
        Badge,
        {'data-testid': 'badge'},
        React.createElement(CheckmarkCircle, null)
      )
    );

    let badge = screen.getByTestId('badge');
    expect(within(badge).getByRole('img', {hidden: true})).toBeTruthy();
  });

  it('renders icon and text content together', () => {
    render(
      React.createElement(
        Badge,
        {'data-testid': 'badge'},
        React.createElement(CheckmarkCircle, null),
        React.createElement(Text, null, 'Badge of honor')
      )
    );

    let badge = screen.getByTestId('badge');
    expect(within(badge).getByRole('img', {hidden: true})).toBeTruthy();
    expect(within(badge).getByText('Badge of honor')).toBeTruthy();
  });

  it('forwards ref', () => {
    let ref = React.createRef<{UNSAFE_getDOMNode(): HTMLElement | null}>();

    render(
      React.createElement(
        Badge,
        {
          ref,
          'data-testid': 'badge'
        },
        'Badge of honor'
      )
    );

    let badge = screen.getByTestId('badge');
    expect(ref.current?.UNSAFE_getDOMNode()).toBe(badge);
  });
});
