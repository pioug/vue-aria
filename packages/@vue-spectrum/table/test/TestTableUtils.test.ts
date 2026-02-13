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
import {Cell, Column, Row, Section, TableBody, TableHeader} from '../src';

describe('TestTableUtils', () => {
  it('exports table collection building blocks', () => {
    render(
      React.createElement(
        'div',
        null,
        React.createElement(Column, null, 'Name'),
        React.createElement(TableHeader, null, 'Header'),
        React.createElement(TableBody, null, 'Body'),
        React.createElement(Section, null, 'Section'),
        React.createElement(Row, null, 'Row'),
        React.createElement(Cell, null, 'Cell')
      )
    );

    expect(screen.getByTestId('column')).toBeTruthy();
    expect(screen.getByTestId('table-header')).toBeTruthy();
    expect(screen.getByTestId('table-body')).toBeTruthy();
    expect(screen.getByTestId('table-section')).toBeTruthy();
    expect(screen.getByTestId('table-row')).toBeTruthy();
    expect(screen.getByTestId('table-cell')).toBeTruthy();
  });
});
