/*
 * Copyright 2024 Adobe. All rights reserved.
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
import {renderToString} from 'react-dom/server';

vi.mock('@vue-spectrum/style-macro-s1', () => ({
  focusRing: () => ({}),
  style: () => () => ''
}));

vi.mock('@vue-spectrum/utils', () => ({
  SlotProvider: ({children}: {children?: React.ReactNode}) => children,
  classNames: (...values: Array<string | null | undefined>) => values.filter(Boolean).join(' '),
  useDOMRef: (ref: unknown) => ref,
  useStyleProps: () => ({
    styleProps: {}
  })
}));

vi.mock('@vue-spectrum/checkbox', () => ({
  Checkbox: (props: Record<string, unknown>) => React.createElement('input', {type: 'checkbox', ...props})
}));

vi.mock('@vue-aria/button', () => ({
  useButton: () => ({
    buttonProps: {}
  })
}));

vi.mock('@vue-aria/i18n', () => ({
  useLocale: () => ({
    direction: 'ltr'
  })
}));

vi.mock('react-aria-components', () => {
  let ButtonContext = React.createContext({});

  return {
    ButtonContext,
    Collection: ({children}: {children?: React.ReactNode}) => children,
    Tree: React.forwardRef(function Tree(props: Record<string, unknown>, ref: React.ForwardedRef<HTMLDivElement>) {
      let {
        className,
        children,
        selectionBehavior: _selectionBehavior,
        ...domProps
      } = props;

      return React.createElement('div', {
        ...domProps,
        className: typeof className === 'string' ? className : undefined,
        ref,
        role: 'tree'
      }, children);
    }),
    TreeItem: ({children, className, ...props}: Record<string, unknown> & {children?: React.ReactNode}) => (
      React.createElement(
        'div',
        {
          role: 'treeitem',
          ...props,
          className: typeof className === 'string' ? className : undefined
        },
        children
      )
    ),
    TreeItemContent: ({children}: {children?: React.ReactNode | ((props: Record<string, unknown>) => React.ReactNode)}) => {
      let renderProps = {
        isExpanded: false,
        hasChildItems: false,
        level: 1,
        selectionMode: 'none',
        selectionBehavior: 'replace',
        isDisabled: false,
        isSelected: false,
        isFocusVisible: false,
        state: {
          collection: {
            getFirstKey: () => 'one'
          }
        },
        id: 'one'
      };

      return React.createElement(
        'div',
        null,
        typeof children === 'function' ? children(renderProps) : children
      );
    },
    useContextProps: (props: Record<string, unknown>, ref: unknown) => [props, ref]
  };
});

import {TreeView, TreeViewItem, TreeViewItemContent} from '../src';

describe('TreeView SSR', () => {
  it('should render without errors', () => {
    expect(() => {
      renderToString(
        React.createElement(
          TreeView,
          {'aria-label': 'Tree'},
          React.createElement(
            TreeViewItem,
            {id: 'one'},
            React.createElement(TreeViewItemContent, null, 'Node One')
          )
        )
      );
    }).not.toThrow();
  });
});
