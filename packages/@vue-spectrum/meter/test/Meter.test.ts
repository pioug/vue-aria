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

import {Meter} from '../src';
import React from 'react';
import {render, screen} from '@testing-library/react';

vi.mock('@vue-aria/i18n', () => ({
  useLocale: () => ({
    locale: 'en-US',
    direction: 'ltr'
  }),
  useNumberFormatter: (options: Intl.NumberFormatOptions = {}) => new Intl.NumberFormat('en-US', options)
}));

describe('Meter', () => {
  it('handles defaults', () => {
    render(React.createElement(Meter, {label: 'Meter'}));

    let progressBar = screen.getByRole('meter');
    let fallbackProgressBar = screen.getByRole('progressbar', {queryFallbacks: true});
    expect(progressBar).toBe(fallbackProgressBar);
    expect(progressBar.getAttribute('aria-valuemin')).toBe('0');
    expect(progressBar.getAttribute('aria-valuemax')).toBe('100');
    expect(progressBar.getAttribute('aria-valuenow')).toBe('0');
    expect(progressBar.getAttribute('aria-valuetext')).toBe('0%');

    let labelId = progressBar.getAttribute('aria-labelledby');
    expect(labelId).toBeTruthy();
    let label = labelId ? document.getElementById(labelId) : null;
    expect(label?.textContent).toBe('Meter');
  });

  it('updates all fields by value', () => {
    render(React.createElement(Meter, {value: 30, label: 'Meter'}));

    let progressBar = screen.getByRole('meter');
    expect(progressBar.getAttribute('aria-valuemin')).toBe('0');
    expect(progressBar.getAttribute('aria-valuemax')).toBe('100');
    expect(progressBar.getAttribute('aria-valuenow')).toBe('30');
    expect(progressBar.getAttribute('aria-valuetext')).toBe('30%');
  });

  it('clamps values to 0', () => {
    render(React.createElement(Meter, {value: -1, label: 'Meter'}));

    let progressBar = screen.getByRole('meter');
    expect(progressBar.getAttribute('aria-valuenow')).toBe('0');
    expect(progressBar.getAttribute('aria-valuetext')).toBe('0%');
  });

  it('clamps values to 100', () => {
    render(React.createElement(Meter, {value: 1000, label: 'Meter'}));

    let progressBar = screen.getByRole('meter');
    expect(progressBar.getAttribute('aria-valuenow')).toBe('100');
    expect(progressBar.getAttribute('aria-valuetext')).toBe('100%');
  });

  it('supports UNSAFE_className', () => {
    render(
      React.createElement(Meter, {
        size: 'S',
        UNSAFE_className: 'testClass',
        label: 'Meter'
      })
    );

    let progressBar = screen.getByRole('meter');
    expect(progressBar.className.includes('testClass')).toBe(true);
  });

  it('can handle negative values', () => {
    render(
      React.createElement(Meter, {
        value: 0,
        minValue: -5,
        maxValue: 5,
        label: 'Meter'
      })
    );

    let progressBar = screen.getByRole('meter');
    expect(progressBar.getAttribute('aria-valuenow')).toBe('0');
    expect(progressBar.getAttribute('aria-valuetext')).toBe('50%');
    expect(progressBar.getAttribute('role')).toBe('meter progressbar');
  });

  it('supports aria-label', () => {
    render(React.createElement(Meter, {'aria-label': 'Meter'}));

    let progressBar = screen.getByRole('meter');
    expect(progressBar.getAttribute('aria-label')).toBe('Meter');
  });

  it('supports custom DOM props', () => {
    render(
      React.createElement(Meter, {
        label: 'Meter',
        'data-testid': 'test'
      })
    );

    expect(screen.getByTestId('test')).toBeTruthy();
  });
});
