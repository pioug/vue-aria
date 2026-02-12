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
import {useSpinButton} from '../src/useSpinButton';

vi.mock('@vue-aria/live-announcer', () => ({
  announce: vi.fn(),
  clearAnnouncer: vi.fn(),
  destroyAnnouncer: vi.fn()
}));

vi.mock('@vue-aria/i18n', () => ({
  useLocalizedStringFormatter: () => ({
    format: (key: string) => key
  })
}));

function createKeyboardEvent(key: string) {
  return {
    key,
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
    altKey: false,
    nativeEvent: {isComposing: false},
    preventDefault: vi.fn()
  };
}

describe('useSpinButton', function () {
  it('returns spinbutton aria props', function () {
    let {result} = renderHook(() => useSpinButton({
      value: 2,
      textValue: '2 items',
      minValue: 1,
      maxValue: 3
    }));

    expect(result.current.spinButtonProps.role).toBe('spinbutton');
    expect(result.current.spinButtonProps['aria-valuenow']).toBe(2);
    expect(result.current.spinButtonProps['aria-valuemin']).toBe(1);
    expect(result.current.spinButtonProps['aria-valuemax']).toBe(3);
    expect(result.current.spinButtonProps['aria-valuetext']).toBe('2 items');
    expect(result.current.spinButtonProps['aria-disabled']).toBeUndefined();
    expect(result.current.spinButtonProps['aria-readonly']).toBeUndefined();
  });

  it('sets aria-disabled when disabled', function () {
    let {result} = renderHook(() => useSpinButton({
      value: 2,
      isDisabled: true
    }));

    expect(result.current.spinButtonProps['aria-disabled']).toBe(true);
  });

  it('sets aria-readonly when read only', function () {
    let {result} = renderHook(() => useSpinButton({
      value: 2,
      isReadOnly: true
    }));

    expect(result.current.spinButtonProps['aria-readonly']).toBe(true);
  });

  it('calls onIncrement on ArrowUp', function () {
    let onIncrement = vi.fn();
    let {result} = renderHook(() => useSpinButton({value: 2, onIncrement}));
    let event = createKeyboardEvent('ArrowUp');

    (result.current.spinButtonProps.onKeyDown as any)(event);

    expect(onIncrement).toHaveBeenCalledTimes(1);
    expect(event.preventDefault).toHaveBeenCalledTimes(1);
  });

  it('calls onDecrement on ArrowDown', function () {
    let onDecrement = vi.fn();
    let {result} = renderHook(() => useSpinButton({value: 2, onDecrement}));
    let event = createKeyboardEvent('ArrowDown');

    (result.current.spinButtonProps.onKeyDown as any)(event);

    expect(onDecrement).toHaveBeenCalledTimes(1);
    expect(event.preventDefault).toHaveBeenCalledTimes(1);
  });

  it('calls onIncrementPage on PageUp', function () {
    let onIncrementPage = vi.fn();
    let {result} = renderHook(() => useSpinButton({value: 2, onIncrementPage}));
    let event = createKeyboardEvent('PageUp');

    (result.current.spinButtonProps.onKeyDown as any)(event);

    expect(onIncrementPage).toHaveBeenCalledTimes(1);
    expect(event.preventDefault).toHaveBeenCalledTimes(1);
  });

  it('falls back to onIncrement on PageUp', function () {
    let onIncrement = vi.fn();
    let {result} = renderHook(() => useSpinButton({value: 2, onIncrement}));
    let event = createKeyboardEvent('PageUp');

    (result.current.spinButtonProps.onKeyDown as any)(event);

    expect(onIncrement).toHaveBeenCalledTimes(1);
    expect(event.preventDefault).toHaveBeenCalledTimes(1);
  });

  it('calls onDecrementPage on PageDown', function () {
    let onDecrementPage = vi.fn();
    let {result} = renderHook(() => useSpinButton({value: 2, onDecrementPage}));
    let event = createKeyboardEvent('PageDown');

    (result.current.spinButtonProps.onKeyDown as any)(event);

    expect(onDecrementPage).toHaveBeenCalledTimes(1);
    expect(event.preventDefault).toHaveBeenCalledTimes(1);
  });

  it('falls back to onDecrement on PageDown', function () {
    let onDecrement = vi.fn();
    let {result} = renderHook(() => useSpinButton({value: 2, onDecrement}));
    let event = createKeyboardEvent('PageDown');

    (result.current.spinButtonProps.onKeyDown as any)(event);

    expect(onDecrement).toHaveBeenCalledTimes(1);
    expect(event.preventDefault).toHaveBeenCalledTimes(1);
  });

  it('calls onDecrementToMin on Home', function () {
    let onDecrementToMin = vi.fn();
    let {result} = renderHook(() => useSpinButton({value: 2, onDecrementToMin, minValue: 1}));
    let event = createKeyboardEvent('Home');

    (result.current.spinButtonProps.onKeyDown as any)(event);

    expect(onDecrementToMin).toHaveBeenCalledTimes(1);
    expect(event.preventDefault).toHaveBeenCalledTimes(1);
  });

  it('calls onIncrementToMax on End', function () {
    let onIncrementToMax = vi.fn();
    let {result} = renderHook(() => useSpinButton({value: 2, onIncrementToMax, maxValue: 3}));
    let event = createKeyboardEvent('End');

    (result.current.spinButtonProps.onKeyDown as any)(event);

    expect(onIncrementToMax).toHaveBeenCalledTimes(1);
    expect(event.preventDefault).toHaveBeenCalledTimes(1);
  });

  it('replaces hyphen with minus sign in aria-valuetext', function () {
    let {result} = renderHook(() => useSpinButton({
      value: -2,
      textValue: '-2 items'
    }));

    expect(result.current.spinButtonProps['aria-valuenow']).toBe(-2);
    expect(result.current.spinButtonProps['aria-valuetext']).toBe('−2 items');
  });
});
