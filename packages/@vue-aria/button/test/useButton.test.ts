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
import {useButton} from '../src/useButton';

describe('useButton', function () {
  it('handles defaults', function () {
    let props = {};
    let ref = {current: null};
    let {result} = renderHook(() => useButton(props, ref));

    expect(typeof result.current.buttonProps.onClick).toBe('function');
  });

  it('handles elements other than button', function () {
    let props = {elementType: 'a'} as const;
    let ref = {current: null};
    let {result} = renderHook(() => useButton(props, ref));

    expect(result.current.buttonProps.role).toBe('button');
    expect(result.current.buttonProps.tabIndex).toBe(0);
    expect(result.current.buttonProps['aria-disabled']).toBeUndefined();
    expect(result.current.buttonProps.href).toBeUndefined();
    expect(typeof result.current.buttonProps.onKeyDown).toBe('function');
    expect(result.current.buttonProps.rel).toBeUndefined();
  });

  it('handles elements other than button disabled', function () {
    let props = {elementType: 'a', isDisabled: true} as const;
    let ref = {current: null};
    let {result} = renderHook(() => useButton(props, ref));

    expect(result.current.buttonProps.role).toBe('button');
    expect(result.current.buttonProps.tabIndex).toBeUndefined();
    expect(result.current.buttonProps['aria-disabled']).toBeTruthy();
    expect(result.current.buttonProps.href).toBeUndefined();
    expect(typeof result.current.buttonProps.onKeyDown).toBe('function');
    expect(result.current.buttonProps.rel).toBeUndefined();
  });

  it('handles the rel attribute on anchors', function () {
    let props = {elementType: 'a', rel: 'noopener noreferrer'} as const;
    let ref = {current: null};
    let {result} = renderHook(() => useButton(props, ref));

    expect(result.current.buttonProps.rel).toBe('noopener noreferrer');
  });

  it('handles the rel attribute as a string on anchors', function () {
    let props = {elementType: 'a', rel: 'search'} as const;
    let ref = {current: null};
    let {result} = renderHook(() => useButton(props, ref));

    expect(result.current.buttonProps.rel).toBe('search');
  });

  it('handles input elements', function () {
    let props = {elementType: 'input', isDisabled: true} as const;
    let ref = {current: null};
    let {result} = renderHook(() => useButton(props, ref));

    expect(result.current.buttonProps.role).toBe('button');
    expect(result.current.buttonProps.tabIndex).toBeUndefined();
    expect(result.current.buttonProps['aria-disabled']).toBeUndefined();
    expect(result.current.buttonProps.disabled).toBeTruthy();
    expect(result.current.buttonProps.href).toBeUndefined();
    expect(typeof result.current.buttonProps.onKeyDown).toBe('function');
    expect(result.current.buttonProps.rel).toBeUndefined();
  });

  it('handles aria-disabled passthrough for button elements', function () {
    let props = {'aria-disabled': 'true'};
    let ref = {current: null};
    let {result} = renderHook(() => useButton(props, ref));

    expect(result.current.buttonProps['aria-disabled']).toBeTruthy();
    expect(result.current.buttonProps.disabled).toBeUndefined();
  });
});
