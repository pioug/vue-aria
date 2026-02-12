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
import {useComboBoxState} from '../src/useComboBoxState';

describe('useComboBoxState tests', function () {
  describe('open state', function () {
    let onOpenChange: ReturnType<typeof vi.fn>;
    let defaultProps: any;

    beforeEach(() => {
      onOpenChange = vi.fn();
      let collator = {compare: vi.fn().mockReturnValue(true)};
      defaultProps = {
        isFocused: true,
        items: [{id: 1, name: 'one'}],
        children: (props) => React.createElement(Item, null, props.name),
        onOpenChange,
        collator
      };
    });

    it('should be closed by default', function () {
      let initialProps = defaultProps;
      let {result} = renderHook((props) => useComboBoxState(props), {initialProps});
      expect(result.current.isOpen).toBe(false);

      act(() => {
        result.current.open();
      });
      expect(result.current.isOpen).toBe(true);
      expect(onOpenChange).toHaveBeenCalledWith(true, undefined);

      act(() => result.current.close());
      expect(result.current.isOpen).toBe(false);
      expect(onOpenChange).toHaveBeenCalledWith(false, undefined);
    });

    it('onOpenChange should return the reason that open/toggle was called', function () {
      let initialProps = defaultProps;
      let {result} = renderHook((props) => useComboBoxState(props), {initialProps});

      act(() => {
        result.current.open(undefined, 'focus');
      });
      expect(result.current.isOpen).toBe(true);
      expect(onOpenChange).toHaveBeenCalledWith(true, 'focus');

      act(() => result.current.close());
      expect(result.current.isOpen).toBe(false);
      expect(onOpenChange).toHaveBeenCalledWith(false, undefined);

      act(() => {
        result.current.toggle(undefined, 'manual');
      });
      expect(result.current.isOpen).toBe(true);
      expect(onOpenChange).toHaveBeenCalledWith(true, 'manual');
    });
  });

  describe('values', function () {
    let onInputChange: ReturnType<typeof vi.fn>;
    let defaultProps: any;

    beforeEach(() => {
      onInputChange = vi.fn();
      let collator = {compare: vi.fn().mockReturnValue(true)};
      defaultProps = {
        items: [{id: 1, name: 'one'}],
        children: (props) => React.createElement(Item, null, props.name),
        onInputChange,
        collator
      };
    });

    it('can have a default value', function () {
      let initialProps = {...defaultProps, defaultInputValue: 'hello'};
      let {result} = renderHook((props) => useComboBoxState(props), {initialProps});
      expect(result.current.inputValue).toBe('hello');
    });

    it('fires an event when the value is changed and updates if uncontrolled', function () {
      let initialProps = {...defaultProps, defaultInputValue: 'hello'};
      let {result} = renderHook((props) => useComboBoxState(props), {initialProps});
      expect(result.current.inputValue).toBe('hello');
      expect(onInputChange).not.toHaveBeenCalled();

      act(() => result.current.setInputValue('hellow'));
      expect(result.current.inputValue).toBe('hellow');
      expect(onInputChange).toHaveBeenCalledWith('hellow');
    });

    it('starts blank if no (default) value', function () {
      let initialProps = {...defaultProps};
      let {result} = renderHook((props) => useComboBoxState(props), {initialProps});
      expect(result.current.inputValue).toBe('');
      expect(onInputChange).not.toHaveBeenCalled();

      act(() => result.current.setInputValue('h'));
      expect(result.current.inputValue).toBe('h');
      expect(onInputChange).toHaveBeenCalledWith('h');
    });

    it('can be controlled', function () {
      let initialProps = {...defaultProps, inputValue: 'hello'};
      let {result} = renderHook((props) => useComboBoxState(props), {initialProps});
      expect(result.current.inputValue).toBe('hello');
      expect(onInputChange).not.toHaveBeenCalled();

      act(() => result.current.setInputValue('hellow'));
      expect(result.current.inputValue).toBe('hello');
      expect(onInputChange).toHaveBeenCalledWith('hellow');
    });
  });
});
