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
import {useTooltip} from '../src/useTooltip';

vi.mock('@vue-aria/interactions', () => ({
  useHover: ({onHoverStart, onHoverEnd}: any) => ({
    hoverProps: {onHoverStart, onHoverEnd}
  })
}));

describe('useTooltip', function () {
  it('handles defaults', function () {
    let state = {
      open: vi.fn(),
      close: vi.fn()
    };
    let {result} = renderHook(() => useTooltip({}, state as any));

    expect(result.current.tooltipProps.role).toBe('tooltip');
    expect(typeof (result.current.tooltipProps as any).onHoverStart).toBe('function');
    expect(typeof (result.current.tooltipProps as any).onHoverEnd).toBe('function');
  });

  it('opens and closes on hover', function () {
    let state = {
      open: vi.fn(),
      close: vi.fn()
    };
    let {result} = renderHook(() => useTooltip({}, state as any));

    (result.current.tooltipProps as any).onHoverStart();
    expect(state.open).toHaveBeenCalledTimes(1);
    expect(state.open).toHaveBeenCalledWith(true);

    (result.current.tooltipProps as any).onHoverEnd();
    expect(state.close).toHaveBeenCalledTimes(1);
  });

  it('passes through data attributes', function () {
    let state = {
      open: vi.fn(),
      close: vi.fn()
    };
    let {result} = renderHook(() => useTooltip({'data-test-id': 'tooltip'} as any, state as any));

    expect((result.current.tooltipProps as any)['data-test-id']).toBe('tooltip');
  });
});
