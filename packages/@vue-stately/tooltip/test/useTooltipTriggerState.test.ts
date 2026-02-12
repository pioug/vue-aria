/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {act, renderHook} from '@testing-library/react';
import {useTooltipTriggerState} from '../src/useTooltipTriggerState';

const TOOLTIP_DELAY = 1500;

describe('useTooltipTriggerState', function () {
  beforeAll(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      vi.runAllTimers();
    });
  });

  it('opens after the configured delay', function () {
    let onOpenChange = vi.fn();
    let {result} = renderHook(() => useTooltipTriggerState({onOpenChange}));

    act(() => {
      result.current.open();
    });
    expect(onOpenChange).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(TOOLTIP_DELAY);
    });
    expect(result.current.isOpen).toBe(true);
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('respects custom closeDelay values', function () {
    let onOpenChange = vi.fn();
    let closeDelay = 100;
    let {result} = renderHook(() => useTooltipTriggerState({onOpenChange, closeDelay}));

    act(() => {
      result.current.open();
      vi.advanceTimersByTime(TOOLTIP_DELAY);
    });
    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.close();
      vi.advanceTimersByTime(closeDelay / 2);
    });
    expect(result.current.isOpen).toBe(true);

    act(() => {
      vi.advanceTimersByTime(closeDelay / 2);
    });
    expect(result.current.isOpen).toBe(false);
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('closes immediately when closeDelay is zero or negative', function () {
    let onOpenChange = vi.fn();
    let {result} = renderHook(() => useTooltipTriggerState({onOpenChange, closeDelay: 0}));

    act(() => {
      result.current.open();
      vi.advanceTimersByTime(TOOLTIP_DELAY);
    });
    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.close();
    });
    expect(result.current.isOpen).toBe(false);
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('closes the previous tooltip when opening a new one', function () {
    let onOpenChange1 = vi.fn();
    let onOpenChange2 = vi.fn();
    let one = renderHook(() => useTooltipTriggerState({onOpenChange: onOpenChange1}));
    let two = renderHook(() => useTooltipTriggerState({onOpenChange: onOpenChange2}));

    act(() => {
      one.result.current.open();
      vi.advanceTimersByTime(TOOLTIP_DELAY);
    });
    expect(one.result.current.isOpen).toBe(true);
    expect(onOpenChange1).toHaveBeenCalledWith(true);

    act(() => {
      two.result.current.open();
      vi.advanceTimersByTime(TOOLTIP_DELAY);
    });

    expect(onOpenChange1).toHaveBeenCalledWith(false);
    expect(onOpenChange2).toHaveBeenCalledWith(true);
  });
});
