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
import userEvent from '@testing-library/user-event';
import {render, screen} from '@testing-library/react';

import './testSetup';
import {ToggleButton} from '../src';

describe('ToggleButton', () => {
  it('handles defaults', async () => {
    let user = userEvent.setup();
    let onPress = vi.fn();
    let onChange = vi.fn();

    render(React.createElement(ToggleButton, {onPress, onChange}, 'Click Me'));
    let button = screen.getByRole('button', {name: 'Click Me'});

    expect(button.getAttribute('aria-pressed')).toBe('false');
    await user.click(button);
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(true);
    expect(button.getAttribute('aria-pressed')).toBe('true');
  });

  it('supports defaultSelected', async () => {
    let user = userEvent.setup();
    let onChange = vi.fn();

    render(React.createElement(ToggleButton, {defaultSelected: true, onChange}, 'Click Me'));
    let button = screen.getByRole('button', {name: 'Click Me'});

    expect(button.getAttribute('aria-pressed')).toBe('true');
    await user.click(button);
    expect(onChange).toHaveBeenCalledWith(false);
    expect(button.getAttribute('aria-pressed')).toBe('false');
  });

  it('supports custom props', () => {
    render(React.createElement(ToggleButton, {'data-foo': 'bar'}, 'Click Me'));
    expect(screen.getByRole('button', {name: 'Click Me'}).getAttribute('data-foo')).toBe('bar');
  });
});
