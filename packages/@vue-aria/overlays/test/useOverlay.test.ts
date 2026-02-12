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

import {renderHook} from '@testing-library/react';
import {useOverlay} from '../src/useOverlay';

const {interactOutsideState} = vi.hoisted(() => ({
  interactOutsideState: {
    options: null as any
  }
}));

vi.mock('@vue-aria/interactions', () => ({
  useInteractOutside: (options: any) => {
    interactOutsideState.options = options;
  },
  useFocusWithin: () => ({
    focusWithinProps: {}
  })
}));

vi.mock('@vue-aria/focus', () => ({
  isElementInChildOfActiveScope: () => false
}));

function createPointerEvent(target: Element) {
  return {
    target,
    stopPropagation: vi.fn(),
    preventDefault: vi.fn()
  } as any;
}

describe('useOverlay', function () {
  beforeEach(() => {
    interactOutsideState.options = null;
  });

  it('hides the overlay when pressing Escape', function () {
    let onClose = vi.fn();
    let ref = {current: document.createElement('div')};
    let {result} = renderHook(() => useOverlay({isOpen: true, onClose}, ref));

    let stopPropagation = vi.fn();
    let preventDefault = vi.fn();
    (result.current.overlayProps.onKeyDown as any)({
      key: 'Escape',
      nativeEvent: {isComposing: false},
      stopPropagation,
      preventDefault
    });

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(stopPropagation).toHaveBeenCalledTimes(1);
    expect(preventDefault).toHaveBeenCalledTimes(1);
  });

  it('does not hide the overlay when keyboard dismiss is disabled', function () {
    let onClose = vi.fn();
    let ref = {current: document.createElement('div')};
    let {result} = renderHook(() => useOverlay({isOpen: true, onClose, isKeyboardDismissDisabled: true}, ref));

    (result.current.overlayProps.onKeyDown as any)({
      key: 'Escape',
      nativeEvent: {isComposing: false},
      stopPropagation: vi.fn(),
      preventDefault: vi.fn()
    });

    expect(onClose).not.toHaveBeenCalled();
  });

  it('wires interact outside close behavior when dismissable', function () {
    let onClose = vi.fn();
    let refElement = document.createElement('div');
    let ref = {current: refElement};
    renderHook(() => useOverlay({isOpen: true, onClose, isDismissable: true}, ref));

    expect(interactOutsideState.options).toBeTruthy();
    expect(typeof interactOutsideState.options.onInteractOutsideStart).toBe('function');
    expect(typeof interactOutsideState.options.onInteractOutside).toBe('function');

    let startEvent = createPointerEvent(document.body);
    interactOutsideState.options.onInteractOutsideStart(startEvent);
    let endEvent = createPointerEvent(document.body);
    interactOutsideState.options.onInteractOutside(endEvent);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not close when shouldCloseOnInteractOutside returns false', function () {
    let onClose = vi.fn();
    let refElement = document.createElement('div');
    let ref = {current: refElement};
    renderHook(() => useOverlay({
      isOpen: true,
      onClose,
      isDismissable: true,
      shouldCloseOnInteractOutside: (el: Element) => el !== document.body
    }, ref));

    let startEvent = createPointerEvent(document.body);
    interactOutsideState.options.onInteractOutsideStart(startEvent);
    let endEvent = createPointerEvent(document.body);
    interactOutsideState.options.onInteractOutside(endEvent);

    expect(onClose).not.toHaveBeenCalled();
  });

  it('prevents default on pointer down on underlay', function () {
    let ref = {current: document.createElement('div')};
    let {result} = renderHook(() => useOverlay({isOpen: true}, ref));
    let currentTarget = document.createElement('div');
    let preventDefault = vi.fn();

    (result.current.underlayProps.onPointerDown as any)({
      target: currentTarget,
      currentTarget,
      preventDefault
    });

    expect(preventDefault).toHaveBeenCalledTimes(1);
  });
});
