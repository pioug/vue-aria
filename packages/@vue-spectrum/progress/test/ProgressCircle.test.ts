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
import {ProgressCircle} from '../src';

describe('ProgressCircle', () => {
  it('handles defaults and controlled value', () => {
    let {rerender} = render(React.createElement(ProgressCircle, {'aria-label': 'Progress'}));
    let progressCircle = screen.getByRole('progressbar');

    expect(progressCircle.getAttribute('aria-valuemin')).toBe('0');
    expect(progressCircle.getAttribute('aria-valuemax')).toBe('100');
    expect(progressCircle.getAttribute('aria-valuenow')).toBe('0');

    rerender(React.createElement(ProgressCircle, {'aria-label': 'Progress', value: 30}));
    progressCircle = screen.getByRole('progressbar');
    expect(progressCircle.getAttribute('aria-valuenow')).toBe('30');
  });

  it('handles indeterminate and clamps values', () => {
    let {rerender} = render(React.createElement(ProgressCircle, {'aria-label': 'Progress', isIndeterminate: true}));
    let progressCircle = screen.getByRole('progressbar');
    expect(progressCircle.hasAttribute('aria-valuenow')).toBe(false);

    rerender(React.createElement(ProgressCircle, {'aria-label': 'Progress', value: -1}));
    progressCircle = screen.getByRole('progressbar');
    expect(progressCircle.getAttribute('aria-valuenow')).toBe('0');

    rerender(React.createElement(ProgressCircle, {'aria-label': 'Progress', value: 1000}));
    progressCircle = screen.getByRole('progressbar');
    expect(progressCircle.getAttribute('aria-valuenow')).toBe('100');
  });

  it('applies submask rotation styles for determinate progress', () => {
    render(React.createElement(ProgressCircle, {'aria-label': 'Progress', value: 25}));

    let fillSubMask1 = screen.getByTestId('fillSubMask1');
    let fillSubMask2 = screen.getByTestId('fillSubMask2');

    expect(fillSubMask1.getAttribute('style')).toContain('rotate(-90deg)');
    expect(fillSubMask2.getAttribute('style')).toContain('rotate(-180deg)');
  });

  it('warns when aria-label is missing', () => {
    let warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    render(React.createElement(ProgressCircle, {value: 25}));
    expect(warnSpy).toHaveBeenCalledWith(
      'ProgressCircle requires an aria-label or aria-labelledby attribute for accessibility'
    );

    warnSpy.mockRestore();
  });

  it('supports custom DOM props', () => {
    render(React.createElement(ProgressCircle, {value: 25, 'aria-label': 'Progress', 'data-testid': 'test'}));
    expect(screen.getByTestId('test')).toBeTruthy();
  });
});
