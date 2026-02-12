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
import userEvent from '@testing-library/user-event';
import {VisuallyHidden} from '../src';

describe('VisuallyHidden', function () {
  it('hides element', async function () {
    let user = userEvent.setup();
    let {getAllByRole} = render(
      React.createElement(
        React.Fragment,
        null,
        React.createElement('button', null, 'This is button A'),
        React.createElement(
          VisuallyHidden,
          null,
          React.createElement('button', null, 'With no isFocusable, I should not show my text on focus')
        ),
        React.createElement('button', null, 'This is button C')
      )
    );

    let buttons = getAllByRole('button');
    await user.tab();

    expect(document.activeElement).toBe(buttons[0]);
    let hiddenStyle = buttons[1].parentElement?.getAttribute('style');
    expect(hiddenStyle?.length ?? 0).toBeGreaterThan(0);

    await user.tab();

    expect(document.activeElement).toBe(buttons[1]);
    expect(buttons[1].parentElement?.getAttribute('style')).toEqual(hiddenStyle);
  });

  it('unhides element if focused and isFocusable', async function () {
    let user = userEvent.setup();
    let {getAllByRole} = render(
      React.createElement(
        React.Fragment,
        null,
        React.createElement('button', null, 'This is button A'),
        React.createElement(
          VisuallyHidden,
          {isFocusable: true},
          React.createElement('button', null, 'With isFocusable, I should show my text on focus')
        ),
        React.createElement('button', null, 'This is button C')
      )
    );

    let buttons = getAllByRole('button');
    await user.tab();

    expect(document.activeElement).toBe(buttons[0]);
    let hiddenStyle = buttons[1].parentElement?.getAttribute('style');
    expect(hiddenStyle?.length ?? 0).toBeGreaterThan(0);

    await user.tab();

    expect(document.activeElement).toBe(buttons[1]);
    expect(buttons[1].parentElement?.getAttribute('style')).not.toEqual(hiddenStyle);
    expect(buttons[1].parentElement?.getAttribute('style') ?? '').toHaveLength(0);
  });
});
