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

import React, {useRef} from 'react';
import {render, renderHook, waitFor} from '@testing-library/react';
import {onCloseMap} from '../src/useCloseOnScroll';
import {useOverlayTrigger} from '../src/useOverlayTrigger';
import {useOverlayTriggerState} from '@vue-stately/overlays';

function Example(props: any) {
  let ref = useRef<Element | null>(null);
  let state = useOverlayTriggerState(props);
  useOverlayTrigger({type: 'dialog'}, state, ref as any);
  return React.createElement('div', {ref: ref as any, 'data-testid': props['data-testid'] || 'test'}, props.children);
}

describe('useOverlayTrigger', function () {
  it('registers close handler in onCloseMap for backward compatibility', async function () {
    let onOpenChange = vi.fn();
    let {getByTestId} = render(React.createElement(Example, {isOpen: true, onOpenChange}));
    let trigger = getByTestId('test');

    await waitFor(() => {
      expect(typeof onCloseMap.get(trigger)).toBe('function');
    });

    onCloseMap.get(trigger)?.();
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('sets menu trigger props', function () {
    let state = {isOpen: true, toggle: vi.fn(), close: vi.fn()};
    let {result} = renderHook(() => useOverlayTrigger({type: 'menu'}, state as any));

    expect(result.current.triggerProps['aria-haspopup']).toBe(true);
    expect(result.current.triggerProps['aria-expanded']).toBe(true);
    expect(typeof result.current.triggerProps.onPress).toBe('function');

    (result.current.triggerProps.onPress as any)();
    expect(state.toggle).toHaveBeenCalledTimes(1);
  });

  it('sets listbox trigger props when closed', function () {
    let state = {isOpen: false, toggle: vi.fn(), close: vi.fn()};
    let {result} = renderHook(() => useOverlayTrigger({type: 'listbox'}, state as any));

    expect(result.current.triggerProps['aria-haspopup']).toBe('listbox');
    expect(result.current.triggerProps['aria-expanded']).toBe(false);
    expect(result.current.triggerProps['aria-controls']).toBeUndefined();
  });
});
