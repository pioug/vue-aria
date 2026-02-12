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

import {Well} from '../src';
import React from 'react';
import {render, screen} from '@testing-library/react';

vi.mock('@vue-aria/i18n', () => ({
  useLocale: () => ({
    locale: 'en-US',
    direction: 'ltr'
  })
}));

describe('Well', () => {
  it('supports UNSAFE_className', () => {
    render(
      React.createElement(
        Well,
        {
          UNSAFE_className: 'myClass',
          'data-testid': 'wellV3'
        },
        'My Well'
      )
    );

    let className = screen.getByTestId('wellV3').className;
    expect(className.includes('spectrum-Well')).toBe(true);
    expect(className.includes('myClass')).toBe(true);
  });

  it('supports additional properties', () => {
    render(
      React.createElement(
        Well,
        {'data-testid': 'wellV3'},
        'My Well'
      )
    );

    expect(screen.getByTestId('wellV3').getAttribute('data-testid')).toBe('wellV3');
  });

  it('supports children', () => {
    render(
      React.createElement(Well, null, 'My Well')
    );

    expect(screen.getByText('My Well')).toBeTruthy();
  });

  it('forwards ref and supports children and props', () => {
    let ref = React.createRef<{UNSAFE_getDOMNode(): HTMLElement | null}>();

    render(
      React.createElement(
        Well,
        {
          ref,
          'data-testid': 'wellForwardRef'
        },
        'Well Text'
      )
    );

    let node = ref.current?.UNSAFE_getDOMNode();
    expect(node?.getAttribute('data-testid')).toBe('wellForwardRef');
    expect(node?.textContent?.includes('Well Text')).toBe(true);
  });

  it('supports aria-label with a role', () => {
    render(
      React.createElement(
        Well,
        {
          role: 'region',
          'aria-label': 'well'
        },
        'Well'
      )
    );

    let well = screen.getByText('Well');
    expect(well.getAttribute('role')).toBe('region');
    expect(well.getAttribute('aria-label')).toBe('well');
  });

  it('warns if label is provided without a role', () => {
    let spyWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    render(
      React.createElement(
        Well,
        {'aria-label': 'well'},
        'Well'
      )
    );

    expect(spyWarn).toHaveBeenCalledWith('A labelled Well must have a role.');
    spyWarn.mockRestore();
  });
});
