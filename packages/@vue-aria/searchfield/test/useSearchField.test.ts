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
import {useSearchField} from '../src/useSearchField';

vi.mock('@vue-aria/i18n', () => ({
  useLocalizedStringFormatter: () => ({
    format: (key: string) => key
  })
}));

vi.mock('@vue-aria/textfield', () => ({
  useTextField: (props: any) => ({
    labelProps: {},
    inputProps: {
      type: props.type,
      value: props.value,
      onKeyDown: props.onKeyDown,
      defaultValue: props.defaultValue
    },
    descriptionProps: {},
    errorMessageProps: {}
  })
}));

describe('useSearchField', function () {
  let state: any;
  let inputRef: {current: HTMLInputElement | null};
  let onSubmit: any;
  let onClear: any;

  beforeEach(() => {
    state = {
      value: '',
      setValue: vi.fn()
    };
    inputRef = {current: document.createElement('input')};
    onSubmit = vi.fn();
    onClear = vi.fn();
  });

  it('returns inputProps with default search type and state value', function () {
    let {result} = renderHook(() => useSearchField({'aria-label': 'test'} as any, state, inputRef));

    expect(result.current.inputProps.type).toBe('search');
    expect(result.current.inputProps.value).toBe(state.value);
    expect(typeof result.current.inputProps.onKeyDown).toBe('function');
  });

  it('calls onSubmit with state value on Enter', function () {
    state.value = 'query';
    let {result} = renderHook(() => useSearchField({'aria-label': 'test', onSubmit} as any, state, inputRef));
    let preventDefault = vi.fn();
    let continuePropagation = vi.fn();

    result.current.inputProps.onKeyDown?.({key: 'Enter', preventDefault, continuePropagation});

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith('query');
    expect(preventDefault).toHaveBeenCalledTimes(1);
  });

  it('clears value and calls onClear on Escape when non-empty', function () {
    state.value = 'query';
    let {result} = renderHook(() => useSearchField({'aria-label': 'test', onClear} as any, state, inputRef));
    let preventDefault = vi.fn();
    let continuePropagation = vi.fn();

    result.current.inputProps.onKeyDown?.({key: 'Escape', preventDefault, continuePropagation});

    expect(state.setValue).toHaveBeenCalledTimes(1);
    expect(state.setValue).toHaveBeenCalledWith('');
    expect(onClear).toHaveBeenCalledTimes(1);
    expect(preventDefault).toHaveBeenCalledTimes(1);
  });

  it('clears state and focuses input on clear button press', function () {
    let focus = vi.spyOn(inputRef.current!, 'focus');
    let {result} = renderHook(() => useSearchField({'aria-label': 'test', onClear} as any, state, inputRef));

    result.current.clearButtonProps.onPressStart?.({} as any);
    result.current.clearButtonProps.onPress?.({} as any);

    expect(state.setValue).toHaveBeenCalledTimes(1);
    expect(state.setValue).toHaveBeenCalledWith('');
    expect(onClear).toHaveBeenCalledTimes(1);
    expect(focus).toHaveBeenCalledTimes(1);
  });

  it('does not return defaultValue in inputProps', function () {
    let {result} = renderHook(() => useSearchField({'aria-label': 'test', defaultValue: 'abc'} as any, state, inputRef));

    expect(result.current.inputProps.defaultValue).toBeUndefined();
  });
});
