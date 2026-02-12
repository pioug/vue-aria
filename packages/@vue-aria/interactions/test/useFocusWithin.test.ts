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
import {useFocusWithin} from '../src/useFocusWithin';

function Example(props: any) {
  let {focusWithinProps} = useFocusWithin(props);
  return React.createElement('div', {tabIndex: -1, ...focusWithinProps, 'data-testid': 'example'}, props.children);
}

describe('useFocusWithin', function () {
  it('handles focus events on the target itself', function () {
    let events: any[] = [];
    let addEvent = (e) => events.push({type: e.type, target: e.target});
    let tree = render(
      React.createElement(Example, {
        onFocusWithin: addEvent,
        onBlurWithin: addEvent,
        onFocusWithinChange: (isFocused: boolean) => events.push({type: 'focuschange', isFocused})
      })
    );

    let el = tree.getByTestId('example');
    act(() => {el.focus();});
    act(() => {el.blur();});

    expect(events).toEqual([
      {type: 'focus', target: el},
      {type: 'focuschange', isFocused: true},
      {type: 'blur', target: el},
      {type: 'focuschange', isFocused: false}
    ]);
  });

  it('does handle focus events on children', function () {
    let events: any[] = [];
    let addEvent = (e) => events.push({type: e.type, target: e.target});
    let tree = render(
      React.createElement(
        Example,
        {
          onFocusWithin: addEvent,
          onBlurWithin: addEvent,
          onFocusWithinChange: (isFocused: boolean) => events.push({type: 'focuschange', isFocused})
        },
        React.createElement('div', {'data-testid': 'child', tabIndex: -1})
      )
    );

    let el = tree.getByTestId('example');
    let child = tree.getByTestId('child');
    act(() => {child.focus();});
    act(() => {el.focus();});
    act(() => {child.focus();});
    act(() => {child.blur();});

    expect(events).toEqual([
      {type: 'focus', target: child},
      {type: 'focuschange', isFocused: true},
      {type: 'blur', target: child},
      {type: 'focuschange', isFocused: false}
    ]);
  });

  it('does not handle focus events if disabled', function () {
    let events: any[] = [];
    let addEvent = (e) => events.push({type: e.type, target: e.target});
    let tree = render(
      React.createElement(
        Example,
        {
          isDisabled: true,
          onFocusWithin: addEvent,
          onBlurWithin: addEvent,
          onFocusWithinChange: (isFocused: boolean) => events.push({type: 'focuschange', isFocused})
        },
        React.createElement('div', {'data-testid': 'child', tabIndex: -1})
      )
    );

    let child = tree.getByTestId('child');
    act(() => {child.focus();});
    act(() => {child.blur();});

    expect(events).toEqual([]);
  });

  it('events do not bubble when stopPropagation is called', function () {
    let onWrapperFocus = vi.fn();
    let onWrapperBlur = vi.fn();
    let onInnerFocus = vi.fn((e) => e.stopPropagation());
    let onInnerBlur = vi.fn((e) => e.stopPropagation());
    let tree = render(
      React.createElement(
        'div',
        {onFocus: onWrapperFocus, onBlur: onWrapperBlur},
        React.createElement(
          Example,
          {
            onFocusWithin: onInnerFocus,
            onBlurWithin: onInnerBlur
          },
          React.createElement('div', {'data-testid': 'child', tabIndex: -1})
        )
      )
    );

    let child = tree.getByTestId('child');
    act(() => {child.focus();});
    act(() => {child.blur();});

    expect(onInnerFocus).toHaveBeenCalledTimes(1);
    expect(onInnerBlur).toHaveBeenCalledTimes(1);
    expect(onWrapperFocus).not.toHaveBeenCalled();
    expect(onWrapperBlur).not.toHaveBeenCalled();
  });

  it('events bubble by default', function () {
    let onWrapperFocus = vi.fn();
    let onWrapperBlur = vi.fn();
    let onInnerFocus = vi.fn();
    let onInnerBlur = vi.fn();
    let tree = render(
      React.createElement(
        'div',
        {onFocus: onWrapperFocus, onBlur: onWrapperBlur},
        React.createElement(
          Example,
          {
            onFocusWithin: onInnerFocus,
            onBlurWithin: onInnerBlur
          },
          React.createElement('div', {'data-testid': 'child', tabIndex: -1})
        )
      )
    );

    let child = tree.getByTestId('child');
    act(() => {child.focus();});
    act(() => {child.blur();});

    expect(onInnerFocus).toHaveBeenCalledTimes(1);
    expect(onInnerBlur).toHaveBeenCalledTimes(1);
    expect(onWrapperFocus).toHaveBeenCalledTimes(1);
    expect(onWrapperBlur).toHaveBeenCalledTimes(1);
  });
});
