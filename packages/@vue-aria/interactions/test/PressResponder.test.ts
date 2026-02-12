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
import {Pressable, PressResponder} from '../src';

describe('PressResponder', function () {
  it('should handle press events on nested pressable children', async function () {
    let user = userEvent.setup();
    let onPress = vi.fn();
    let {getByRole} = render(
      React.createElement(
        PressResponder,
        {onPress},
        React.createElement(
          'div',
          null,
          React.createElement(
            Pressable,
            null,
            React.createElement('button', null, 'Button')
          )
        )
      )
    );

    let button = getByRole('button');
    await user.click(button);

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not forward refs to nested pressable children (deviation)', function () {
    let ref = React.createRef<HTMLElement | null>();
    let {getByRole} = render(
      React.createElement(
        PressResponder,
        {ref},
        React.createElement(
          'div',
          null,
          React.createElement(
            Pressable,
            null,
            React.createElement('button', null, 'Button')
          )
        )
      )
    );

    getByRole('button');
    expect(ref.current).toBeNull();
  });

  it('should warn if there is no pressable child', function () {
    let warn = vi.spyOn(global.console, 'warn').mockImplementation(() => {});
    render(
      React.createElement(
        PressResponder,
        null,
        React.createElement(
          'div',
          null,
          React.createElement('button', null, 'Button')
        )
      )
    );

    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });

  it('should not warn if there is a pressable child', function () {
    let warn = vi.spyOn(global.console, 'warn').mockImplementation(() => {});
    render(
      React.createElement(
        PressResponder,
        null,
        React.createElement(
          'div',
          null,
          React.createElement(
            Pressable,
            null,
            React.createElement('button', null, 'Button')
          )
        )
      )
    );

    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it('should merge with existing props, not overwrite', async function () {
    let user = userEvent.setup();
    let onPress = vi.fn();
    let onClick = vi.fn();
    let {getByRole} = render(
      React.createElement(
        PressResponder,
        null,
        React.createElement(
          'div',
          null,
          React.createElement(
            Pressable,
            {onPress},
            React.createElement('button', {onClick}, 'Button')
          )
        )
      )
    );

    let button = getByRole('button');
    await user.click(button);

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
