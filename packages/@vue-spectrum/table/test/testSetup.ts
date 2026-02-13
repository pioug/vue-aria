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

export const tableViewPropsSpy = vi.fn();
export const treeGridPropsSpy = vi.fn();

let nestedRowsEnabled = false;

export function setTableNestedRows(enabled: boolean) {
  nestedRowsEnabled = enabled;
}

vi.mock('@react-stately/flags', () => ({
  tableNestedRows: () => nestedRowsEnabled
}));

vi.mock('../src/TableView', () => ({
  TableView: React.forwardRef(function MockTableView(
    props: Record<string, unknown>,
    ref: React.ForwardedRef<HTMLDivElement>
  ) {
    tableViewPropsSpy(props);
    return React.createElement('div', {ref, 'data-testid': 'table-view'}, 'TableView');
  })
}));

vi.mock('../src/TreeGridTableView', () => ({
  TreeGridTableView: React.forwardRef(function MockTreeGridTableView(
    props: Record<string, unknown>,
    ref: React.ForwardedRef<HTMLDivElement>
  ) {
    treeGridPropsSpy(props);
    return React.createElement('div', {ref, 'data-testid': 'tree-grid-table-view'}, 'TreeGridTableView');
  })
}));

vi.mock('@react-stately/table', () => ({
  Column: ({children}: {children?: React.ReactNode}) =>
    React.createElement('div', {'data-testid': 'column'}, children),
  TableHeader: ({children}: {children?: React.ReactNode}) =>
    React.createElement('div', {'data-testid': 'table-header'}, children),
  TableBody: ({children}: {children?: React.ReactNode}) =>
    React.createElement('div', {'data-testid': 'table-body'}, children),
  Section: ({children}: {children?: React.ReactNode}) =>
    React.createElement('div', {'data-testid': 'table-section'}, children),
  Row: ({children}: {children?: React.ReactNode}) =>
    React.createElement('div', {'data-testid': 'table-row'}, children),
  Cell: ({children}: {children?: React.ReactNode}) =>
    React.createElement('div', {'data-testid': 'table-cell'}, children)
}));
