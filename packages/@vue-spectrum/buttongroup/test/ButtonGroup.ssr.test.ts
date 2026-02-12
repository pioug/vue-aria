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

import {ButtonGroup} from '../src';
import React from 'react';
import {renderToString} from 'react-dom/server';

vi.mock('@vue-spectrum/provider', () => ({
  Provider: ({children}: {children: React.ReactNode}) => React.createElement(React.Fragment, null, children),
  useProvider: () => ({scale: 'medium'}),
  useProviderProps: <T,>(props: T) => props
}));

vi.mock('@vue-aria/i18n', () => ({
  useLocale: () => ({
    locale: 'en-US',
    direction: 'ltr'
  })
}));

function Button({children, ...props}: any) {
  return React.createElement('button', props, children);
}

describe('ButtonGroup SSR', () => {
  it('renders without errors', () => {
    expect(() => {
      renderToString(
        React.createElement(
          ButtonGroup,
          null,
          React.createElement(Button, {variant: 'primary'}, 'Test')
        )
      );
    }).not.toThrow();
  });
});
