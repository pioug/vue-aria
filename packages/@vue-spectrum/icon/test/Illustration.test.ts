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

import {Illustration} from '../src';
import React from 'react';
import {render, screen} from '@testing-library/react';

function CustomIllustration(props: React.SVGProps<SVGSVGElement>) {
  return React.createElement(
    'svg',
    props,
    React.createElement('path', {d: 'M 10,150 L 70,10 L 130,150 z'})
  );
}

vi.mock('@vue-aria/i18n', () => ({
  useLocale: () => ({
    locale: 'en-US',
    direction: 'ltr'
  })
}));

describe('Illustration', () => {
  it('handles aria label', () => {
    render(
      React.createElement(
        Illustration,
        {'aria-label': 'custom illustration'},
        React.createElement(CustomIllustration, null)
      )
    );

    let illustration = screen.getByRole('img');
    expect(illustration.getAttribute('focusable')).toBe('false');
    expect(illustration.getAttribute('aria-label')).toBe('custom illustration');
  });

  it('handles no aria label', () => {
    let {container} = render(
      React.createElement(
        Illustration,
        null,
        React.createElement(CustomIllustration, null)
      )
    );

    let illustration = container.querySelector('svg');
    expect(illustration?.hasAttribute('aria-label')).toBe(false);
    expect(illustration?.hasAttribute('aria-hidden')).toBe(false);
  });

  it('supports aria-hidden prop', () => {
    let {rerender} = render(
      React.createElement(
        Illustration,
        {
          'aria-label': 'explicitly hidden aria-label',
          'aria-hidden': true
        },
        React.createElement(CustomIllustration, null)
      )
    );

    let illustration = screen.getByRole('img', {hidden: true});
    expect(illustration.getAttribute('aria-label')).toBe('explicitly hidden aria-label');
    expect(illustration.getAttribute('aria-hidden')).toBe('true');

    rerender(
      React.createElement(
        Illustration,
        {
          'aria-label': 'explicitly not hidden aria-label',
          'aria-hidden': false
        },
        React.createElement(CustomIllustration, null)
      )
    );

    illustration = screen.getByRole('img');
    expect(illustration.getAttribute('aria-label')).toBe('explicitly not hidden aria-label');
    expect(illustration.hasAttribute('aria-hidden')).toBe(false);
  });
});
