/*
 * Copyright 2025 Adobe. All rights reserved.
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
import {Focusable} from '../src';

describe('Focusable', function () {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should apply focusable props to child element', async function () {
    let user = userEvent.setup();
    let onFocus = vi.fn();
    let onBlur = vi.fn();
    let onKeyDown = vi.fn();
    let {getByRole} = render(
      React.createElement(
        Focusable,
        {onFocus, onKeyDown, onBlur},
        React.createElement('span', {role: 'button'}, 'Button')
      )
    );

    let button = getByRole('button');
    expect(button.getAttribute('tabindex')).toBe('0');

    await user.tab();
    expect(onFocus).toHaveBeenCalled();

    await user.keyboard('a');
    expect(onKeyDown).toHaveBeenCalled();

    await user.tab();
    expect(onBlur).toHaveBeenCalled();
  });

  it('supports isDisabled', function () {
    let {getByRole} = render(
      React.createElement(
        Focusable,
        {isDisabled: true},
        React.createElement('span', {role: 'button'}, 'Button')
      )
    );

    let button = getByRole('button');
    expect(button.getAttribute('tabindex')).toBeNull();
  });

  it('supports excludeFromTabOrder', function () {
    let {getByRole} = render(
      React.createElement(
        Focusable,
        {excludeFromTabOrder: true},
        React.createElement('span', {role: 'button'}, 'Button')
      )
    );

    let button = getByRole('button');
    expect(button.getAttribute('tabindex')).toBe('-1');
  });

  it('supports autoFocus', function () {
    let {getByRole} = render(
      React.createElement(
        Focusable,
        {autoFocus: true},
        React.createElement('span', {role: 'button'}, 'Button')
      )
    );

    let button = getByRole('button');
    expect(document.activeElement).toBe(button);
  });

  it('should merge with existing props', function () {
    let {getByRole} = render(
      React.createElement(
        Focusable,
        null,
        React.createElement('button', {tabIndex: -1}, 'Button')
      )
    );

    let button = getByRole('button');
    expect(button.getAttribute('tabindex')).toBe('-1');
  });

  it('should merge with existing ref', function () {
    let ref1 = React.createRef<any>();
    let ref2 = React.createRef<any>();
    let {getByRole} = render(
      React.createElement(
        Focusable,
        {ref: ref1},
        React.createElement('button', {ref: ref2}, 'Button')
      )
    );

    let button = getByRole('button');
    expect(ref1.current).toBe(button);
    expect(ref2.current).toBe(button);
  });

  it('should error if component does not forward its ref', function () {
    let spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    let Component = () => React.createElement('span', {role: 'button'}, 'Hi');
    render(
      React.createElement(
        Focusable,
        null,
        React.createElement(Component, null, 'Button')
      )
    );

    expect(spy).toHaveBeenCalledWith('<Focusable> child must forward its ref to a DOM element.');
  });

  it('should error if component does not forward its ref to a DOM element', function () {
    let spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    let Component = React.forwardRef((_, ref) => {
      React.useImperativeHandle(ref, () => ({something: true}));
      return React.createElement('button', null, 'Test');
    });

    render(
      React.createElement(
        Focusable,
        null,
        React.createElement(Component, null, 'Button')
      )
    );

    expect(spy).toHaveBeenCalledWith('<Focusable> child must forward its ref to a DOM element.');
  });

  it('should warn if child is not focusable', function () {
    let spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    let Component = React.forwardRef((_, ref) => React.createElement('span', {role: 'button', ref}, 'Hi'));
    render(
      React.createElement(
        Focusable,
        null,
        React.createElement(Component, null, 'Button')
      )
    );

    expect(spy).toHaveBeenCalledWith('<Focusable> child must be focusable. Please ensure the tabIndex prop is passed through.');
  });

  it('should warn if child does not have a role', function () {
    let spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      React.createElement(
        Focusable,
        null,
        React.createElement('span', null, 'Trigger')
      )
    );

    expect(spy).toHaveBeenCalledWith('<Focusable> child must have an interactive ARIA role.');
  });

  it('should warn if child does not have an interactive role', function () {
    let spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      React.createElement(
        Focusable,
        null,
        React.createElement('span', {role: 'presentation'}, 'Trigger')
      )
    );

    expect(spy).toHaveBeenCalledWith('<Focusable> child must have an interactive ARIA role. Got "presentation".');
  });
});
