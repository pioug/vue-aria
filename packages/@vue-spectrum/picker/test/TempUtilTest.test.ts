/*
 * Copyright 2024 Adobe. All rights reserved.
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
import {states} from './data';

describe('Picker temp util parity', () => {
  it('supports selecting an option with data-driven items', async () => {
    let user = userEvent.setup();
    let onSelectionChange = vi.fn();

    render(
      React.createElement(
        Picker,
        {
          label: 'States',
          items: states,
          onSelectionChange
        },
        (item: {id: string, name: string}) => React.createElement(Item, {key: item.id}, item.name)
      )
    );

    let picker = screen.getByRole('button');
    await user.click(picker);

    let listbox = screen.getByRole('listbox');
    let options = within(listbox).getAllByRole('option');
    expect(options).toHaveLength(3);
    expect(options[1].textContent).toBe('Two');

    await user.click(options[1]);
    expect(onSelectionChange).toHaveBeenCalledWith('two');
    expect(picker.textContent).toContain('Two');
  });
});
