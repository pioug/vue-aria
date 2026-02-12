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

import React, {useEffect} from 'react';
import {act, render, renderHook} from '@testing-library/react';
import {useCheckboxGroupState} from '../src/useCheckboxGroupState';

describe('useCheckboxGroupState', function () {
  it('should return basic interface when no props are provided', function () {
    function Test() {
      const state = useCheckboxGroupState();

      expect(state.value).toEqual([]);
      expect(state.isDisabled).toBe(false);
      expect(state.isReadOnly).toBe(false);
      expect(typeof state.setValue).toBe('function');
      expect(typeof state.addValue).toBe('function');
      expect(typeof state.removeValue).toBe('function');
      expect(typeof state.toggleValue).toBe('function');
      expect(typeof state.isSelected).toBe('function');

      return null;
    }

    render(React.createElement(Test));
  });

  it('should return the same `isDisabled` that has been provided', function () {
    function Test() {
      const state = useCheckboxGroupState({isDisabled: true});

      expect(state.isDisabled).toBe(true);

      return null;
    }

    render(React.createElement(Test));
  });

  it('should return the same `isReadOnly` that has been provided', function () {
    function Test() {
      const state = useCheckboxGroupState({isReadOnly: true});

      expect(state.isReadOnly).toBe(true);

      return null;
    }

    render(React.createElement(Test));
  });

  it('should be possible to provide the initial value', function () {
    function Test() {
      const state = useCheckboxGroupState({value: ['foo', 'bar']});

      expect(state.value).toEqual(['foo', 'bar']);

      return null;
    }

    render(React.createElement(Test));
  });

  it('should be possible to provide a default value', function () {
    function Test() {
      const state = useCheckboxGroupState({defaultValue: ['foo', 'bar']});

      expect(state.value).toEqual(['foo', 'bar']);

      return null;
    }

    render(React.createElement(Test));
  });

  it('should support isSelected to determine if a value is selected', function () {
    function Test() {
      const state = useCheckboxGroupState({value: ['foo', 'bar']});

      expect(state.isSelected('foo')).toBe(true);
      expect(state.isSelected('baz')).toBe(false);

      return null;
    }

    render(React.createElement(Test));
  });

  it('should be possible to control the value', function () {
    function Test({value}: {value: string[]}) {
      const state = useCheckboxGroupState({value});
      return React.createElement(React.Fragment, null, state.value.join(', '));
    }

    const {container, rerender} = render(React.createElement(Test, {value: ['foo']}));
    expect(container.textContent).toBe('foo');

    rerender(React.createElement(Test, {value: ['foo', 'bar']}));
    expect(container.textContent).toBe('foo, bar');
  });

  it('should be possible to have the value uncontrolled', function () {
    let {result} = renderHook(() => useCheckboxGroupState({defaultValue: ['foo']}));
    expect(result.current.value).toEqual(['foo']);

    act(() => {
      result.current.setValue(['foo', 'bar']);
    });
    expect(result.current.value).toEqual(['foo', 'bar']);
  });

  it('should call the provided `onChange` callback whenever value changes', function () {
    const onChangeSpy = vi.fn();
    const nextValue = ['foo', 'bar'];
    let setValue!: (value: string[]) => void;

    function Test() {
      const state = useCheckboxGroupState({defaultValue: ['foo'], onChange: onChangeSpy});
      useEffect(() => {
        setValue = state.setValue;
      }, [state]);
      return React.createElement(React.Fragment, null, state.value.join(', '));
    }

    render(React.createElement(Test));

    act(() => {
      setValue(nextValue);
    });

    expect(onChangeSpy).toHaveBeenCalledWith(nextValue);
  });

  it('should be possible to add a value using `addValue`', function () {
    let {result} = renderHook(() => useCheckboxGroupState({defaultValue: ['foo']}));

    act(() => {
      result.current.addValue('baz');
    });
    expect(result.current.value).toEqual(['foo', 'baz']);
  });

  it('should not add the same value multiple times when using `addValue`', function () {
    let {result} = renderHook(() => useCheckboxGroupState({defaultValue: ['foo']}));

    act(() => {
      result.current.addValue('baz');
      result.current.addValue('baz');
      result.current.addValue('baz');
      result.current.addValue('baz');
    });
    expect(result.current.value).toEqual(['foo', 'baz']);
  });

  it('should be possible to remove a value using `removeValue`', function () {
    let {result} = renderHook(() => useCheckboxGroupState({defaultValue: ['foo', 'qwe']}));

    act(() => {
      result.current.removeValue('foo');
    });
    expect(result.current.value).toEqual(['qwe']);
  });

  it('should be possible to add & remove value based on it being or not in the stored value using `toggleValue`', function () {
    let {result} = renderHook(() => useCheckboxGroupState({defaultValue: ['foo', 'qwe']}));

    act(() => {
      result.current.toggleValue('foo');
    });
    expect(result.current.value).toEqual(['qwe']);

    act(() => {
      result.current.toggleValue('foo');
    });
    expect(result.current.value).toEqual(['qwe', 'foo']);
  });

  it('should process both `toggleState` calls when called twice synchronously', function () {
    let {result} = renderHook(() => useCheckboxGroupState({defaultValue: ['foo', 'qwe']}));

    act(() => {
      result.current.toggleValue('qwe');
      result.current.toggleValue('qwe');
    });

    // Vue-controlled state updates synchronously, so the second toggle sees the updated value.
    expect(result.current.value).toEqual(['foo', 'qwe']);
  });

  it('should not update state for readonly group', function () {
    let addValue!: (value: string) => void;
    let removeValue!: (value: string) => void;
    let toggleValue!: (value: string) => void;
    let setValue!: (value: string[]) => void;

    function Test() {
      const state = useCheckboxGroupState({isReadOnly: true, defaultValue: ['test']});
      useEffect(() => {
        addValue = state.addValue;
        removeValue = state.removeValue;
        toggleValue = state.toggleValue;
        setValue = state.setValue;
      }, [state]);

      return React.createElement(React.Fragment, null, state.value.join(', '));
    }

    const {container} = render(React.createElement(Test));
    expect(container.textContent).toBe('test');

    act(() => {
      addValue('foo');
    });
    expect(container.textContent).toBe('test');

    act(() => {
      removeValue('test');
    });
    expect(container.textContent).toBe('test');

    act(() => {
      toggleValue('foo');
    });
    expect(container.textContent).toBe('test');

    act(() => {
      setValue(['foo']);
    });
    expect(container.textContent).toBe('test');
  });

  it('should not update state for disabled group', function () {
    let addValue!: (value: string) => void;
    let removeValue!: (value: string) => void;
    let toggleValue!: (value: string) => void;
    let setValue!: (value: string[]) => void;

    function Test() {
      const state = useCheckboxGroupState({isDisabled: true, defaultValue: ['test']});
      useEffect(() => {
        addValue = state.addValue;
        removeValue = state.removeValue;
        toggleValue = state.toggleValue;
        setValue = state.setValue;
      }, [state]);

      return React.createElement(React.Fragment, null, state.value.join(', '));
    }

    const {container} = render(React.createElement(Test));
    expect(container.textContent).toBe('test');

    act(() => {
      addValue('foo');
    });
    expect(container.textContent).toBe('test');

    act(() => {
      removeValue('test');
    });
    expect(container.textContent).toBe('test');

    act(() => {
      toggleValue('foo');
    });
    expect(container.textContent).toBe('test');

    act(() => {
      setValue(['foo']);
    });
    expect(container.textContent).toBe('test');
  });
});
