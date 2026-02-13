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
import {fireEvent, render, screen} from '@testing-library/react';

import './testSetup';
import {TextField} from '../src';
import {textFieldBaseSpy} from './testSetup';

describe('TextField', () => {
  beforeEach(() => {
    textFieldBaseSpy.mockClear();
  });

  it('renders with default textfield behavior', () => {
    render(
      React.createElement(
        TextField,
        {
          'aria-label': 'mandatory label',
          'data-testid': 'test-id'
        }
      )
    );

    let input = screen.getByTestId('test-id');
    expect(input.tagName).toBe('INPUT');
    expect(input.getAttribute('type')).toBe('text');
  });

  it('calls onChange when text changes', () => {
    let onChange = vi.fn();
    render(
      React.createElement(
        TextField,
        {
          'aria-label': 'mandatory label',
          'data-testid': 'test-id',
          onChange
        }
      )
    );

    let input = screen.getByTestId('test-id');
    fireEvent.change(input, {target: {value: 'blah'}});

    expect(onChange).toHaveBeenCalledWith('blah');
  });

  it('warns when placeholder is used', () => {
    let warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    render(
      React.createElement(
        TextField,
        {
          'aria-label': 'mandatory label',
          'data-testid': 'test-id',
          placeholder: 'placeholder'
        }
      )
    );

    expect(warnSpy).toHaveBeenCalledWith(
      'Placeholders are deprecated due to accessibility issues. Please use help text instead. See the docs for details: https://react-spectrum.adobe.com/react-spectrum/TextField.html#help-text'
    );

    warnSpy.mockRestore();
  });
});
