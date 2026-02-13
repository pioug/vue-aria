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
import {ColorPicker} from '../src';

describe('ColorPicker', () => {
  it('renders trigger and dialog content', () => {
    render(
      React.createElement(
        ColorPicker,
        {
          label: 'Pick a color'
        },
        React.createElement('div', null, 'Editor content')
      )
    );

    expect(screen.getByTestId('aria-color-picker')).toBeTruthy();
    expect(screen.getByRole('button')).toBeTruthy();
    expect(screen.getByText('Pick a color')).toBeTruthy();
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getByText('Editor content')).toBeTruthy();
  });
});
