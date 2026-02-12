/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {fireEvent, render, screen} from '@testing-library/react';
import {Image} from '../src';
import React from 'react';

vi.mock('@vue-spectrum/provider', () => ({
  useProviderProps: <T,>(props: T) => props
}));

vi.mock('@vue-aria/i18n', () => ({
  useLocale: () => ({
    locale: 'en-US',
    direction: 'ltr'
  })
}));

describe('Image', () => {
  it('renders correctly', () => {
    render(React.createElement(Image, {src: 'https://i.imgur.com/Z7AzH2c.png', alt: 'Sky and roof'}));

    expect(
      screen.getByRole('img', {
        name: /sky and roof/i
      })
    ).toBeTruthy();
  });

  it('calls the onError callback', () => {
    let onError = vi.fn();

    render(
      React.createElement(Image, {
        src: 'https://i.imgur.com/Z7AzH2c.png',
        alt: 'Sky and roof',
        onError
      })
    );

    fireEvent.error(screen.getByAltText('Sky and roof'));
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('supports crossOrigin attribute', () => {
    let {rerender} = render(
      React.createElement(Image, {
        src: 'https://i.imgur.com/Z7AzH2c.png',
        alt: 'Sky and roof',
        crossOrigin: 'anonymous'
      })
    );
    expect(screen.getByRole('img').getAttribute('crossorigin')).toBe('anonymous');

    rerender(
      React.createElement(Image, {
        src: 'https://i.imgur.com/Z7AzH2c.png',
        alt: 'Sky and roof',
        crossOrigin: 'use-credentials'
      })
    );
    expect(screen.getByRole('img').getAttribute('crossorigin')).toBe('use-credentials');

    rerender(
      React.createElement(Image, {
        src: 'https://i.imgur.com/Z7AzH2c.png',
        alt: 'Sky and roof'
      })
    );
    expect(screen.getByRole('img').hasAttribute('crossorigin')).toBe(false);
  });
});
