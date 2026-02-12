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
import {Pressable} from '../src/Pressable';

describe('Pressable', function () {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should apply press events to child element', async function () {
    let user = userEvent.setup();
    let onPress = vi.fn();
    let {getByRole} = render(
      React.createElement(
        Pressable,
        {onPress},
        React.createElement('button', null, 'Button')
      )
    );

    let button = getByRole('button');
    await user.click(button);

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('should merge with existing props, not overwrite', async function () {
    let user = userEvent.setup();
    let onPress = vi.fn();
    let onClick = vi.fn();
    let {getByRole} = render(
      React.createElement(
        Pressable,
        {onPress},
        React.createElement('button', {onClick}, 'Button')
      )
    );

    let button = getByRole('button');
    await user.click(button);

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should merge with existing ref', function () {
    let ref1 = React.createRef<any>();
    let ref2 = React.createRef<any>();
    let {getByRole} = render(
      React.createElement(
        Pressable,
        {ref: ref1},
        React.createElement('button', {ref: ref2}, 'Button')
      )
    );

    let button = getByRole('button');
    expect(ref1.current).toBe(button);
    expect(ref2.current).toBe(button);
  });

  it('should automatically make child focusable', function () {
    let {getByRole} = render(
      React.createElement(
        Pressable,
        null,
        React.createElement('span', {role: 'button'}, 'Button')
      )
    );

    let button = getByRole('button');
    expect(button.getAttribute('tabindex')).toBe('0');
  });

  it('should error if component does not forward its ref', function () {
    let spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    let Component = () => React.createElement('button', null, 'Hi');
    render(
      React.createElement(
        Pressable,
        null,
        React.createElement(Component, null, 'Button')
      )
    );

    expect(spy).toHaveBeenCalledWith('<Pressable> child must forward its ref to a DOM element.');
  });

  it('should error if component does not forward its ref to a DOM element', function () {
    let spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    let Component = React.forwardRef((_, ref) => {
      React.useImperativeHandle(ref, () => ({something: true}));
      return React.createElement('button', null, 'Test');
    });

    render(
      React.createElement(
        Pressable,
        null,
        React.createElement(Component, null, 'Button')
      )
    );

    expect(spy).toHaveBeenCalledWith('<Pressable> child must forward its ref to a DOM element.');
  });

  it('should warn if child is not focusable', function () {
    let spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    let Component = React.forwardRef((_, ref) => React.createElement('span', {role: 'button', ref}, 'Hi'));
    render(
      React.createElement(
        Pressable,
        null,
        React.createElement(Component, null, 'Button')
      )
    );

    expect(spy).toHaveBeenCalledWith('<Pressable> child must be focusable. Please ensure the tabIndex prop is passed through.');
  });

  it('supports isDisabled', function () {
    let spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    let {getByRole} = render(
      React.createElement(
        Pressable,
        {isDisabled: true},
        React.createElement('span', {role: 'button'}, 'Button')
      )
    );

    let button = getByRole('button');
    expect(button.getAttribute('tabindex')).toBeNull();
    expect(spy).not.toHaveBeenCalled();
  });

  it('should warn if child does not have a role', function () {
    let spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      React.createElement(
        Pressable,
        null,
        React.createElement('span', null, 'Trigger')
      )
    );

    expect(spy).toHaveBeenCalledWith('<Pressable> child must have an interactive ARIA role.');
  });

  it('should warn if child does not have an interactive role', function () {
    let spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      React.createElement(
        Pressable,
        null,
        React.createElement('span', {role: 'presentation'}, 'Trigger')
      )
    );

    expect(spy).toHaveBeenCalledWith('<Pressable> child must have an interactive ARIA role. Got \"presentation\".');
  });
});
