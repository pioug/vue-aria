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
import {ColorField} from '../src';

describe('ColorField', () => {
  it('renders a hex color text field', () => {
    render(React.createElement(ColorField, {'aria-label': 'Hex color'}));
    expect(screen.getByRole('textbox')).toBeTruthy();
  });

  it('renders a channel field with hidden form input', () => {
    let {container} = render(
      React.createElement(ColorField, {
        channel: 'red',
        name: 'red-value',
        'aria-label': 'Red channel'
      })
    );

    expect(screen.getByRole('textbox')).toBeTruthy();
    let hidden = container.querySelector('input[type="hidden"][name="red-value"]');
    expect(hidden).toBeTruthy();
    expect(hidden?.getAttribute('value')).toBe('255');
  });
});
