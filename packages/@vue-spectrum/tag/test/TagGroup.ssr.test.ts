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
import {renderToString} from 'react-dom/server';

vi.mock('@vue-spectrum/provider', () => ({
  Provider: ({children}: {children?: React.ReactNode}) => children,
  useProviderProps: <T,>(props: T) => props,
  useProvider: () => ({
    scale: 'medium'
  })
}));

vi.mock('@vue-aria/i18n', async () => {
  let actual = await vi.importActual<typeof import('@vue-aria/i18n')>('@vue-aria/i18n');
  return {
    ...actual,
    useLocale: () => ({
      locale: 'en-US',
      direction: 'ltr'
    }),
    useLocalizedStringFormatter: () => ({
      format: (key: string) => key
    })
  };
});

vi.mock('@vue-aria/utils', async () => {
  let actual = await vi.importActual<typeof import('@vue-aria/utils')>('@vue-aria/utils');
  return {
    ...actual,
    useResizeObserver: () => undefined,
    useSyntheticLinkProps: (props?: {href?: string, target?: string, rel?: string, download?: string, ping?: string, referrerPolicy?: string}) => ({
      'data-href': props?.href,
      'data-target': props?.target,
      'data-rel': props?.rel,
      'data-download': props?.download,
      'data-ping': props?.ping,
      'data-referrer-policy': props?.referrerPolicy
    }),
    useRouter: () => ({
      isNative: true,
      open: () => undefined,
      useHref: (href: string) => href
    })
  };
});

vi.mock('@vue-spectrum/label', () => ({
  Field: ({children}: {children?: React.ReactNode}) => children
}));

vi.mock('@vue-spectrum/button', () => ({
  ActionButton: ({children}: {children?: React.ReactNode}) => React.createElement('button', null, children),
  ClearButton: ({children}: {children?: React.ReactNode}) => React.createElement('button', null, children)
}));

import {Item, TagGroup} from '../src';

describe('TagGroup SSR', () => {
  it('should render without errors', () => {
    expect(() => {
      renderToString(
        React.createElement(
          TagGroup,
          {'aria-label': 'Static TagGroup items example'},
          React.createElement(Item, {key: 'news'}, 'News'),
          React.createElement(Item, {key: 'travel'}, 'Travel'),
          React.createElement(Item, {key: 'gaming'}, 'Gaming'),
          React.createElement(Item, {key: 'shopping'}, 'Shopping')
        )
      );
    }).not.toThrow();
  });
});
