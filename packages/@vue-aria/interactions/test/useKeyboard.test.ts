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
import {act, render} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {useKeyboard} from '../src/useKeyboard';

function Example(props: any) {
  let {keyboardProps} = useKeyboard(props);
  return React.createElement('div', {tabIndex: -1, ...keyboardProps, 'data-testid': 'example'}, props.children);
}

describe('useKeyboard', function () {
  it('should handle keyboard events', async function () {
    let user = userEvent.setup();
    let events: Array<{type: string, target: EventTarget | null}> = [];
    let addEvent = (e) => events.push({type: e.type, target: e.target});
    let tree = render(
      React.createElement(Example, {
        onKeyDown: addEvent,
        onKeyUp: addEvent
      })
    );

    let el = tree.getByTestId('example');
    act(() => el.focus());
    await user.keyboard('A');

    expect(events).toEqual([
      {type: 'keydown', target: el},
      {type: 'keyup', target: el}
    ]);
  });

  it('should not handle events when disabled', async function () {
    let user = userEvent.setup();
    let events: Array<{type: string, target: EventTarget | null}> = [];
    let addEvent = (e) => events.push({type: e.type, target: e.target});
    let tree = render(
      React.createElement(Example, {
        isDisabled: true,
        onKeyDown: addEvent,
        onKeyUp: addEvent
      })
    );

    let el = tree.getByTestId('example');
    act(() => el.focus());
    await user.keyboard('A');

    expect(events).toEqual([]);
  });

  it('events do not bubble by default', async function () {
    let user = userEvent.setup();
    let onWrapperKeyDown = vi.fn();
    let onWrapperKeyUp = vi.fn();
    let onInnerKeyDown = vi.fn();
    let onInnerKeyUp = vi.fn();
    let tree = render(
      React.createElement(
        'button',
        {onKeyDown: onWrapperKeyDown, onKeyUp: onWrapperKeyUp},
        React.createElement(Example, {
          onKeyDown: onInnerKeyDown,
          onKeyUp: onInnerKeyUp
        })
      )
    );

    let el = tree.getByTestId('example');
    act(() => el.focus());
    await user.keyboard('A');

    expect(onInnerKeyDown).toHaveBeenCalledTimes(1);
    expect(onInnerKeyUp).toHaveBeenCalledTimes(1);
    expect(onWrapperKeyDown).not.toHaveBeenCalled();
    expect(onWrapperKeyUp).not.toHaveBeenCalled();
  });

  it('events bubble when continuePropagation is called', async function () {
    let user = userEvent.setup();
    let onWrapperKeyDown = vi.fn();
    let onWrapperKeyUp = vi.fn();
    let onInnerKeyDown = vi.fn((e) => e.continuePropagation());
    let onInnerKeyUp = vi.fn((e) => e.continuePropagation());
    let tree = render(
      React.createElement(
        'button',
        {onKeyDown: onWrapperKeyDown, onKeyUp: onWrapperKeyUp},
        React.createElement(Example, {
          onKeyDown: onInnerKeyDown,
          onKeyUp: onInnerKeyUp
        })
      )
    );

    let el = tree.getByTestId('example');
    act(() => el.focus());
    await user.keyboard('A');

    expect(onInnerKeyDown).toHaveBeenCalledTimes(1);
    expect(onInnerKeyUp).toHaveBeenCalledTimes(1);
    expect(onWrapperKeyDown).toHaveBeenCalledTimes(1);
    expect(onWrapperKeyUp).toHaveBeenCalledTimes(1);
  });
});
