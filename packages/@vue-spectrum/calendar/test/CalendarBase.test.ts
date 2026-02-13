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
import {render, screen} from '@testing-library/react';

import './testSetup';
import {Calendar, RangeCalendar} from '../src';

describe('CalendarBase', () => {
  it('shows calendar container, heading, and navigation controls', () => {
    render(React.createElement(Calendar, {
      defaultValue: new CalendarDate(2019, 6, 5)
    }));

    expect(screen.getByRole('application')).toBeTruthy();
    expect(screen.getByRole('heading').textContent).toContain('June 2019');
    expect(screen.getByLabelText('Previous')).toBeTruthy();
    expect(screen.getAllByLabelText('Next').length).toBeGreaterThan(0);
  });

  it('marks calendar as disabled when isDisabled is set', () => {
    render(React.createElement(RangeCalendar, {
      isDisabled: true,
      defaultValue: {
        start: new CalendarDate(2019, 6, 5),
        end: new CalendarDate(2019, 6, 10)
      }
    }));

    let grid = screen.getByRole('grid');
    expect(grid.getAttribute('aria-disabled')).toBe('true');
    expect(screen.getByLabelText('Previous').hasAttribute('disabled')).toBe(true);
    for (let next of screen.getAllByLabelText('Next')) {
      expect(next.hasAttribute('disabled')).toBe(true);
    }
  });

  it('renders multiple visible months', () => {
    render(React.createElement(Calendar, {
      defaultValue: new CalendarDate(2019, 6, 5),
      visibleMonths: 3
    }));

    expect(screen.getAllByRole('grid')).toHaveLength(3);
  });
});
