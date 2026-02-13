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
import {render, screen, within} from '@testing-library/react';

import './testSetup';
import {Item, Picker} from '../src';

describe('Picker', () => {
  it('renders correctly', () => {
    render(
      React.createElement(
        Picker,
        {
          label: 'Test',
          'data-testid': 'picker-trigger'
        },
        React.createElement(Item, {key: 'one'}, 'One'),
        React.createElement(Item, {key: 'two'}, 'Two'),
        React.createElement(Item, {key: 'three'}, 'Three')
      )
    );

    let picker = screen.getByRole('button');
    expect(picker.getAttribute('aria-haspopup')).toBe('listbox');
    expect(picker.getAttribute('data-testid')).toBe('picker-trigger');
    expect(screen.getByText('Test')).toBeTruthy();
    expect(screen.getByText('Select…')).toBeTruthy();
  });

  it('opens and selects an item', async () => {
    let user = userEvent.setup();
    let onSelectionChange = vi.fn();
    let onOpenChange = vi.fn();

    render(
      React.createElement(
        Picker,
        {
          label: 'Test',
          onSelectionChange,
          onOpenChange
        },
        React.createElement(Item, {key: 'one'}, 'One'),
        React.createElement(Item, {key: 'two'}, 'Two'),
        React.createElement(Item, {key: 'three'}, 'Three')
      )
    );

    let picker = screen.getByRole('button');
    await user.click(picker);

    let listbox = screen.getByRole('listbox');
    let options = within(listbox).getAllByRole('option');
    expect(options).toHaveLength(3);
    expect(options[2].textContent).toBe('Three');
    expect(onOpenChange).toHaveBeenCalledWith(true);

    await user.click(options[2]);

    expect(onSelectionChange).toHaveBeenCalledWith('three');
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(picker.textContent).toContain('Three');
  });
});
