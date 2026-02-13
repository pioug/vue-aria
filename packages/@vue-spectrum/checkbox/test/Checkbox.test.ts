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
import {Checkbox} from '../src';

describe('Checkbox', () => {
  it('default unchecked can be checked', () => {
    let onChangeSpy = vi.fn();

    render(React.createElement(Checkbox, {onChange: onChangeSpy}, 'Click Me'));
    let checkbox = screen.getByLabelText('Click Me') as HTMLInputElement;

    expect(checkbox.value).toBe('on');
    expect(checkbox.checked).toBe(false);

    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);
    expect(onChangeSpy).toHaveBeenCalledWith(true);

    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(false);
    expect(onChangeSpy).toHaveBeenCalledWith(false);
  });

  it('can be invalid and pass aria-errormessage', () => {
    render(
      React.createElement(
        Checkbox,
        {
          isInvalid: true,
          'aria-errormessage': 'test-error'
        },
        'Click Me'
      )
    );

    let checkbox = screen.getByRole('checkbox');
    expect(checkbox.getAttribute('aria-invalid')).toBe('true');
    expect(checkbox.getAttribute('aria-errormessage')).toBe('test-error');
  });

  it('supports additional props', () => {
    render(
      React.createElement(
        Checkbox,
        {'data-testid': 'target'},
        'Click Me'
      )
    );

    expect(screen.getByTestId('target')).toBeTruthy();
  });

  it('supports excludeFromTabOrder', () => {
    render(
      React.createElement(
        Checkbox,
        {excludeFromTabOrder: true},
        'Click Me'
      )
    );

    let checkbox = screen.getByRole('checkbox');
    expect(checkbox.getAttribute('tabindex')).toBe('-1');
  });
});
