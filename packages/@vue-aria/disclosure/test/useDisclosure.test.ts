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

import React from 'react';
import {act, renderHook} from '@testing-library/react';
import {useDisclosure} from '../src/useDisclosure';

vi.mock('@vue-aria/utils', async () => {
  const actual = await vi.importActual<typeof import('@vue-aria/utils')>('@vue-aria/utils');
  return {
    ...actual,
    useEvent: () => {},
    useLayoutEffect: React.useLayoutEffect
  };
});

vi.mock('@vue-aria/ssr', () => ({
  useIsSSR: () => false
}));

function renderDisclosureHook(initialExpanded: boolean, props: any = {}) {
  let ref = {current: document.createElement('div')};
  return renderHook(() => {
    let [isExpanded, setExpanded] = React.useState(initialExpanded);
    let state = {
      get isExpanded() {
        return isExpanded;
      },
      setExpanded,
      expand: () => setExpanded(true),
      collapse: () => setExpanded(false),
      toggle: () => setExpanded(v => !v)
    };
    return useDisclosure(props, state as any, ref);
  });
}

describe('useDisclosure', function () {
  it('returns collapsed aria state by default', function () {
    let {result} = renderDisclosureHook(false);

    expect(result.current.buttonProps['aria-expanded']).toBe(false);
    expect(result.current.panelProps['aria-hidden']).toBe(true);
  });

  it('returns expanded aria state when expanded', function () {
    let {result} = renderDisclosureHook(true);

    expect(result.current.buttonProps['aria-expanded']).toBe(true);
    expect(result.current.panelProps['aria-hidden']).toBe(false);
  });

  it('expands on mouse press', function () {
    let {result} = renderDisclosureHook(false);

    act(() => {
      result.current.buttonProps.onPress?.({pointerType: 'mouse'} as any);
    });

    expect(result.current.buttonProps['aria-expanded']).toBe(true);
    expect(result.current.panelProps['aria-hidden']).toBe(false);
  });

  it('expands on keyboard press start', function () {
    let {result} = renderDisclosureHook(false);

    act(() => {
      result.current.buttonProps.onPressStart?.({pointerType: 'keyboard'} as any);
    });

    expect(result.current.buttonProps['aria-expanded']).toBe(true);
  });

  it('does not toggle when disabled', function () {
    let {result} = renderDisclosureHook(false, {isDisabled: true});

    act(() => {
      result.current.buttonProps.onPress?.({pointerType: 'mouse'} as any);
    });

    expect(result.current.buttonProps['aria-expanded']).toBe(false);
  });

  it('sets linked button and panel ids', function () {
    let {result} = renderDisclosureHook(false);

    expect(result.current.buttonProps['aria-controls']).toBe(result.current.panelProps.id);
    expect(result.current.panelProps['aria-labelledby']).toBe(result.current.buttonProps.id);
  });
});
