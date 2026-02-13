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

import './testSetup';
import {ProgressBar} from '../src';

describe('ProgressBar', () => {
  it('handles defaults', () => {
    render(React.createElement(ProgressBar, {label: 'Progress Bar'}));
    let progressBar = screen.getByRole('progressbar');

    expect(progressBar.getAttribute('aria-valuemin')).toBe('0');
    expect(progressBar.getAttribute('aria-valuemax')).toBe('100');
    expect(progressBar.getAttribute('aria-valuenow')).toBe('0');
    expect(progressBar.getAttribute('aria-valuetext')).toBe('0%');

    let labelId = progressBar.getAttribute('aria-labelledby');
    expect(labelId).toBeTruthy();
    let label = labelId ? document.getElementById(labelId) : null;
    expect(label?.textContent).toContain('Progress Bar');
  });

  it('updates and clamps by value', () => {
    let {rerender} = render(React.createElement(ProgressBar, {label: 'Progress Bar', value: 30}));
    let progressBar = screen.getByRole('progressbar');
    expect(progressBar.getAttribute('aria-valuenow')).toBe('30');
    expect(progressBar.getAttribute('aria-valuetext')).toBe('30%');

    rerender(React.createElement(ProgressBar, {label: 'Progress Bar', value: -1}));
    progressBar = screen.getByRole('progressbar');
    expect(progressBar.getAttribute('aria-valuenow')).toBe('0');
    expect(progressBar.getAttribute('aria-valuetext')).toBe('0%');

    rerender(React.createElement(ProgressBar, {label: 'Progress Bar', value: 1000}));
    progressBar = screen.getByRole('progressbar');
    expect(progressBar.getAttribute('aria-valuenow')).toBe('100');
    expect(progressBar.getAttribute('aria-valuetext')).toBe('100%');
  });

  it('supports UNSAFE_className and custom DOM props', () => {
    render(
      React.createElement(
        ProgressBar,
        {
          label: 'Progress Bar',
          UNSAFE_className: 'testClass',
          'data-testid': 'test'
        }
      )
    );

    let progressBar = screen.getByTestId('test');
    expect(progressBar.className).toContain('testClass');
  });

  it('warns when no label is provided', () => {
    let warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    render(React.createElement(ProgressBar, {value: 25}));
    expect(warnSpy).toHaveBeenCalledWith(
      'If you do not provide a visible label via children, you must specify an aria-label or aria-labelledby attribute for accessibility'
    );

    warnSpy.mockRestore();
  });
});
