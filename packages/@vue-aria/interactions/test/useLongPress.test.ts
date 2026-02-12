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
import {mergeProps} from '@vue-aria/utils';
import {useLongPress} from '../src/useLongPress';
import {usePress} from '../src/usePress';

function createExpectedEvent(type: string, target: Element) {
  return {
    type,
    target,
    pointerType: 'touch',
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
    altKey: false,
    x: 0,
    y: 0
  };
}

function Example(props: any) {
  let {elementType: ElementType = 'div', ...otherProps} = props;
  let {longPressProps} = useLongPress(otherProps);
  return React.createElement(ElementType, {...longPressProps, tabIndex: 0}, 'test');
}

function ExampleWithPress(props: any) {
  let {elementType: ElementType = 'div', onPress, onPressStart, onPressEnd, ...otherProps} = props;
  let {longPressProps} = useLongPress(otherProps);
  let {pressProps} = usePress({onPress, onPressStart, onPressEnd});
  return React.createElement(ElementType, {...mergeProps(longPressProps, pressProps), tabIndex: 0}, 'test');
}

describe('useLongPress', function () {
  beforeAll(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      vi.runAllTimers();
    });
  });

  installPointerEvent();

  it('should perform a long press', function () {
    let events: any[] = [];
    let addEvent = e => events.push(e);
    let res = render(
      React.createElement(Example, {
        onLongPressStart: addEvent,
        onLongPressEnd: addEvent,
        onLongPress: addEvent
      })
    );

    let el = res.getByText('test');

    fireEvent.pointerDown(el, {pointerType: 'touch'});
    expect(events).toEqual([
      createExpectedEvent('longpressstart', el)
    ]);

    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(events).toEqual([
      createExpectedEvent('longpressstart', el)
    ]);

    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(events).toEqual([
      createExpectedEvent('longpressstart', el),
      createExpectedEvent('longpressend', el),
      createExpectedEvent('longpress', el)
    ]);

    fireEvent.pointerUp(el, {pointerType: 'touch'});
    expect(events).toEqual([
      createExpectedEvent('longpressstart', el),
      createExpectedEvent('longpressend', el),
      createExpectedEvent('longpress', el)
    ]);
  });

  it('should cancel if pointer ends before timeout', function () {
    let events: any[] = [];
    let addEvent = e => events.push(e);
    let res = render(
      React.createElement(Example, {
        onLongPressStart: addEvent,
        onLongPressEnd: addEvent,
        onLongPress: addEvent
      })
    );

    let el = res.getByText('test');

    fireEvent.pointerDown(el, {pointerType: 'touch'});
    act(() => {
      vi.advanceTimersByTime(200);
    });
    fireEvent.pointerUp(el, {pointerType: 'touch'});

    act(() => {
      vi.advanceTimersByTime(800);
    });
    expect(events).toEqual([
      createExpectedEvent('longpressstart', el),
      createExpectedEvent('longpressend', el)
    ]);
  });

  it('should cancel other press events', function () {
    let events: any[] = [];
    let addEvent = e => events.push(e);
    let res = render(
      React.createElement(ExampleWithPress, {
        onLongPressStart: addEvent,
        onLongPressEnd: addEvent,
        onLongPress: addEvent,
        onPressStart: addEvent,
        onPressEnd: addEvent,
        onPress: addEvent
      })
    );

    let el = res.getByText('test');

    fireEvent.pointerDown(el, {pointerType: 'touch'});
    act(() => {
      vi.advanceTimersByTime(600);
    });
    fireEvent.pointerUp(el, {pointerType: 'touch'});

    expect(events).toEqual([
      createExpectedEvent('longpressstart', el),
      createExpectedEvent('pressstart', el),
      createExpectedEvent('longpressend', el),
      createExpectedEvent('pressend', el),
      createExpectedEvent('longpress', el)
    ]);
  });

  it('should not cancel press events if pointer ends before timer', function () {
    let events: any[] = [];
    let addEvent = e => events.push(e);
    let res = render(
      React.createElement(ExampleWithPress, {
        onLongPressStart: addEvent,
        onLongPressEnd: addEvent,
        onLongPress: addEvent,
        onPressStart: addEvent,
        onPressEnd: addEvent,
        onPress: addEvent
      })
    );

    let el = res.getByText('test');

    fireEvent.pointerDown(el, {pointerType: 'touch'});
    act(() => {
      vi.advanceTimersByTime(300);
    });
    fireEvent.pointerUp(el, {pointerType: 'touch'});
    fireEvent.click(el, {detail: 1});

    expect(events).toEqual([
      createExpectedEvent('longpressstart', el),
      createExpectedEvent('pressstart', el),
      createExpectedEvent('longpressend', el),
      createExpectedEvent('pressend', el),
      createExpectedEvent('press', el)
    ]);
  });

  it('allows changing the threshold', function () {
    let events: any[] = [];
    let addEvent = e => events.push(e);
    let res = render(
      React.createElement(Example, {
        onLongPressStart: addEvent,
        onLongPressEnd: addEvent,
        onLongPress: addEvent,
        threshold: 800
      })
    );

    let el = res.getByText('test');

    fireEvent.pointerDown(el, {pointerType: 'touch'});
    act(() => {
      vi.advanceTimersByTime(600);
    });
    expect(events).toEqual([
      createExpectedEvent('longpressstart', el)
    ]);

    act(() => {
      vi.advanceTimersByTime(800);
    });
    expect(events).toEqual([
      createExpectedEvent('longpressstart', el),
      createExpectedEvent('longpressend', el),
      createExpectedEvent('longpress', el)
    ]);
  });

  it('supports accessibilityDescription', function () {
    let res = render(
      React.createElement(Example, {
        accessibilityDescription: 'Long press to open menu',
        onLongPress: () => {}
      })
    );

    let el = res.getByText('test');
    expect(el.getAttribute('aria-describedby')).not.toBeNull();

    let description = document.getElementById(el.getAttribute('aria-describedby')!);
    expect(description?.textContent).toBe('Long press to open menu');
  });

  it('does not show accessibilityDescription if disabled', function () {
    let res = render(
      React.createElement(Example, {
        accessibilityDescription: 'Long press to open menu',
        onLongPress: () => {},
        isDisabled: true
      })
    );

    let el = res.getByText('test');
    expect(el.getAttribute('aria-describedby')).toBeNull();
  });

  it('does not show accessibilityDescription if no onLongPress handler', function () {
    let res = render(
      React.createElement(Example, {accessibilityDescription: 'Long press to open menu'})
    );

    let el = res.getByText('test');
    expect(el.getAttribute('aria-describedby')).toBeNull();
  });

  it('prevents context menu events on touch', function () {
    let res = render(React.createElement(Example, {onLongPress: () => {}}));

    let el = res.getByText('test');
    fireEvent.pointerDown(el, {pointerType: 'touch'});
    act(() => {
      vi.advanceTimersByTime(600);
    });

    let performDefault = fireEvent.contextMenu(el);
    expect(performDefault).toBe(false);

    fireEvent.pointerUp(el, {pointerType: 'touch'});
  });

  it('should not fire any events for keyboard interactions', function () {
    let events: any[] = [];
    let addEvent = e => events.push(e);
    let res = render(
      React.createElement(Example, {
        onLongPressStart: addEvent,
        onLongPressEnd: addEvent,
        onLongPress: addEvent,
        threshold: 800
      })
    );

    let el = res.getByText('test');
    fireEvent.keyDown(el, {key: ' '});
    act(() => {
      vi.advanceTimersByTime(600);
    });
    fireEvent.keyUp(el, {key: ' '});

    expect(events).toHaveLength(0);
  });
});
