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

import {Divider} from '../src';
import React from 'react';
import {render, screen} from '@testing-library/react';

vi.mock('@vue-aria/i18n', () => ({
  useLocale: () => ({
    locale: 'en-US',
    direction: 'ltr'
  })
}));

describe('Divider', () => {
  it.each([
    {size: undefined},
    {size: 'M' as const},
    {size: 'S' as const}
  ])('handles defaults with size=$size', ({size}) => {
    render(
      React.createElement(Divider, {
        size,
        'aria-label': 'divides'
      })
    );

    let divider = screen.getByRole('separator');
    expect(divider).toBeTruthy();
    expect(divider.getAttribute('aria-orientation')).toBe(null);
    expect(divider.getAttribute('aria-label')).toBe('divides');
  });

  it.each([
    {size: undefined},
    {size: 'M' as const},
    {size: 'S' as const}
  ])('can be vertical with size=$size', ({size}) => {
    render(
      React.createElement(Divider, {
        size,
        orientation: 'vertical',
        'aria-label': 'divides'
      })
    );

    let divider = screen.getByRole('separator');
    expect(divider).toBeTruthy();
    expect(divider.getAttribute('aria-orientation')).toBe('vertical');
    expect(divider.getAttribute('aria-label')).toBe('divides');
  });

  it('supports aria-labelledby', () => {
    render(
      React.createElement(
        React.Fragment,
        null,
        React.createElement('span', {id: 'test'}, 'Test'),
        React.createElement(Divider, {
          orientation: 'vertical',
          'aria-labelledby': 'test'
        })
      )
    );

    let divider = screen.getByRole('separator');
    expect(divider.getAttribute('aria-labelledby')).toBe('test');
  });

  it('supports custom data attributes', () => {
    render(
      React.createElement(Divider, {
        orientation: 'vertical',
        'data-testid': 'test'
      })
    );

    let divider = screen.getByRole('separator');
    expect(divider.getAttribute('data-testid')).toBe('test');
  });

  it('does not include implicit aria-orientation', () => {
    render(
      React.createElement(Divider, {
        'aria-label': 'divides'
      })
    );

    let divider = screen.getByRole('separator');
    expect(divider.getAttribute('aria-orientation')).toBe(null);
  });

  it('forwards the ref', () => {
    let ref = React.createRef<{UNSAFE_getDOMNode(): HTMLElement | null}>();

    render(
      React.createElement(Divider, {
        ref,
        'aria-label': 'divides'
      })
    );

    let divider = screen.getByRole('separator');
    expect(ref.current?.UNSAFE_getDOMNode()).toBe(divider);
  });
});
