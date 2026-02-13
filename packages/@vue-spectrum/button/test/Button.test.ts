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
import {ActionButton, Button, LogicButton} from '../src';

describe('Button', () => {
  it('handles defaults for Button-like components', async () => {
    let user = userEvent.setup();

    let onActionButtonPress = vi.fn();
    render(React.createElement(ActionButton, {onPress: onActionButtonPress}, 'Action'));
    await user.click(screen.getByRole('button', {name: 'Action'}));
    expect(onActionButtonPress).toHaveBeenCalledTimes(1);

    let onButtonPress = vi.fn();
    render(React.createElement(Button, {onPress: onButtonPress}, 'Primary'));
    await user.click(screen.getByRole('button', {name: 'Primary'}));
    expect(onButtonPress).toHaveBeenCalledTimes(1);

    let onLogicButtonPress = vi.fn();
    render(React.createElement(LogicButton, {onPress: onLogicButtonPress}, 'Logic'));
    await user.click(screen.getByRole('button', {name: 'Logic'}));
    expect(onLogicButtonPress).toHaveBeenCalledTimes(1);
  });

  it('passes custom attributes through to button', () => {
    render(
      React.createElement(
        Button,
        {
          'aria-label': 'custom',
          'data-foo': 'bar'
        }
      )
    );

    expect(screen.getByRole('button', {name: 'custom'}).getAttribute('data-foo')).toBe('bar');
  });

  it('disables press handlers while pending', async () => {
    let user = userEvent.setup();
    let onPress = vi.fn();

    render(
      React.createElement(
        Button,
        {
          onPress,
          isPending: true
        },
        'Pending'
      )
    );

    let button = screen.getByRole('button', {name: /pending/i});
    await user.click(button);
    expect(onPress).not.toHaveBeenCalled();
    expect(button.getAttribute('aria-disabled')).toBe('true');
  });
});
