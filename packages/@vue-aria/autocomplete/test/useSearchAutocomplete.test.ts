/*
 * Copyright 2021 Adobe. All rights reserved.
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
import {useSearchAutocomplete} from '../src/useSearchAutocomplete';

vi.mock('@vue-aria/searchfield', () => ({
  useSearchField: (props: any) => ({
    inputProps: {
      id: 'search-input',
      onKeyDown: props.onKeyDown,
      onKeyUp: props.onKeyUp
    },
    clearButtonProps: {}
  })
}));

vi.mock('@vue-aria/combobox', () => ({
  useComboBox: (_props: any, state: any) => ({
    labelProps: {id: 'label-id', htmlFor: 'search-input'},
    listBoxProps: {id: 'listbox-id', 'aria-labelledby': 'listbox-id label-id'},
    inputProps: {
      id: 'search-input',
      role: 'combobox',
      'aria-autocomplete': 'list',
      'aria-labelledby': 'label-id',
      onKeyDown: (e: any) => {
        if (e.key === 'ArrowDown') {
          state.open('first', 'manual');
        }

        if (e.key === 'ArrowUp') {
          state.open('last', 'manual');
        }
      }
    },
    descriptionProps: {},
    errorMessageProps: {},
    validationErrors: [],
    validationDetails: {},
    isInvalid: false
  })
}));

describe('useSearchAutocomplete', function () {
  let preventDefault = vi.fn();
  let stopPropagation = vi.fn();
  let event = (e) => ({
    ...e,
    nativeEvent: {
      isComposing: false
    },
    preventDefault,
    stopPropagation
  });

  let makeState = () => ({
    inputValue: '',
    setInputValue: vi.fn(),
    selectionManager: {focusedKey: null},
    open: vi.fn(),
    toggle: vi.fn()
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return default props for all the elements', function () {
    let props = {
      label: 'test label',
      popoverRef: React.createRef(),
      inputRef: React.createRef(),
      listBoxRef: React.createRef()
    };
    let state = makeState();

    let {result} = renderHook(() => useSearchAutocomplete(props as any, state as any));
    let {inputProps, listBoxProps, labelProps} = result.current;

    expect(Boolean(labelProps.id)).toBe(true);
    expect(labelProps.htmlFor).toBe(inputProps.id);
    expect(Boolean(inputProps.id)).toBe(true);
    expect(inputProps['aria-labelledby']).toBe(labelProps.id);
    expect(inputProps.role).toBe('combobox');
    expect(inputProps['aria-autocomplete']).toBe('list');
    expect(inputProps['aria-controls']).toBeFalsy();
    expect(inputProps['aria-activedescendant']).toBeFalsy();
    expect(Boolean(listBoxProps.id)).toBe(true);
    expect(listBoxProps['aria-labelledby']).toBe(`${listBoxProps.id} ${labelProps.id}`);
  });

  it('calls open with the expected parameters when arrow down/up is pressed', function () {
    let props = {
      label: 'test label',
      popoverRef: React.createRef(),
      inputRef: {
        current: document.createElement('input')
      },
      listBoxRef: React.createRef()
    };
    let state = makeState();

    let {result} = renderHook(() => useSearchAutocomplete(props as any, state as any));
    let {inputProps} = result.current;
    (inputProps.onKeyDown as any)(event({key: 'ArrowDown'}));
    expect(state.open).toHaveBeenCalledTimes(1);
    expect(state.open).toHaveBeenLastCalledWith('first', 'manual');
    expect(state.toggle).toHaveBeenCalledTimes(0);
    (inputProps.onKeyDown as any)(event({key: 'ArrowUp'}));
    expect(state.open).toHaveBeenCalledTimes(2);
    expect(state.open).toHaveBeenLastCalledWith('last', 'manual');
    expect(state.toggle).toHaveBeenCalledTimes(0);
  });
});
