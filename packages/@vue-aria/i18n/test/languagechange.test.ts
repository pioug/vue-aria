/*
 * Copyright 2023 Adobe. All rights reserved.
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
import {act, render} from '@testing-library/react';
import {I18nProvider, useLocale} from '../src/context';

function TestComponent() {
  let locale = useLocale();
  return React.createElement(
    'div',
    null,
    React.createElement('div', {'data-testid': 'locale'}, locale.locale),
    React.createElement('div', {'data-testid': 'direction'}, locale.direction)
  );
}

function languageProps(language: string) {
  return {
    value: language,
    writable: true,
    configurable: true
  };
}

describe('useLocale languagechange', function () {
  let originalLanguage: string;

  beforeEach(() => {
    originalLanguage = window.navigator.language;
    Object.defineProperty(window.navigator, 'language', languageProps('en-US'));

    act(() => {
      window.dispatchEvent(new Event('languagechange'));
    });
  });

  afterEach(() => {
    Object.defineProperty(window.navigator, 'language', languageProps(originalLanguage));

    act(() => {
      window.dispatchEvent(new Event('languagechange'));
    });
  });

  it('updates locale when languagechange is triggered', function () {
    let {getByTestId} = render(
      React.createElement(
        I18nProvider,
        null,
        React.createElement(TestComponent)
      )
    );

    expect(getByTestId('locale').textContent).toBe('en-US');
    expect(getByTestId('direction').textContent).toBe('ltr');

    act(() => {
      Object.defineProperty(window.navigator, 'language', languageProps('pt-PT'));
      window.dispatchEvent(new Event('languagechange'));
    });

    expect(getByTestId('locale').textContent).toBe('pt-PT');
    expect(getByTestId('direction').textContent).toBe('ltr');
  });

  it('updates direction when switching to RTL locale', function () {
    let {getByTestId} = render(
      React.createElement(
        I18nProvider,
        null,
        React.createElement(TestComponent)
      )
    );

    act(() => {
      Object.defineProperty(window.navigator, 'language', languageProps('he-IL'));
      window.dispatchEvent(new Event('languagechange'));
    });

    expect(getByTestId('locale').textContent).toBe('he-IL');
    expect(getByTestId('direction').textContent).toBe('rtl');

    act(() => {
      Object.defineProperty(window.navigator, 'language', languageProps('pt-PT'));
      window.dispatchEvent(new Event('languagechange'));
    });

    expect(getByTestId('locale').textContent).toBe('pt-PT');
    expect(getByTestId('direction').textContent).toBe('ltr');
  });

  it('keeps explicit locale when provided via I18nProvider', function () {
    let {getByTestId} = render(
      React.createElement(
        I18nProvider,
        {locale: 'fr-FR'},
        React.createElement(TestComponent)
      )
    );

    expect(getByTestId('locale').textContent).toBe('fr-FR');
    expect(getByTestId('direction').textContent).toBe('ltr');

    act(() => {
      Object.defineProperty(window.navigator, 'language', languageProps('ja-JP'));
      window.dispatchEvent(new Event('languagechange'));
    });

    expect(getByTestId('locale').textContent).toBe('fr-FR');
    expect(getByTestId('direction').textContent).toBe('ltr');
  });
});
