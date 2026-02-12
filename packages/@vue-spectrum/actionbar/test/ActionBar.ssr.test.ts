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

import {ActionBar} from '../src';
import React from 'react';
import {renderToString} from 'react-dom/server';

vi.mock('@vue-spectrum/provider', () => ({
  useProviderProps: <T,>(props: T) => props
}));

vi.mock('@vue-aria/i18n', () => ({
  useLocale: () => ({
    locale: 'en-US',
    direction: 'ltr'
  }),
  useLocalizedStringFormatter: () => ({
    format: (key: string) => {
      if (key === 'actions') {
        return 'Actions';
      }

      if (key === 'clearSelection') {
        return 'Clear selection';
      }

      if (key === 'selected') {
        return '1 selected';
      }

      return key;
    }
  })
}));

vi.mock('@vue-spectrum/overlays', () => ({
  OpenTransition: ({children}: {children: React.ReactNode}) => React.createElement(React.Fragment, null, children)
}));

vi.mock('@vue-aria/focus', () => ({
  FocusScope: ({children}: {children: React.ReactNode}) => React.createElement(React.Fragment, null, children)
}));

vi.mock('@vue-spectrum/text', () => ({
  Text: ({children, UNSAFE_className, className, ...props}: any) => React.createElement(
    'span',
    {
      ...props,
      className: [className, UNSAFE_className].filter(Boolean).join(' ')
    },
    children
  )
}));

vi.mock('@vue-spectrum/button', () => ({
  ActionButton: ({children, UNSAFE_className, className, gridArea, isQuiet, staticColor, ...props}: any) => React.createElement(
    'button',
    {
      ...props,
      className: [className, UNSAFE_className].filter(Boolean).join(' ')
    },
    children
  )
}));

vi.mock('@vue-spectrum/actiongroup', () => ({
  ActionGroup: ({items = [], ...props}: any) => React.createElement(
    'div',
    {
      role: 'toolbar',
      'aria-label': props['aria-label']
    },
    items.map((item: {key: string; name?: string}) => React.createElement('button', {key: item.key}, item.name ?? item.key))
  )
}));

vi.mock('@vue-aria/live-announcer', () => ({
  announce: vi.fn()
}));

describe('ActionBar SSR', () => {
  it('renders without errors', () => {
    expect(() => {
      renderToString(
        React.createElement(ActionBar, {
          selectedItemCount: 1,
          items: [{key: 'edit', name: 'Edit'}],
          onClearSelection: () => {}
        })
      );
    }).not.toThrow();
  });
});
