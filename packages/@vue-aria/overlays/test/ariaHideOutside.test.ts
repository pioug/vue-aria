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
import {ariaHideOutside} from '../src/ariaHideOutside';

describe('ariaHideOutside', function () {
  it('hides everything except provided element and restores on revert', function () {
    let {getByRole, getByTestId} = render(
      React.createElement(
        React.Fragment,
        null,
        React.createElement('input', {type: 'checkbox', 'data-testid': 'cb1'}),
        React.createElement('button', null, 'Button'),
        React.createElement('input', {type: 'checkbox', 'data-testid': 'cb2'})
      )
    );

    let cb1 = getByTestId('cb1');
    let cb2 = getByTestId('cb2');
    let button = getByRole('button');

    let revert = ariaHideOutside([button]);

    expect(cb1.getAttribute('aria-hidden')).toBe('true');
    expect(cb2.getAttribute('aria-hidden')).toBe('true');
    expect(button.getAttribute('aria-hidden')).toBeNull();

    revert();

    expect(cb1.getAttribute('aria-hidden')).toBeNull();
    expect(cb2.getAttribute('aria-hidden')).toBeNull();
    expect(button.getAttribute('aria-hidden')).toBeNull();
  });

  it('handles multiple calls restored out of order', function () {
    let {getByRole, getByTestId} = render(
      React.createElement(
        React.Fragment,
        null,
        React.createElement('input', {type: 'checkbox', 'data-testid': 'cb1'}),
        React.createElement('input', {type: 'radio', 'data-testid': 'r1'}),
        React.createElement('button', null, 'Button'),
        React.createElement('input', {type: 'radio', 'data-testid': 'r2'}),
        React.createElement('input', {type: 'checkbox', 'data-testid': 'cb2'})
      )
    );

    let cb1 = getByTestId('cb1');
    let cb2 = getByTestId('cb2');
    let r1 = getByTestId('r1');
    let r2 = getByTestId('r2');
    let button = getByRole('button');

    let revert1 = ariaHideOutside([button, r1, r2]);
    expect(cb1.getAttribute('aria-hidden')).toBe('true');
    expect(cb2.getAttribute('aria-hidden')).toBe('true');
    expect(r1.getAttribute('aria-hidden')).toBeNull();
    expect(r2.getAttribute('aria-hidden')).toBeNull();

    let revert2 = ariaHideOutside([button]);
    expect(cb1.getAttribute('aria-hidden')).toBe('true');
    expect(cb2.getAttribute('aria-hidden')).toBe('true');
    expect(r1.getAttribute('aria-hidden')).toBe('true');
    expect(r2.getAttribute('aria-hidden')).toBe('true');

    revert1();
    expect(cb1.getAttribute('aria-hidden')).toBe('true');
    expect(cb2.getAttribute('aria-hidden')).toBe('true');
    expect(r1.getAttribute('aria-hidden')).toBe('true');
    expect(r2.getAttribute('aria-hidden')).toBe('true');

    revert2();
    expect(cb1.getAttribute('aria-hidden')).toBeNull();
    expect(cb2.getAttribute('aria-hidden')).toBeNull();
    expect(r1.getAttribute('aria-hidden')).toBeNull();
    expect(r2.getAttribute('aria-hidden')).toBeNull();
    expect(button.getAttribute('aria-hidden')).toBeNull();
  });
});
