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

import {FocusScope} from '../src';
import {act, render} from '@testing-library/react';
import React from 'react';

describe('FocusScope', function () {
  it('renders start and end focus scope sentinels', function () {
    let {container} = render(
      React.createElement(
        FocusScope,
        null,
        React.createElement('input', {'data-testid': 'input1'})
      )
    );

    expect(container.querySelector('[data-focus-scope-start]')).toBeTruthy();
    expect(container.querySelector('[data-focus-scope-end]')).toBeTruthy();
  });

  it('allows focusing a child element inside the scope', function () {
    let {getByTestId} = render(
      React.createElement(
        FocusScope,
        null,
        React.createElement('input', {'data-testid': 'input1'}),
        React.createElement('input', {'data-testid': 'input2'})
      )
    );

    let input1 = getByTestId('input1');
    act(() => {
      (input1 as HTMLInputElement).focus();
    });
    expect(document.activeElement).toBe(input1);
  });
});
