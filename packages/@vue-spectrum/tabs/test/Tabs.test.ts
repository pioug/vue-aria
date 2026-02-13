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

import {Tabs} from '../src';
import React from 'react';
import {render} from '@testing-library/react';

vi.mock('@vue-spectrum/provider', () => ({
  useProviderProps: <T,>(props: T) => props,
  useProvider: () => ({
    scale: 'medium'
  })
}));

vi.mock('@vue-aria/i18n', () => ({
  useLocale: () => ({
    locale: 'en-US',
    direction: 'ltr'
  })
}));

vi.mock('@vue-aria/utils', async () => {
  let actual = await vi.importActual<typeof import('@vue-aria/utils')>('@vue-aria/utils');
  return {
    ...actual,
    useResizeObserver: () => undefined
  };
});

describe('Tabs', () => {
  it('attaches a user provided ref to the outer div', () => {
    let ref = React.createRef<{UNSAFE_getDOMNode(): HTMLElement | null}>();
    let {getByTestId} = render(
      React.createElement(
        Tabs,
        {
          ref,
          'data-testid': 'tabs',
          'aria-label': 'Tab Sample'
        },
        React.createElement('div', null, 'Tab content')
      )
    );

    let tabs = getByTestId('tabs');
    expect(ref.current?.UNSAFE_getDOMNode()).toBe(tabs);
  });
});
