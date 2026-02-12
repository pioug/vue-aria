/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {act, renderHook} from '@testing-library/react';
import {gridIds} from '../src/utils';
import {useTableColumnResize} from '../src/useTableColumnResize';

vi.mock('@vue-aria/i18n', () => ({
  useLocale: () => ({
    direction: 'ltr',
    locale: 'en-US'
  }),
  useLocalizedStringFormatter: () => ({
    format: (key: string, values: Record<string, unknown> = {}) => {
      if (key === 'columnSize') {
        return String(values.value);
      }
      return key;
    }
  })
}));

function createResizeState() {
  let currentWidth = 100;
  let tableState = {
    isKeyboardNavigationDisabled: false,
    setKeyboardNavigationDisabled: vi.fn()
  };
  gridIds.set(tableState as any, 'table-id');

  return {
    endResize: vi.fn(),
    getColumnMaxWidth: () => 400,
    getColumnMinWidth: () => 40,
    getColumnWidth: () => currentWidth,
    resizingColumn: null,
    startResize: vi.fn(),
    tableState,
    updateResizedColumns: (_key: string, width: number) => {
      currentWidth = width;
      return new Map([['name', width]]);
    }
  };
}

describe('tableResizingTests parity', () => {
  it('decreases width by step when input value moves below current width', () => {
    let state = createResizeState();
    let onResize = vi.fn();
    let inputRef = {current: null as HTMLInputElement | null};

    let {result} = renderHook(() => useTableColumnResize({
      'aria-label': 'Resize Name',
      column: {key: 'name'} as any,
      onResize
    }, state as any, inputRef));

    act(() => {
      result.current.inputProps.onChange?.({
        target: {value: '10'}
      } as any);
    });

    expect(onResize).toHaveBeenCalledTimes(1);
    let sizes = onResize.mock.calls[0][0] as Map<string, number>;
    expect(sizes.get('name')).toBe(90);
  });
});
