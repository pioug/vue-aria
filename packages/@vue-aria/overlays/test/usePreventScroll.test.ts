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
import {render} from '@testing-library/react';
import {usePreventScroll} from '../src/usePreventScroll';

vi.mock('@vue-aria/utils', async () => {
  const actual = await vi.importActual<typeof import('@vue-aria/utils')>('@vue-aria/utils');
  return {
    ...actual,
    isIOS: () => false,
    useLayoutEffect: React.useLayoutEffect
  };
});

function Example(props: any) {
  usePreventScroll(props);
  return React.createElement('div');
}

describe('usePreventScroll', function () {
  it('sets overflow hidden on mount and removes on unmount', function () {
    expect(document.documentElement.style.overflow).not.toBe('hidden');

    let res = render(React.createElement(Example));
    expect(document.documentElement.style.overflow).toBe('hidden');

    res.unmount();
    expect(document.documentElement.style.overflow).not.toBe('hidden');
  });

  it('works with nested overlays', function () {
    expect(document.documentElement.style.overflow).not.toBe('hidden');

    let one = render(React.createElement(Example));
    expect(document.documentElement.style.overflow).toBe('hidden');

    let two = render(React.createElement(Example));
    expect(document.documentElement.style.overflow).toBe('hidden');

    two.unmount();
    expect(document.documentElement.style.overflow).toBe('hidden');

    one.unmount();
    expect(document.documentElement.style.overflow).not.toBe('hidden');
  });

  it('works with nested overlays regardless of unmount order', function () {
    expect(document.documentElement.style.overflow).not.toBe('hidden');

    let one = render(React.createElement(Example));
    expect(document.documentElement.style.overflow).toBe('hidden');

    let two = render(React.createElement(Example));
    expect(document.documentElement.style.overflow).toBe('hidden');

    one.unmount();
    expect(document.documentElement.style.overflow).toBe('hidden');

    two.unmount();
    expect(document.documentElement.style.overflow).not.toBe('hidden');
  });

  it('removes overflow hidden when isDisabled is true', function () {
    expect(document.documentElement.style.overflow).not.toBe('hidden');

    let res = render(React.createElement(Example));
    expect(document.documentElement.style.overflow).toBe('hidden');

    res.rerender(React.createElement(Example, {isDisabled: true}));
    expect(document.documentElement.style.overflow).not.toBe('hidden');
  });
});
