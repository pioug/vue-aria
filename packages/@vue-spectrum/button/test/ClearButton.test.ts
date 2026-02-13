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
import {ClearButton} from '../src';

describe('ClearButton', () => {
  it('handles defaults', async () => {
    let user = userEvent.setup();
    let onPress = vi.fn();

    render(React.createElement(ClearButton, {onPress, 'aria-label': 'Clear'}, 'Click Me'));

    let button = screen.getByRole('button', {name: 'Clear'});
    await user.click(button);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('allows custom props to be passed through to the button', () => {
    render(React.createElement(ClearButton, {'aria-label': 'Clear', 'data-foo': 'bar'}));

    expect(screen.getByRole('button', {name: 'Clear'}).getAttribute('data-foo')).toBe('bar');
  });
});
