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
import {Breadcrumbs} from '../src';

describe('Breadcrumbs', () => {
  it('handles defaults', () => {
    render(
      React.createElement(
        Breadcrumbs,
        {
          id: 'breadcrumbs-id',
          'aria-label': 'breadcrumbs-test'
        },
        React.createElement('div', {key: '1'}, 'Folder 1')
      )
    );

    let breadcrumbs = screen.getByLabelText('breadcrumbs-test');
    expect(breadcrumbs.id).toBe('breadcrumbs-id');
  });

  it('handles UNSAFE_className and size', () => {
    render(
      React.createElement(
        Breadcrumbs,
        {
          UNSAFE_className: 'test-class',
          size: 'S'
        },
        React.createElement('div', {key: '1'}, 'Folder 1')
      )
    );

    let breadcrumbs = screen.getByRole('list');
    expect(breadcrumbs.className).toContain('test-class');
    expect(breadcrumbs.className).toContain('spectrum-Breadcrumbs--small');
  });

  it('handles multiple items', () => {
    render(
      React.createElement(
        Breadcrumbs,
        null,
        React.createElement('div', {key: '1'}, 'Folder 1'),
        React.createElement('div', {key: '2'}, 'Folder 2'),
        React.createElement('div', {key: '3'}, 'Folder 3')
      )
    );

    let item1 = screen.getByText('Folder 1');
    let item2 = screen.getByText('Folder 2');
    let item3 = screen.getByText('Folder 3');

    expect(item1.tabIndex).toBe(0);
    expect(item1.hasAttribute('aria-current')).toBe(false);
    expect(item2.tabIndex).toBe(0);
    expect(item2.hasAttribute('aria-current')).toBe(false);
    expect(item3.tabIndex).toBe(-1);
    expect(item3.getAttribute('aria-current')).toBe('page');
  });
});
