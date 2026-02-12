/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {fireEvent, renderHook} from '@testing-library/react';
import {usePopover} from '../src/usePopover';

const {useOverlayPositionMock} = vi.hoisted(() => ({
  useOverlayPositionMock: vi.fn()
}));

vi.mock('../src/useOverlay', () => ({
  useOverlay: () => ({
    overlayProps: {},
    underlayProps: {}
  })
}));

vi.mock('../src/useOverlayPosition', () => ({
  useOverlayPosition: (props: any) => {
    useOverlayPositionMock(props);
    return {
      overlayProps: {},
      arrowProps: {},
      placement: null,
      triggerAnchorPoint: null
    };
  }
}));

vi.mock('../src/usePreventScroll', () => ({
  usePreventScroll: () => {}
}));

vi.mock('../src/ariaHideOutside', () => ({
  ariaHideOutside: () => () => {},
  keepVisible: () => () => {}
}));

describe('usePopover', function () {
  beforeEach(() => {
    useOverlayPositionMock.mockClear();
  });

  it('does not close popover on scroll by default', function () {
    let state = {
      isOpen: true,
      close: vi.fn()
    };
    let triggerRef = {current: document.createElement('div')};
    let popoverRef = {current: document.createElement('div')};

    renderHook(() => usePopover({triggerRef, popoverRef} as any, state as any));

    let positionArgs = useOverlayPositionMock.mock.calls[0][0];
    expect(positionArgs.onClose).toBeNull();

    fireEvent.scroll(document.body);
    expect(state.close).not.toHaveBeenCalled();
  });

  it('passes close handler for non-modal popovers', function () {
    let state = {
      isOpen: true,
      close: vi.fn()
    };
    let triggerRef = {current: document.createElement('div')};
    let popoverRef = {current: document.createElement('div')};

    renderHook(() => usePopover({triggerRef, popoverRef, isNonModal: true} as any, state as any));

    let positionArgs = useOverlayPositionMock.mock.calls[0][0];
    expect(typeof positionArgs.onClose).toBe('function');

    positionArgs.onClose();
    expect(state.close).toHaveBeenCalledTimes(1);
  });
});
