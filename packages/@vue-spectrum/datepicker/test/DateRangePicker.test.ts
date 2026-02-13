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
import {DateRangePicker} from '../src';

describe('DateRangePicker', () => {
  it('renders start/end fields and opens range calendar dialog', async () => {
    let user = userEvent.setup();

    render(
      React.createElement(DateRangePicker, {
        label: 'Travel dates'
      })
    );

    expect(screen.getByTestId('start-date')).toBeTruthy();
    expect(screen.getByTestId('end-date')).toBeTruthy();
    expect(screen.getByTestId('date-range-dash')).toBeTruthy();
    expect(screen.queryByRole('dialog')).toBeNull();

    await user.click(screen.getByRole('button', {name: 'Open range calendar'}));

    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getByTestId('range-calendar')).toBeTruthy();
  });
});
