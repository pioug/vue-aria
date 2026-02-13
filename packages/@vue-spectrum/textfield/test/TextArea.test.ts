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
import {TextArea} from '../src';
import {textFieldBaseSpy} from './testSetup';

describe('TextArea', () => {
  beforeEach(() => {
    textFieldBaseSpy.mockClear();
  });

  it('renders textarea and passes multiline props', () => {
    render(
      React.createElement(
        TextArea,
        {
          'aria-label': 'megatron',
          'data-testid': 'test-id'
        }
      )
    );

    let input = screen.getByTestId('test-id');
    expect(input.tagName).toBe('TEXTAREA');

    expect(textFieldBaseSpy).toHaveBeenCalledTimes(1);
    let props = textFieldBaseSpy.mock.calls[0][0];
    expect(props.multiLine).toBe(true);
  });

  it('quiet variant adjusts vertical height on mount', () => {
    let originalScrollHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollHeight');
    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {configurable: true, value: 500});

    render(
      React.createElement(
        TextArea,
        {
          'aria-label': 'megatron',
          'data-testid': 'test-id',
          isQuiet: true
        }
      )
    );

    let input = screen.getByTestId('test-id') as HTMLTextAreaElement;
    expect(input.style.height).toBe('500px');

    if (originalScrollHeight === undefined) {
      delete (HTMLElement.prototype as Record<string, unknown>).scrollHeight;
    } else {
      Object.defineProperty(HTMLElement.prototype, 'scrollHeight', originalScrollHeight);
    }
  });

  it('warns when placeholder is used', () => {
    let warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    render(
      React.createElement(
        TextArea,
        {
          'aria-label': 'megatron',
          'data-testid': 'test-id',
          placeholder: 'placeholder'
        }
      )
    );

    expect(warnSpy).toHaveBeenCalledWith(
      'Placeholders are deprecated due to accessibility issues. Please use help text instead. See the docs for details: https://react-spectrum.adobe.com/react-spectrum/TextArea.html#help-text'
    );

    warnSpy.mockRestore();
  });
});
