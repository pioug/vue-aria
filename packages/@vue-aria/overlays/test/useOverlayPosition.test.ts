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
import {renderHook, waitFor} from '@testing-library/react';
import {useOverlayPosition} from '../src/useOverlayPosition';

const {localeState, calculatePositionMock, closeOnScrollMock} = vi.hoisted(() => ({
  localeState: {direction: 'ltr'},
  calculatePositionMock: vi.fn(),
  closeOnScrollMock: vi.fn()
}));

vi.mock('@vue-aria/i18n', () => ({
  useLocale: () => ({direction: localeState.direction, locale: 'en-US'})
}));

vi.mock('@vue-aria/utils', async () => {
  const actual = await vi.importActual<typeof import('@vue-aria/utils')>('@vue-aria/utils');
  return {
    ...actual,
    useLayoutEffect: React.useLayoutEffect,
    useResizeObserver: () => {},
    getActiveElement: () => null,
    isFocusWithin: () => false
  };
});

vi.mock('../src/calculatePosition', () => ({
  calculatePosition: (opts: any) => calculatePositionMock(opts)
}));

vi.mock('../src/useCloseOnScroll', () => ({
  useCloseOnScroll: (opts: any) => closeOnScrollMock(opts)
}));

describe('useOverlayPosition', function () {
  beforeEach(() => {
    localeState.direction = 'ltr';
    calculatePositionMock.mockClear();
    closeOnScrollMock.mockClear();
    calculatePositionMock.mockReturnValue({
      position: {top: 10, left: 20},
      arrowOffsetLeft: 4,
      arrowOffsetTop: 6,
      triggerAnchorPoint: {x: 1, y: 2},
      maxHeight: 300,
      placement: 'bottom'
    });
  });

  it('returns positioned overlay and arrow props', async function () {
    let targetRef = {current: document.createElement('div')};
    let overlayRef = {current: document.createElement('div')};
    let onClose = vi.fn();
    let {result} = renderHook(() => useOverlayPosition({
      targetRef,
      overlayRef,
      isOpen: true,
      placement: 'bottom'
    }));

    await waitFor(() => {
      expect(result.current.overlayProps.style.top).toBe(10);
    });

    expect(result.current.overlayProps.style.left).toBe(20);
    expect(result.current.overlayProps.style.maxHeight).toBe(300);
    expect(result.current.arrowProps.style.left).toBe(4);
    expect(result.current.arrowProps.style.top).toBe(6);
    expect(result.current.placement).toBe('bottom');
    expect(result.current.triggerAnchorPoint).toEqual({x: 1, y: 2});

    expect(closeOnScrollMock).toHaveBeenCalled();
    expect(
      closeOnScrollMock.mock.calls[closeOnScrollMock.mock.calls.length - 1][0].onClose
    ).toBeUndefined();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('translates start/end placement in RTL and wires close handler', async function () {
    localeState.direction = 'rtl';
    let targetRef = {current: document.createElement('div')};
    let overlayRef = {current: document.createElement('div')};
    let onClose = vi.fn();
    renderHook(() => useOverlayPosition({
      targetRef,
      overlayRef,
      isOpen: true,
      placement: 'bottom start',
      onClose
    }));

    await waitFor(() => {
      expect(calculatePositionMock).toHaveBeenCalled();
    });

    expect(calculatePositionMock.mock.calls[0][0].placement).toBe('bottom right');
    expect(closeOnScrollMock).toHaveBeenCalled();
    expect(
      closeOnScrollMock.mock.calls.some((call) => typeof call[0].onClose === 'function')
    ).toBe(true);
  });
});
