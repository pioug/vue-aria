/*
 * Copyright 2021 Adobe. All rights reserved.
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
import {render, screen, within} from '@testing-library/react';

import './testSetup';
import {Item, ListView} from '../src';
import {useListStateSpy} from './testSetup';

describe('ListView', () => {
  beforeEach(() => {
    useListStateSpy.mockClear();
  });

  it('renders a static listview', () => {
    render(
      React.createElement(
        ListView,
        {
          'aria-label': 'List',
          'data-testid': 'test'
        },
        React.createElement(Item, null, 'Foo'),
        React.createElement(Item, null, 'Bar'),
        React.createElement(Item, null, 'Baz')
      )
    );

    let grid = screen.getByRole('grid');
    let rows = screen.getAllByRole('row');

    expect(grid.getAttribute('aria-label')).toBe('List');
    expect(grid.getAttribute('data-testid')).toBe('test');
    expect(grid.getAttribute('aria-rowcount')).toBe('3');
    expect(grid.getAttribute('aria-colcount')).toBe('1');
    expect(rows).toHaveLength(3);
    expect(rows[0].getAttribute('aria-rowindex')).toBe('1');

    let cells = within(rows[0]).getAllByRole('gridcell');
    expect(cells).toHaveLength(1);
    expect(cells[0].textContent).toBe('Foo');
    expect(cells[0].getAttribute('aria-colindex')).toBe('1');
  });

  it('renders a dynamic listview', () => {
    let items = [
      {key: 'foo', label: 'Foo'},
      {key: 'bar', label: 'Bar'},
      {key: 'baz', label: 'Baz'}
    ];

    render(
      React.createElement(
        ListView,
        {
          items,
          'aria-label': 'List'
        },
        (item: {label: string}) => React.createElement(Item, {textValue: item.label}, item.label)
      )
    );

    let rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(3);
    expect(rows[2].getAttribute('aria-rowindex')).toBe('3');
    expect(screen.getByText('Baz')).toBeTruthy();
  });

  it('maps highlight selectionStyle to replace selectionBehavior', () => {
    render(
      React.createElement(
        ListView,
        {
          'aria-label': 'List',
          selectionStyle: 'highlight'
        },
        React.createElement(Item, null, 'One')
      )
    );

    expect(useListStateSpy).toHaveBeenCalledTimes(1);
    expect(useListStateSpy.mock.calls[0][0].selectionBehavior).toBe('replace');
  });
});
