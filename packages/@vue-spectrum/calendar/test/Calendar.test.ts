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

import {CalendarDate} from '@internationalized/date';
import React from 'react';
import userEvent from '@testing-library/user-event';
import {render, screen} from '@testing-library/react';

import './testSetup';
import {Calendar} from '../src';

describe('Calendar', () => {
  it('renders with a default value', () => {
    render(React.createElement(Calendar, {defaultValue: new CalendarDate(2019, 6, 5)}));

    expect(screen.getByRole('heading').textContent).toContain('June 2019');

    let selectedDate = screen.getByLabelText(/selected/i);
    expect(selectedDate.parentElement?.getAttribute('role')).toBe('gridcell');
    expect(selectedDate.parentElement?.getAttribute('aria-selected')).toBe('true');
    expect(selectedDate.textContent).toBe('5');
  });

  it('selects a date on keyboard enter', async () => {
    let user = userEvent.setup();
    let onChange = vi.fn();

    render(React.createElement(Calendar, {
      defaultValue: new CalendarDate(2019, 6, 5),
      autoFocus: true,
      onChange
    }));

    await user.keyboard('{ArrowLeft}');
    await user.keyboard('{Enter}');

    let selectedDate = screen.getByLabelText(/selected/i);
    expect(selectedDate.textContent).toBe('4');
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0]).toMatchObject({
      year: 2019,
      month: 6,
      day: 4
    });
  });

  it('selects a date on click', async () => {
    let user = userEvent.setup();
    let onChange = vi.fn();

    render(React.createElement(Calendar, {
      defaultValue: new CalendarDate(2019, 6, 5),
      onChange
    }));

    await user.click(screen.getByLabelText(/June 17, 2019/i));

    let selectedDate = screen.getByLabelText(/selected/i);
    expect(selectedDate.textContent).toBe('17');
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0]).toMatchObject({
      year: 2019,
      month: 6,
      day: 17
    });
  });
});
