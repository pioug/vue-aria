/*
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {ContextualHelp} from '../src';
import React from 'react';
import {render, screen} from '@testing-library/react';

vi.mock('@vue-spectrum/button', () => ({
  ActionButton: ({UNSAFE_className, children, isDisabled, isQuiet, ...props}: any) => React.createElement('button', {className: UNSAFE_className, ...props}, children)
}));

vi.mock('@vue-spectrum/dialog', () => ({
  Dialog: ({children, UNSAFE_className, ...props}: any) => React.createElement('div', {...props, className: UNSAFE_className}, children),
  DialogTrigger: ({children}: {children: React.ReactNode}) => React.createElement(React.Fragment, null, children)
}));

vi.mock('@vue-spectrum/provider', () => ({
  Provider: ({children}: {children: React.ReactNode}) => React.createElement(React.Fragment, null, children),
  useProviderProps: <T,>(props: T) => props
}));

vi.mock('@vue-aria/i18n', () => ({
  useLocale: () => ({
    locale: 'en-US',
    direction: 'ltr'
  }),
  useLocalizedStringFormatter: () => ({
    format: (key: string) => {
      if (key === 'info') {
        return 'Information';
      }

      return 'Help';
    }
  })
}));

describe('ContextualHelp', () => {
  it('includes a default aria-label', () => {
    render(
      React.createElement(
        ContextualHelp,
        null,
        React.createElement('h3', null, 'Test title')
      )
    );

    expect(screen.getByRole('button').getAttribute('aria-label')).toBe('Help');
  });

  it('includes a default aria-label for info variant', () => {
    render(
      React.createElement(
        ContextualHelp,
        {variant: 'info'},
        React.createElement('h3', null, 'Test title')
      )
    );

    expect(screen.getByRole('button').getAttribute('aria-label')).toBe('Information');
  });
});
