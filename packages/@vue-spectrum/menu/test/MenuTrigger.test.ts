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
import {Menu, MenuTrigger} from '../src';

describe('MenuTrigger', () => {
  it('opens menu in a popover when trigger is pressed', async () => {
    let user = userEvent.setup();

    render(
      React.createElement(
        MenuTrigger,
        null,
        React.createElement('button', {type: 'button'}, 'Open menu'),
        React.createElement(Menu, {
          items: [
            {key: 'copy', name: 'Copy'},
            {key: 'paste', name: 'Paste'}
          ]
        })
      )
    );

    expect(screen.queryByRole('menu')).toBeNull();
    await user.click(screen.getByRole('button', {name: 'Open menu'}));
    expect(screen.getByTestId('menu-popover')).toBeTruthy();
    expect(screen.getByRole('menu')).toBeTruthy();
  });
});
