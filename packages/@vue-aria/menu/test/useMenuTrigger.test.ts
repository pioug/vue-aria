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
import {renderHook} from '@testing-library/react';
import {useMenuTrigger} from '../src';

vi.mock('@vue-aria/i18n', () => ({
  useLocalizedStringFormatter: () => ({
    format: () => ''
  })
}));

describe('useMenuTrigger', function () {
  let state: any = {};
  let setOpen = vi.fn();
  let setFocusStrategy = vi.fn();

  let renderMenuTriggerHook = (menuTriggerProps, menuTriggerState, ref?) => {
    let {result} = renderHook(() => useMenuTrigger(menuTriggerProps, menuTriggerState, ref || React.createRef()));
    return result.current;
  };

  beforeEach(() => {
    state.isOpen = false;
    state.setOpen = setOpen;
    state.open = (focusStrategy) => {
      state.setFocusStrategy(focusStrategy);
      state.setOpen(true);
    };
    state.close = vi.fn();
    state.toggle = vi.fn((focusStrategy?: any) => {
      if (focusStrategy !== undefined) {
        state.focusStrategy = focusStrategy;
      }
      state.setOpen(!state.isOpen);
    });
    state.focusStrategy = 'first';
    state.setFocusStrategy = setFocusStrategy;
  });

  afterEach(() => {
    setOpen.mockClear();
    setFocusStrategy.mockClear();
  });

  it('should return default props for menu and menu trigger', function () {
    let {menuTriggerProps, menuProps} = renderMenuTriggerHook({}, state);
    expect(menuTriggerProps['aria-controls']).toBeFalsy();
    expect(menuTriggerProps['aria-expanded']).toBeFalsy();
    expect(menuTriggerProps['aria-haspopup']).toBeTruthy();
    expect(menuProps['aria-labelledby']).toBe(menuTriggerProps.id);
    expect(menuProps.id).toBeTruthy();
  });

  it('should return proper aria props for menu and menu trigger if menu is open', function () {
    state.isOpen = true;

    let {menuTriggerProps, menuProps} = renderMenuTriggerHook({}, state);
    expect(menuTriggerProps['aria-controls']).toBe(menuProps.id);
    expect(menuTriggerProps['aria-expanded']).toBeTruthy();
    expect(menuProps['aria-labelledby']).toBe(menuTriggerProps.id);
    expect(menuProps.id).toBeTruthy();
  });

  it('returns the proper aria-haspopup based on the menu\'s type', function () {
    let props = {
      type: 'menu'
    };

    let {menuTriggerProps} = renderMenuTriggerHook(props, state);
    expect(menuTriggerProps['aria-haspopup']).toBeTruthy();
  });

  it('returns a onPress for the menuTrigger', function () {
    let props = {
      type: 'menu'
    };

    let {menuTriggerProps} = renderMenuTriggerHook(props, state);
    expect(typeof menuTriggerProps.onPressStart).toBe('function');
    menuTriggerProps.onPressStart?.({pointerType: 'mouse', target: document.createElement('button')} as any);
    expect(setOpen).toHaveBeenCalledTimes(1);
    expect(setOpen).toHaveBeenCalledWith(true);
    expect(setFocusStrategy).toHaveBeenCalledTimes(1);
    expect(setFocusStrategy).toHaveBeenCalledWith(null);
  });

  it('doesn\'t toggle the menu if isDisabled', function () {
    let {menuTriggerProps} = renderMenuTriggerHook({isDisabled: true}, state);
    expect(typeof menuTriggerProps.onPressStart).toBe('function');
    menuTriggerProps.onPressStart?.({pointerType: 'mouse'} as any);
    expect(setOpen).toHaveBeenCalledTimes(0);
    expect(setFocusStrategy).toHaveBeenCalledTimes(0);

    menuTriggerProps.onPress?.({pointerType: 'touch'} as any);
    expect(setOpen).toHaveBeenCalledTimes(0);
    expect(setFocusStrategy).toHaveBeenCalledTimes(0);
  });
});
