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
import {Menu} from '../src';

describe('Menu', () => {
  it('renders menu items and fires onAction', async () => {
    let user = userEvent.setup();
    let onAction = vi.fn();

    render(
      React.createElement(Menu, {
        onAction,
        items: [
          {key: 'copy', name: 'Copy'},
          {key: 'paste', name: 'Paste'}
        ]
      })
    );

    expect(screen.getByRole('menu')).toBeTruthy();
    expect(screen.getAllByRole('menuitem')).toHaveLength(2);

    await user.click(screen.getByRole('menuitem', {name: 'Copy'}));
    expect(onAction).toHaveBeenCalledWith('copy');
  });
});
