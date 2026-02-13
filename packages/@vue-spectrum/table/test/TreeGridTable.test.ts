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
import {render, screen} from '@testing-library/react';

import './testSetup';
import {setTableNestedRows, tableViewPropsSpy, treeGridPropsSpy} from './testSetup';
import {TableView} from '../src/TableViewWrapper';

describe('TreeGridTable', () => {
  beforeEach(() => {
    tableViewPropsSpy.mockClear();
    treeGridPropsSpy.mockClear();
  });

  it('falls back to TableView when expandable rows are not allowed', () => {
    setTableNestedRows(true);

    render(
      React.createElement(TableView, {
        'aria-label': 'Files',
        UNSTABLE_allowsExpandableRows: false
      })
    );

    expect(screen.getByTestId('table-view')).toBeTruthy();
    expect(screen.queryByTestId('tree-grid-table-view')).toBeNull();
    expect(tableViewPropsSpy).toHaveBeenCalledTimes(1);
  });
});
