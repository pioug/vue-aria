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
import {act, renderHook} from '@testing-library/react';
import {Item} from '@vue-stately/collections';
import {useComboBox} from '../src/useComboBox';
import {useComboBoxState} from '@vue-stately/combobox';

vi.mock('@vue-aria/i18n', () => ({
  useLocalizedStringFormatter: () => ({
    format: (key: string) => key
  }),
  useLocale: () => ({
    direction: 'ltr',
    locale: 'en-US'
  })
}));

describe('useComboBox', function () {
  let preventDefault: ReturnType<typeof vi.fn>;
  let stopPropagation: ReturnType<typeof vi.fn>;
  let openSpy: ReturnType<typeof vi.fn>;
  let toggleSpy: ReturnType<typeof vi.fn>;
  let event = (e: Record<string, unknown>) => ({
    ...e,
    nativeEvent: {
      isComposing: false
    },
    preventDefault,
    stopPropagation,
    continuePropagation: vi.fn()
  });

  let defaultStateProps = {
    items: [{id: 1, name: 'one'}],
    children: (item: {name: string}) => React.createElement(Item, null, item.name)
  };

  let props = {
    label: 'test label',
    popoverRef: {
      current: document.createElement('div')
    },
    buttonRef: {
      current: document.createElement('button')
    },
    inputRef: {
      current: document.createElement('input')
    },
    listBoxRef: {
      current: document.createElement('div')
    }
  };

  beforeEach(() => {
    preventDefault = vi.fn();
    stopPropagation = vi.fn();
    openSpy = vi.fn();
    toggleSpy = vi.fn();
  });

  it('should return default props for all the button group elements', function () {
    let {result} = renderHook(() => useComboBox(props, useComboBoxState(defaultStateProps)));
    let {buttonProps, inputProps, listBoxProps, labelProps} = result.current;

    expect(labelProps.id).toBeTruthy();
    expect(labelProps.htmlFor).toBe(inputProps.id);
    expect(inputProps.id).toBeTruthy();
    expect(inputProps['aria-labelledby']).toBe(labelProps.id);
    expect(inputProps.role).toBe('combobox');
    expect(inputProps['aria-autocomplete']).toBe('list');
    expect(inputProps['aria-controls']).toBeFalsy();
    expect(inputProps['aria-activedescendant']).toBeFalsy();
    expect(listBoxProps.id).toBeTruthy();
    expect(listBoxProps['aria-labelledby']).toBe(`${listBoxProps.id} ${labelProps.id}`);
    expect(buttonProps.id).toBeTruthy();
    expect(buttonProps.excludeFromTabOrder).toBeTruthy();
    expect(buttonProps['aria-haspopup']).toBeTruthy();
    expect(buttonProps['aria-expanded']).toBeFalsy();
    expect(buttonProps['aria-controls']).toBeFalsy();
    expect(buttonProps['onPress']).toBeTruthy();
    expect(buttonProps['onPressStart']).toBeTruthy();
    expect(buttonProps['onKeyDown']).toBeTruthy();
  });

  it('should prevent default on Enter if isOpen', function () {
    let stateProps = {...defaultStateProps, ...props, allowsEmptyCollection: true};
    let {result: state} = renderHook((hookProps) => useComboBoxState(hookProps), {initialProps: stateProps});
    act(() => {
      state.current.open();
    });

    let {result, rerender} = renderHook((hookProps) => useComboBox(hookProps, state.current), {initialProps: props});
    let {inputProps} = result.current;

    act(() => {
      inputProps.onKeyDown?.(event({key: 'Enter'}) as any);
    });

    expect(preventDefault).toHaveBeenCalledTimes(1);

    act(() => {
      state.current.close();
    });

    rerender(props);
    result.current.inputProps.onKeyDown?.(event({key: 'Enter'}) as any);
    expect(preventDefault).toHaveBeenCalledTimes(1);
  });

  it('calls open and toggle with the expected parameters when arrow down/up/trigger button is pressed', function () {
    let stateProps = {...defaultStateProps, ...props};
    let {result: state} = renderHook((hookProps) => useComboBoxState(hookProps), {initialProps: stateProps});
    state.current.open = openSpy;
    state.current.toggle = toggleSpy;

    let {result} = renderHook((hookProps) => useComboBox(hookProps, state.current), {initialProps: props});
    let {inputProps, buttonProps} = result.current;
    inputProps.onKeyDown?.(event({key: 'ArrowDown'}) as any);
    expect(openSpy).toHaveBeenCalledTimes(1);
    expect(openSpy).toHaveBeenLastCalledWith('first', 'manual');
    expect(toggleSpy).toHaveBeenCalledTimes(0);
    inputProps.onKeyDown?.(event({key: 'ArrowUp'}) as any);
    expect(openSpy).toHaveBeenCalledTimes(2);
    expect(openSpy).toHaveBeenLastCalledWith('last', 'manual');
    expect(toggleSpy).toHaveBeenCalledTimes(0);
    buttonProps.onPress?.(event({pointerType: 'touch'}) as any);
    expect(openSpy).toHaveBeenCalledTimes(2);
    expect(toggleSpy).toHaveBeenCalledTimes(1);
    expect(toggleSpy).toHaveBeenLastCalledWith(null, 'manual');
    buttonProps.onPressStart?.(event({pointerType: 'mouse'}) as any);
    expect(openSpy).toHaveBeenCalledTimes(2);
    expect(toggleSpy).toHaveBeenCalledTimes(2);
    expect(toggleSpy).toHaveBeenLastCalledWith(null, 'manual');
  });

  it('should call onBlur when no button provided and you leave the field', function () {
    let onBlurMock = vi.fn();
    let initialProps = {...props, buttonRef: {current: null}, onBlur: onBlurMock};
    let stateProps = {...defaultStateProps, ...initialProps};
    let {result: state} = renderHook((hookProps) => useComboBoxState(hookProps), {initialProps: stateProps});
    let {result} = renderHook((hookProps) => useComboBox(hookProps, state.current), {initialProps});
    let {inputProps} = result.current;

    inputProps.onBlur?.(event({relatedTarget: null}) as any);

    expect(onBlurMock).toHaveBeenCalledTimes(1);
  });

  it.each`
    Name          | componentProps
    ${'disabled'} | ${{isDisabled: true}}
    ${'readonly'} | ${{isReadOnly: true}}
  `('press and keyboard events on the button does not toggle the menu if $Name', function ({componentProps}) {
    let additionalProps = {
      ...props,
      ...componentProps
    };
    let stateProps = {...defaultStateProps, ...additionalProps};

    let {result: state} = renderHook((hookProps) => useComboBoxState(hookProps), {initialProps: stateProps});
    state.current.open = openSpy;
    state.current.toggle = toggleSpy;

    let {result} = renderHook((hookProps) => useComboBox(hookProps, state.current), {initialProps: additionalProps});
    let {buttonProps} = result.current;
    buttonProps.onKeyDown?.(event({key: 'ArrowDown'}) as any);
    expect(openSpy).toHaveBeenCalledTimes(0);
    expect(toggleSpy).toHaveBeenCalledTimes(0);
    buttonProps.onKeyDown?.(event({key: 'ArrowUp'}) as any);
    expect(openSpy).toHaveBeenCalledTimes(0);
    expect(toggleSpy).toHaveBeenCalledTimes(0);
    expect(buttonProps.isDisabled).toBeTruthy();
  });
});
