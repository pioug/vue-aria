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
import {RangeCalendar} from '../src';

describe('RangeCalendar', () => {
  it('renders with a default range value', () => {
    render(React.createElement(RangeCalendar, {
      defaultValue: {
        start: new CalendarDate(2019, 6, 5),
        end: new CalendarDate(2019, 6, 10)
      }
    }));

    expect(screen.getByRole('heading').textContent).toContain('June 2019');
    expect(screen.getAllByLabelText(/selected/i)).toHaveLength(6);
  });

  it('centers selected range when multiple months are visible', () => {
    render(React.createElement(RangeCalendar, {
      value: {
        start: new CalendarDate(2019, 2, 3),
        end: new CalendarDate(2019, 2, 10)
      },
      visibleMonths: 3
    }));

    let grids = screen.getAllByRole('grid');
    expect(grids).toHaveLength(3);

    let selectedDates = screen.getAllByLabelText(/selected/i);
    expect(selectedDates.every((cell) => grids[1].contains(cell))).toBe(true);
  });

  it('navigates between months', async () => {
    let user = userEvent.setup();

    render(React.createElement(RangeCalendar, {
      value: {
        start: new CalendarDate(2019, 6, 20),
        end: new CalendarDate(2019, 7, 10)
      }
    }));

    expect(screen.getByRole('heading').textContent).toContain('June 2019');

    await user.click(screen.getAllByLabelText('Next')[0]);
    expect(screen.getByRole('heading').textContent).toContain('July 2019');

    await user.click(screen.getByLabelText('Previous'));
    expect(screen.getByRole('heading').textContent).toContain('June 2019');
  });
});
