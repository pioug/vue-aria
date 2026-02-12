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

import React, {useRef} from 'react';
import {renderHook} from '@testing-library/react';
import {useToast} from '../src/useToast';

vi.mock('@vue-aria/utils', async () => {
  const actual = await vi.importActual<typeof import('@vue-aria/utils')>('@vue-aria/utils');
  return {
    ...actual,
    useLayoutEffect: React.useLayoutEffect
  };
});

vi.mock('@vue-aria/i18n', () => ({
  useLocalizedStringFormatter: () => ({
    format: (key: string) => key === 'close' ? 'Close' : key
  })
}));

describe('useToast', function () {
  let close = vi.fn();

  afterEach(() => {
    close.mockClear();
  });

  let renderToastHook = (props: any, state: any) => {
    let {result} = renderHook(() => useToast(props, state, useRef(document.createElement('div'))));
    return result.current;
  };

  it('handles defaults', function () {
    let {closeButtonProps, toastProps, contentProps, titleProps} = renderToastHook({toast: {}}, {close});

    expect(toastProps.role).toBe('alertdialog');
    expect(contentProps.role).toBe('alert');
    expect(closeButtonProps['aria-label']).toBe('Close');
    expect(typeof closeButtonProps.onPress).toBe('function');
    expect(titleProps.id).toEqual(toastProps['aria-labelledby']);
  });

  it('handles close button', function () {
    let {closeButtonProps} = renderToastHook({toast: {key: 1}}, {close});
    (closeButtonProps.onPress as any)();

    expect(close).toHaveBeenCalledTimes(1);
    expect(close).toHaveBeenCalledWith(1);
  });

  it('passes through data attributes', function () {
    let {toastProps} = renderToastHook({toast: {}, 'data-test-id': 'toast'}, {close});

    expect(toastProps['data-test-id']).toBe('toast');
  });
});
