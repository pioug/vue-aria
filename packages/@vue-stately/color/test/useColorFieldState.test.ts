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
import {useColorFieldState} from '../src/useColorFieldState';

describe('useColorFieldState tests', () => {
  it('is in empty state with no initial value', () => {
    let {result} = renderHook(() => useColorFieldState({}));
    expect(result.current.colorValue.value).toBeUndefined();
    expect(result.current.inputValue).toBe('');
  });

  it('accepts a hex string as default value', () => {
    let {result} = renderHook(() => useColorFieldState({defaultValue: '#abc'}));
    expect(result.current.colorValue.value?.getChannelValue('red')).toBe(170);
    expect(result.current.colorValue.value?.getChannelValue('green')).toBe(187);
    expect(result.current.colorValue.value?.getChannelValue('blue')).toBe(204);
    expect(result.current.colorValue.value?.getChannelValue('alpha')).toBe(1);
  });

  it('returns core state mutation APIs', () => {
    let {result} = renderHook(() => useColorFieldState({defaultValue: '#aabbcc'}));

    expect(typeof result.current.setColorValue).toBe('function');
    expect(typeof result.current.setInputValue).toBe('function');
    expect(typeof result.current.commit).toBe('function');
    expect(typeof result.current.increment).toBe('function');
    expect(typeof result.current.decrement).toBe('function');
    expect(typeof result.current.incrementToMax).toBe('function');
    expect(typeof result.current.decrementToMin).toBe('function');
  });

  it('validates partial hex input like upstream', () => {
    let {result} = renderHook(() => useColorFieldState({defaultValue: '#abc'}));

    expect(result.current.validate('')).toBe(true);
    expect(result.current.validate('#ab')).toBe(true);
    expect(result.current.validate('aabbcc')).toBe(true);
    expect(result.current.validate('invalid')).toBe(false);
  });
});
