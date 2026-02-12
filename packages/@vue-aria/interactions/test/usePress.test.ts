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
import {act, fireEvent, render} from '@testing-library/react';
import {installPointerEvent} from '@vue-aria/test-utils';
import {usePress} from '../src/usePress';

function Example(props: any) {
  let {elementType: ElementType = 'div', style, draggable, ...otherProps} = props;
  let {pressProps} = usePress(otherProps);
  return React.createElement(
    ElementType,
    {
      ...pressProps,
      style,
      tabIndex: 0,
      draggable,
      id: 'testElement'
    },
    ElementType !== 'input' ? (props.children || 'test') : undefined
  );
}

function pointerEvent(type: string, opts: Record<string, any>) {
  let evt = new Event(type, {bubbles: true, cancelable: true, composed: true});
  Object.assign(evt, {
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
    altKey: false,
    button: opts.button || 0,
    width: 1,
    height: 1
  }, opts);
  return evt;
}

function createExpectedPressEvent(type: string, target: Element, pointerType: string) {
  return {
    type,
    target,
    pointerType,
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
    altKey: false,
    x: 0,
    y: 0
  };
}

describe('usePress', function () {
  beforeAll(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      vi.runAllTimers();
    });
  });

  describe('pointer events', function () {
    installPointerEvent();

    it('should fire press events based on pointer events with pointerType=mouse', function () {
      let events: any[] = [];
      let addEvent = e => events.push(e);
      let res = render(
        React.createElement(Example, {
          onPressStart: addEvent,
          onPressEnd: addEvent,
          onPressChange: pressed => addEvent({type: 'presschange', pressed}),
          onPress: addEvent,
          onPressUp: addEvent,
          onClick: e => addEvent({type: e.type, target: e.target})
        })
      );

      let el = res.getByText('test');
      fireEvent(el, pointerEvent('pointerover', {pointerId: 1, pointerType: 'mouse', clientX: 0, clientY: 0}));

      let shouldFireMouseEvents = fireEvent(el, pointerEvent('pointerdown', {pointerId: 1, pointerType: 'mouse', clientX: 0, clientY: 0}));
      expect(shouldFireMouseEvents).toBe(true);

      let shouldFocus = fireEvent.mouseDown(el);
      expect(shouldFocus).toBe(true);
      act(() => {
        el.focus();
      });

      fireEvent(el, pointerEvent('pointerup', {pointerId: 1, pointerType: 'mouse', clientX: 0, clientY: 0}));
      fireEvent.mouseUp(el);
      let shouldClick = fireEvent.click(el);
      expect(shouldClick).toBe(true);
      fireEvent(el, pointerEvent('pointerout', {pointerId: 1, pointerType: 'mouse', clientX: 0, clientY: 0}));

      expect(events).toEqual([
        createExpectedPressEvent('pressstart', el, 'mouse'),
        {type: 'presschange', pressed: true},
        createExpectedPressEvent('pressup', el, 'mouse'),
        createExpectedPressEvent('pressend', el, 'mouse'),
        {type: 'presschange', pressed: false},
        createExpectedPressEvent('press', el, 'mouse'),
        {type: 'click', target: el}
      ]);
    });

    it('should fire press events based on pointer events with pointerType=touch', function () {
      let events: any[] = [];
      let addEvent = e => events.push(e);
      let res = render(
        React.createElement(Example, {
          onPressStart: addEvent,
          onPressEnd: addEvent,
          onPressChange: pressed => addEvent({type: 'presschange', pressed}),
          onPress: addEvent,
          onPressUp: addEvent,
          onClick: e => addEvent({type: e.type, target: e.target})
        })
      );

      let el = res.getByText('test');
      fireEvent(el, pointerEvent('pointerover', {pointerId: 1, pointerType: 'touch', clientX: 0, clientY: 0}));

      let shouldFireCompatibilityEvents = fireEvent(el, pointerEvent('pointerdown', {pointerId: 1, pointerType: 'touch', clientX: 0, clientY: 0}));
      expect(shouldFireCompatibilityEvents).toBe(true);

      let shouldFocus = true;
      shouldFocus = shouldFireCompatibilityEvents = fireEvent.touchStart(el, {targetTouches: [{identifier: 1, clientX: 0, clientY: 0}]});
      expect(shouldFireCompatibilityEvents).toBe(true);
      expect(shouldFocus).toBe(true);

      fireEvent(el, pointerEvent('pointerup', {pointerId: 1, pointerType: 'mouse', clientX: 0, clientY: 0}));
      fireEvent(el, pointerEvent('pointerout', {pointerId: 1, pointerType: 'mouse', clientX: 0, clientY: 0}));

      shouldFocus = fireEvent.touchEnd(el, {targetTouches: [{identifier: 1, clientX: 0, clientY: 0}]});
      shouldFocus = fireEvent.mouseDown(el);
      expect(shouldFocus).toBe(true);
      act(() => {
        el.focus();
      });

      fireEvent.mouseUp(el);
      fireEvent.click(el);

      expect(events).toEqual([
        createExpectedPressEvent('pressstart', el, 'touch'),
        {type: 'presschange', pressed: true},
        createExpectedPressEvent('pressup', el, 'touch'),
        createExpectedPressEvent('pressend', el, 'touch'),
        {type: 'presschange', pressed: false},
        createExpectedPressEvent('press', el, 'touch'),
        {type: 'click', target: el}
      ]);
    });
  });
});
