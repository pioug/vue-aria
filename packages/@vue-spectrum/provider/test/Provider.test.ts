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
import {act, render, screen} from '@testing-library/react';
import {installMatchMediaMock, MatchMediaController} from './matchMediaMock';
import {Provider} from '../src';

vi.mock('@vue-aria/i18n', () => ({
  I18nProvider: ({children}: {children?: React.ReactNode}) => children,
  useLocale: () => ({
    locale: 'en-US',
    direction: 'ltr'
  })
}));

let theme = {
  global: {},
  light: {'spectrum--light': 'spectrum--light'},
  dark: {'spectrum--dark': 'spectrum--dark'},
  medium: {'spectrum--medium': 'spectrum--medium'},
  large: {'spectrum--large': 'spectrum--large'}
};

let mediaQueryLight = '(prefers-color-scheme: light)';
let mediaQueryDark = '(prefers-color-scheme: dark)';

describe('Provider', () => {
  let matchMedia: MatchMediaController;

  beforeEach(() => {
    matchMedia = installMatchMediaMock();
  });

  afterEach(() => {
    matchMedia.clear();
  });

  it('uses OS theme by default - dark', () => {
    matchMedia.useMediaQuery(mediaQueryDark);

    render(
      React.createElement(
        Provider,
        {
          theme,
          'data-testid': 'provider'
        },
        React.createElement('div', null, 'hello')
      )
    );

    let provider = screen.getByTestId('provider');
    expect(provider.classList.contains('spectrum--dark')).toBe(true);
  });

  it('can be set to dark regardless of OS setting', () => {
    matchMedia.useMediaQuery(mediaQueryLight);

    render(
      React.createElement(
        Provider,
        {
          theme,
          colorScheme: 'dark',
          'data-testid': 'provider'
        },
        React.createElement('div', null, 'hello')
      )
    );

    let provider = screen.getByTestId('provider');
    expect(provider.classList.contains('spectrum--dark')).toBe(true);
  });

  it('nested providers follow their ancestors by default, not the OS', () => {
    matchMedia.useMediaQuery(mediaQueryLight);

    render(
      React.createElement(
        Provider,
        {
          theme,
          colorScheme: 'dark',
          'data-testid': 'provider-outer'
        },
        React.createElement(
          Provider,
          {'data-testid': 'provider-inner'},
          React.createElement('div', null, 'hello')
        )
      )
    );

    let outerProvider = screen.getByTestId('provider-outer');
    let innerProvider = screen.getByTestId('provider-inner');

    expect(outerProvider.classList.contains('spectrum--dark')).toBe(true);
    expect(innerProvider.classList.contains('spectrum--dark')).toBe(true);
  });

  it('rerenders when the OS preferred scheme changes in auto mode', () => {
    matchMedia.useMediaQuery(mediaQueryLight);

    render(
      React.createElement(
        Provider,
        {
          theme,
          'data-testid': 'provider-outer'
        },
        React.createElement(
          Provider,
          {'data-testid': 'provider-inner'},
          React.createElement('div', null, 'hello')
        )
      )
    );

    let outerProvider = screen.getByTestId('provider-outer');
    let innerProvider = screen.getByTestId('provider-inner');

    expect(outerProvider.classList.contains('spectrum--light')).toBe(true);
    expect(innerProvider.classList.contains('spectrum--light')).toBe(true);

    act(() => {
      matchMedia.useMediaQuery(mediaQueryDark);
    });

    expect(outerProvider.classList.contains('spectrum--dark')).toBe(true);
    expect(innerProvider.classList.contains('spectrum--dark')).toBe(true);
  });
});
