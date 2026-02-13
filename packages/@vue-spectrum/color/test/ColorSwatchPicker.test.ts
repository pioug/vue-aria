/*
 * Copyright 2024 Adobe. All rights reserved.
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
import {ColorSwatch, ColorSwatchPicker} from '../src';

let red = {
  toString: () => 'rgb(255, 0, 0)',
  getChannelValue: () => 1
};

let blue = {
  toString: () => 'rgb(0, 0, 255)',
  getChannelValue: () => 1
};

describe('ColorSwatchPicker', () => {
  it('renders listbox options for swatches', () => {
    render(
      React.createElement(
        ColorSwatchPicker,
        {
          'aria-label': 'Swatches'
        },
        React.createElement(ColorSwatch, {color: red, 'aria-label': 'Red'}),
        React.createElement(ColorSwatch, {color: blue, 'aria-label': 'Blue'})
      )
    );

    expect(screen.getByRole('listbox')).toBeTruthy();
    expect(screen.getAllByRole('option')).toHaveLength(2);
    expect(screen.getByLabelText('Red')).toBeTruthy();
    expect(screen.getByLabelText('Blue')).toBeTruthy();
  });
});
