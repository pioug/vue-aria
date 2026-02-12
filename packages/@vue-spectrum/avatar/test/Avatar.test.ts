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

import {Avatar} from '../src';
import React from 'react';
import {render, screen} from '@testing-library/react';

vi.mock('@vue-spectrum/provider', () => ({
  useProviderProps: <T,>(props: T) => props
}));

vi.mock('@vue-aria/i18n', () => ({
  useLocale: () => ({
    locale: 'en-US',
    direction: 'ltr'
  })
}));

describe('Avatar', () => {
  it('renders an avatar image', () => {
    render(React.createElement(Avatar, {src: 'http://localhost/some_image.png'}));
    let image = screen.getByRole('presentation');
    expect(image.getAttribute('src')).toBe('http://localhost/some_image.png');
  });

  it('supports alt text', () => {
    render(React.createElement(Avatar, {src: 'http://localhost/some_image.png', alt: 'Test avatar'}));
    expect(screen.getByAltText(/test avatar/i)).toBeTruthy();
  });

  it('supports custom sizes in numbers and css units', () => {
    let {rerender} = render(React.createElement(Avatar, {src: 'http://localhost/some_image.png', size: 80}));
    let image = screen.getByRole('presentation');
    expect((image as HTMLImageElement).style.height).toBe('80px');
    expect((image as HTMLImageElement).style.width).toBe('80px');

    rerender(React.createElement(Avatar, {src: 'http://localhost/some_image.png', size: '90px'}));
    image = screen.getByRole('presentation');
    expect((image as HTMLImageElement).style.height).toBe('90px');
    expect((image as HTMLImageElement).style.width).toBe('90px');
  });

  it('supports custom class names, DOM props, and disabled state', () => {
    render(
      React.createElement(Avatar, {
        src: 'http://localhost/some_image.png',
        UNSAFE_className: 'my-class',
        'data-testid': 'avatar',
        isDisabled: true
      })
    );

    let image = screen.getByTestId('avatar');
    expect(image.className.includes('my-class')).toBe(true);
    expect(image.className.includes('is-disabled')).toBe(true);
  });
});
