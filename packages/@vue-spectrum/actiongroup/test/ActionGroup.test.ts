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
import {render, screen, within} from '@testing-library/react';

import './testSetup';
import {ActionGroup} from '../src';

describe('ActionGroup', () => {
  it('handles defaults', () => {
    render(
      React.createElement(
        ActionGroup,
        null,
        React.createElement('div', {key: '1'}, 'Click me 1'),
        React.createElement('div', {key: '2'}, 'Click me 2')
      )
    );

    let group = screen.getByRole('toolbar');
    expect(group).toBeTruthy();
    expect(within(group).getAllByRole('button')).toHaveLength(2);
  });

  it('handles vertical orientation', () => {
    render(
      React.createElement(
        ActionGroup,
        {orientation: 'vertical'},
        React.createElement('div', {key: '1'}, 'Click me')
      )
    );

    expect(screen.getByRole('toolbar').getAttribute('aria-orientation')).toBe('vertical');
  });

  it('handles disabled single selection', () => {
    render(
      React.createElement(
        ActionGroup,
        {
          selectionMode: 'single',
          isDisabled: true
        },
        React.createElement('div', {key: '1'}, 'Click me')
      )
    );

    expect(screen.getByRole('radiogroup').getAttribute('aria-disabled')).toBe('true');
  });
});
