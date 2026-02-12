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
import {render, screen} from '@testing-library/react';
import {UIIcon} from '../src';

function FakeIcon(props: React.SVGProps<SVGSVGElement>) {
  return React.createElement(
    'svg',
    props,
    React.createElement('path', {d: 'M 10,150 L 70,10 L 130,150 z'})
  );
}

vi.mock('@vue-spectrum/provider', () => ({
  useProvider: () => {
    throw new Error('No provider');
  }
}));

vi.mock('@vue-aria/i18n', () => ({
  useLocale: () => ({
    locale: 'en-US',
    direction: 'ltr'
  })
}));

describe('UIIcon', () => {
  it('handles defaults', () => {
    let {rerender} = render(
      React.createElement(
        UIIcon,
        {'aria-label': 'labelled icon'},
        React.createElement(FakeIcon, null)
      )
    );

    let icon = screen.getByRole('img');
    expect(icon.getAttribute('focusable')).toBe('false');
    expect(icon.getAttribute('aria-label')).toBe('labelled icon');

    rerender(
      React.createElement(
        UIIcon,
        null,
        React.createElement(FakeIcon, null)
      )
    );

    icon = screen.getByRole('img', {hidden: true});
    expect(icon.hasAttribute('aria-label')).toBe(false);
    expect(icon.getAttribute('aria-hidden')).toBe('true');
  });

  it('supports aria-hidden prop', () => {
    let {rerender} = render(
      React.createElement(
        UIIcon,
        {
          'aria-label': 'explicitly hidden aria-label',
          'aria-hidden': true
        },
        React.createElement(FakeIcon, null)
      )
    );

    let icon = screen.getByRole('img', {hidden: true});
    expect(icon.getAttribute('aria-label')).toBe('explicitly hidden aria-label');
    expect(icon.getAttribute('aria-hidden')).toBe('true');

    rerender(
      React.createElement(
        UIIcon,
        {
          'aria-label': 'explicitly not hidden aria-label',
          'aria-hidden': false
        },
        React.createElement(FakeIcon, null)
      )
    );

    icon = screen.getByRole('img');
    expect(icon.getAttribute('aria-label')).toBe('explicitly not hidden aria-label');
    expect(icon.hasAttribute('aria-hidden')).toBe(false);
  });
});
