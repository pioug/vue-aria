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
import {useModalOverlay} from '../src/useModalOverlay';

const {useOverlayMock, usePreventScrollMock, useOverlayFocusContainMock, ariaHideOutsideMock} = vi.hoisted(() => ({
  useOverlayMock: vi.fn(),
  usePreventScrollMock: vi.fn(),
  useOverlayFocusContainMock: vi.fn(),
  ariaHideOutsideMock: vi.fn(() => () => {})
}));

vi.mock('../src/useOverlay', () => ({
  useOverlay: (props: any) => {
    useOverlayMock(props);
    return {
      overlayProps: {role: 'dialog'},
      underlayProps: {onPointerDown: vi.fn()}
    };
  }
}));

vi.mock('../src/usePreventScroll', () => ({
  usePreventScroll: (opts: any) => {
    usePreventScrollMock(opts);
  }
}));

vi.mock('../src/Overlay', () => ({
  useOverlayFocusContain: () => {
    useOverlayFocusContainMock();
  }
}));

vi.mock('../src/ariaHideOutside', () => ({
  ariaHideOutside: (...args: any[]) => ariaHideOutsideMock(...args),
  keepVisible: vi.fn()
}));

describe('useModalOverlay', function () {
  beforeEach(() => {
    useOverlayMock.mockClear();
    usePreventScrollMock.mockClear();
    useOverlayFocusContainMock.mockClear();
    ariaHideOutsideMock.mockClear();
  });

  it('forwards overlay options and enables scroll lock when open', function () {
    let state = {
      isOpen: true,
      close: vi.fn()
    };
    let ref = {current: document.createElement('div')};

    renderHook(() => useModalOverlay({
      isDismissable: true,
      shouldCloseOnInteractOutside: (target: Element) => target === document.body
    }, state as any, ref));

    let overlayArgs = useOverlayMock.mock.calls[0][0];
    expect(overlayArgs.isOpen).toBe(true);
    expect(overlayArgs.onClose).toBe(state.close);
    expect(overlayArgs.isDismissable).toBe(true);
    expect(overlayArgs.shouldCloseOnInteractOutside(document.body)).toBe(true);

    expect(usePreventScrollMock).toHaveBeenCalledWith({isDisabled: false});
    expect(useOverlayFocusContainMock).toHaveBeenCalledTimes(1);
    expect(ariaHideOutsideMock).toHaveBeenCalledTimes(1);
  });

  it('disables scroll lock and does not hide outside when closed', function () {
    let state = {
      isOpen: false,
      close: vi.fn()
    };
    let ref = {current: document.createElement('div')};

    renderHook(() => useModalOverlay({}, state as any, ref));

    expect(usePreventScrollMock).toHaveBeenCalledWith({isDisabled: true});
    expect(ariaHideOutsideMock).not.toHaveBeenCalled();
  });
});
