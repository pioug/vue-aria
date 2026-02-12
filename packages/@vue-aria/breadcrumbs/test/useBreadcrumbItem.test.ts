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
import {useBreadcrumbItem} from '../src/useBreadcrumbItem';

vi.mock('@vue-aria/link', () => ({
  useLink: ({isDisabled, elementType = 'a'}: {isDisabled?: boolean, elementType?: string}) => ({
    linkProps: {
      tabIndex: !isDisabled ? 0 : undefined,
      role: elementType === 'a' ? undefined : 'link',
      'aria-disabled': isDisabled,
      onKeyDown: () => {}
    }
  })
}));

describe('useBreadcrumbItem', function () {
  let renderItemHook = (props: any) => {
    let ref = {current: null};
    let {result} = renderHook(() => useBreadcrumbItem(props, ref));
    return result.current;
  };

  it('handles span elements', function () {
    let {itemProps} = renderItemHook({elementType: 'span'});
    expect(itemProps.tabIndex).toBe(0);
    expect(itemProps.role).toBe('link');
    expect(itemProps['aria-disabled']).toBeUndefined();
    expect(typeof itemProps.onKeyDown).toBe('function');
  });

  it('handles isCurrent', function () {
    let {itemProps} = renderItemHook({elementType: 'span', isCurrent: true});
    expect(itemProps.tabIndex).toBeUndefined();
    expect(itemProps.role).toBe('link');
    expect(itemProps['aria-current']).toBe('page');
  });

  it('handles isDisabled', function () {
    let {itemProps} = renderItemHook({elementType: 'span', isDisabled: true});
    expect(itemProps.tabIndex).toBeUndefined();
    expect(itemProps.role).toBe('link');
    expect(itemProps['aria-disabled']).toBe(true);
  });

  it('handles descendant link with href', function () {
    let {itemProps} = renderItemHook({children: React.createElement('a', {href: 'https://example.com'}, 'Breadcrumb Item')});
    expect(itemProps.tabIndex).toBe(0);
    expect(itemProps.role).toBeUndefined();
    expect(itemProps['aria-disabled']).toBeUndefined();
    expect(typeof itemProps.onKeyDown).toBe('function');
  });
});
