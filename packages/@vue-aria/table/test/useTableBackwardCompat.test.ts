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

import {Cell, Column, Row, TableBody, TableHeader, useTableState} from '@vue-stately/table';
import {render} from '@testing-library/react';
import React, {useRef} from 'react';
import {useTable} from '../src';

vi.mock('@vue-aria/live-announcer', () => ({
  announce: vi.fn()
}));

vi.mock('@vue-aria/i18n', () => ({
  useLocale: () => ({
    direction: 'ltr',
    locale: 'en-US'
  }),
  useCollator: () => ({
    compare: (a: string, b: string) => String(a).localeCompare(String(b))
  }),
  useLocalizedStringFormatter: () => ({
    format: () => ''
  })
}));

const columns = [
  {name: 'Name', uid: 'name'},
  {name: 'Type', uid: 'type'}
];

const rows = [
  {id: 1, name: 'Charizard', type: 'Fire, Flying'},
  {id: 2, name: 'Squirtle', type: 'Water'}
];

function BackwardCompatTable(props: any) {
  let state = useTableState({
    ...props,
    children: [
      React.createElement(
        TableHeader,
        {columns},
        column => React.createElement(
          Column,
          {key: column.uid},
          column.name
        )
      ),
      React.createElement(
        TableBody,
        {items: rows},
        item => React.createElement(
          Row,
          {key: item.id},
          (columnKey) => React.createElement(Cell, null, item[columnKey])
        )
      )
    ]
  });

  let ref = useRef<HTMLTableElement>(null);
  let {gridProps} = useTable(props, state, ref);

  return React.createElement('table', {
    ...gridProps,
    'data-testid': 'table',
    ref
  });
}

describe('useTable backward compatibility', () => {
  it('accepts deprecated onAction prop without breaking table semantics', () => {
    let onAction = vi.fn();
    let {getByTestId} = render(React.createElement(BackwardCompatTable, {
      'aria-label': 'Back compat table',
      onAction
    }));

    let table = getByTestId('table');
    expect(table.getAttribute('role')).toBe('grid');
    expect(table.getAttribute('aria-label')).toBe('Back compat table');
    expect(onAction).not.toHaveBeenCalled();
  });
});
