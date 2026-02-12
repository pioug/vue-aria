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

import {ClearSlots, SlotProvider, useSlotProps} from '../src/Slots';
import React, {useEffect} from 'react';
import {render} from '@testing-library/react';

let results: Record<string, any> = {};

function Component(props: Record<string, any>) {
  let internalResults = useSlotProps(props, 'slotname');

  useEffect(() => {
    results = internalResults;
  }, [internalResults]);

  return React.createElement('button', null, 'push me');
}

describe('Slots', () => {
  beforeEach(() => {
    results = {};
  });

  it('sets props from SlotProvider', () => {
    let slots = {
      slotname: {UNSAFE_className: 'foo', isDisabled: true, isQuiet: true}
    };

    render(
      React.createElement(
        SlotProvider,
        {slots},
        React.createElement(Component, {})
      )
    );

    expect(results).toMatchObject({
      UNSAFE_className: 'foo',
      isDisabled: true,
      isQuiet: true
    });
  });

  it('overrides local props and chains event handlers', () => {
    let onPressSlot = vi.fn();
    let onPressLocal = vi.fn();
    let slots = {
      slotname: {UNSAFE_className: 'foo', isDisabled: false, isQuiet: false, onPress: onPressSlot}
    };

    render(
      React.createElement(
        SlotProvider,
        {slots},
        React.createElement(Component, {
          UNSAFE_className: 'bar',
          isDisabled: true,
          isQuiet: true,
          onPress: onPressLocal
        })
      )
    );

    expect(results).toMatchObject({
      UNSAFE_className: expect.stringMatching(/(foo bar|bar foo)/),
      isDisabled: false,
      isQuiet: false
    });

    results.onPress?.({});
    expect(onPressSlot).toHaveBeenCalledTimes(1);
    expect(onPressLocal).toHaveBeenCalledTimes(1);
  });

  it('does not allow undefined slot props to override local props', () => {
    let slots = {
      slotname: {label: undefined}
    };

    render(
      React.createElement(
        SlotProvider,
        {slots},
        React.createElement(Component, {label: 'boop'})
      )
    );

    expect(results).toMatchObject({label: 'boop'});
  });

  it('ClearSlots removes inherited slot props', () => {
    let slots = {
      slotname: {UNSAFE_className: 'foo'}
    };

    render(
      React.createElement(
        SlotProvider,
        {slots},
        React.createElement(
          ClearSlots,
          null,
          React.createElement(Component, {})
        )
      )
    );

    expect(results.UNSAFE_className).toBeUndefined();
  });
});
