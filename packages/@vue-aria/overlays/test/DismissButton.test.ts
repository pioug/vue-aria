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
import {render} from '@testing-library/react';
import {DismissButton} from '../src/DismissButton';

vi.mock('@vue-aria/i18n', () => ({
  useLocalizedStringFormatter: () => ({
    format: () => 'Dismiss'
  })
}));

describe('DismissButton', function () {
  it('has a default aria-label', function () {
    let {getByRole} = render(React.createElement(DismissButton));
    let button = getByRole('button', {hidden: true});

    expect(button.getAttribute('aria-label')).toBe('Dismiss');
  });

  it('accepts an aria-label', function () {
    let {getByRole} = render(React.createElement(DismissButton, {'aria-label': 'foo'}));
    let button = getByRole('button', {hidden: true});

    expect(button.getAttribute('aria-label')).toBe('foo');
  });

  it('accepts an aria-labelledby', function () {
    let {getByRole} = render(
      React.createElement(
        React.Fragment,
        null,
        React.createElement('span', {id: 'span-id'}, 'bar'),
        React.createElement(DismissButton, {'aria-labelledby': 'span-id'})
      )
    );
    let button = getByRole('button', {hidden: true});

    expect(button.getAttribute('aria-labelledby')).toBe('span-id');
    expect(button.getAttribute('aria-label')).toBeNull();
  });

  it('accepts both aria-labelledby and aria-label', function () {
    let {getByRole} = render(
      React.createElement(
        React.Fragment,
        null,
        React.createElement('span', {id: 'span-id'}, 'bar'),
        React.createElement(DismissButton, {'aria-labelledby': 'span-id', 'aria-label': 'foo', id: 'self'})
      )
    );
    let button = getByRole('button', {hidden: true});

    expect(button.getAttribute('aria-labelledby')).toBe('self span-id');
    expect(button.getAttribute('aria-label')).toBe('foo');
  });
});
