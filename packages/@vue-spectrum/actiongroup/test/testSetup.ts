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

let idCounter = 0;

interface MockCollectionNode {
  key: string,
  rendered: React.ReactNode,
  props: Record<string, unknown>,
  textValue?: string
}

function createCollection(children: React.ReactNode): MockCollectionNode[] {
  return React.Children.toArray(children).map((child, index) => {
    if (!React.isValidElement(child)) {
      return {
        key: String(index),
        rendered: child,
        props: {}
      };
    }

    let key = child.key == null ? String(index) : String(child.key);
    let rendered = child.props.children;
    let textValue = typeof rendered === 'string' ? rendered : undefined;

    return {
      key,
      rendered,
      props: child.props,
      textValue
    };
  });
}

function classNames(...values: Array<unknown>) {
  let classes: string[] = [];

  for (let value of values) {
    if (!value) {
      continue;
    }

    if (typeof value === 'string') {
      classes.push(value);
      continue;
    }

    if (typeof value === 'object') {
      for (let [key, enabled] of Object.entries(value)) {
        if (enabled) {
          classes.push(key);
        }
      }
    }
  }

  return classes.join(' ');
}

function mergeProps(...args: Array<Record<string, unknown> | null | undefined>) {
  return Object.assign({}, ...args.filter(Boolean));
}

function filterDOMProps(props: Record<string, unknown> = {}) {
  let domProps: Record<string, unknown> = {};
  for (let [key, value] of Object.entries(props)) {
    if (key.startsWith('aria-') || key.startsWith('data-')) {
      domProps[key] = value;
    }
  }

  return domProps;
}

vi.mock('@vue-spectrum/button', () => ({
  ActionButton: React.forwardRef(function MockActionButton(props: Record<string, unknown>, ref: React.ForwardedRef<HTMLButtonElement>) {
    let {
      UNSAFE_className,
      isDisabled,
      hideButtonText: _hideButtonText,
      staticColor: _staticColor,
      onPress,
      ...domProps
    } = props;

    return React.createElement('button', {
      ...domProps,
      className: typeof UNSAFE_className === 'string' ? UNSAFE_className : undefined,
      disabled: Boolean(isDisabled),
      onClick: typeof onPress === 'function' ? () => onPress() : undefined,
      ref
    });
  })
}));

vi.mock('@spectrum-icons/ui/ChevronDownMedium', () => ({
  default: () => React.createElement('span', {'aria-hidden': true})
}));

vi.mock('@spectrum-icons/workflow/More', () => ({
  default: () => React.createElement('span', {'aria-hidden': true})
}));

vi.mock('@vue-spectrum/utils', () => ({
  classNames,
  ClearSlots: ({children}: {children?: React.ReactNode}) => children,
  SlotProvider: ({children}: {children?: React.ReactNode}) => children,
  useDOMRef: (ref: unknown) => ref,
  useSlotProps: (props: unknown) => props,
  useStyleProps: () => ({
    styleProps: {}
  })
}));

vi.mock('@vue-aria/utils', () => ({
  filterDOMProps,
  mergeProps,
  useId: () => {
    idCounter += 1;
    return `actiongroup-id-${idCounter}`;
  },
  useLayoutEffect: () => {},
  useResizeObserver: () => {},
  useValueEffect: <T,>(initialValue: T): [T, (value: T | (() => Generator<T, void, unknown>)) => void] => {
    let [state, setState] = React.useState(initialValue);

    let setValue = (value: T | (() => Generator<T, void, unknown>)) => {
      if (typeof value === 'function') {
        let generator = value();
        let next = generator.next();
        if (!next.done) {
          setState(next.value);
        }
        return;
      }

      setState(value);
    };

    return [state, setValue];
  }
}));

vi.mock('@vue-aria/focus', () => ({
  FocusScope: ({children}: {children?: React.ReactNode}) => children
}));

vi.mock('@vue-spectrum/menu', () => ({
  Item: ({children}: {children?: React.ReactNode}) => children,
  MenuTrigger: ({children}: {children?: React.ReactNode}) => children,
  Menu: ({children, items}: {children?: ((item: MockCollectionNode) => React.ReactNode) | React.ReactNode, items?: MockCollectionNode[]}) => (
    React.createElement(
      'div',
      {role: 'menu'},
      typeof children === 'function' ? (items ?? []).map((item) => children(item)) : children
    )
  )
}));

vi.mock('@vue-stately/list', () => ({
  useListState: (props: Record<string, unknown>) => {
    let nodes = createCollection(props.children as React.ReactNode);
    let disabledKeys = new Set(props.disabledKeys as Iterable<string> | undefined);
    let selectionMode = (props.selectionMode as string | undefined) ?? 'none';

    let collection = {
      size: nodes.length,
      [Symbol.iterator]: () => nodes[Symbol.iterator](),
      getItem: (key: string) => nodes.find((node) => node.key === key) ?? null
    };

    return {
      collection,
      disabledKeys,
      selectionManager: {
        selectionMode,
        selectedKeys: new Set<string>(),
        disallowEmptySelection: false,
        firstSelectedKey: null,
        isEmpty: true,
        isSelected: (_key: string) => false,
        setSelectedKeys: () => {}
      }
    };
  }
}));

vi.mock('@vue-aria/interactions', () => ({
  PressResponder: ({children}: {children?: React.ReactNode}) => children,
  useHover: () => ({
    hoverProps: {},
    isHovered: false
  })
}));

vi.mock('@vue-spectrum/provider', () => ({
  Provider: ({children}: {children?: React.ReactNode}) => children,
  useProviderProps: (props: unknown) => props
}));

vi.mock('@vue-spectrum/text', () => ({
  Text: ({children}: {children?: React.ReactNode}) => React.createElement('span', null, children)
}));

vi.mock('@vue-spectrum/tooltip', () => ({
  Tooltip: ({children}: {children?: React.ReactNode}) => React.createElement('span', null, children),
  TooltipTrigger: ({children}: {children?: React.ReactNode}) => children
}));

vi.mock('@vue-aria/actiongroup', () => ({
  useActionGroup: (props: Record<string, unknown>) => {
    let role = props.selectionMode === 'single' ? 'radiogroup' : 'toolbar';
    return {
      actionGroupProps: {
        role,
        'aria-orientation': props.orientation ?? 'horizontal',
        'aria-disabled': props.isDisabled ? 'true' : undefined
      }
    };
  },
  useActionGroupItem: (props: {key: string}, state: {selectionManager: {selectionMode: string, isSelected: (key: string) => boolean}}) => {
    let isSingle = state.selectionManager.selectionMode === 'single';
    return {
      buttonProps: isSingle
        ? {role: 'radio', 'aria-checked': state.selectionManager.isSelected(props.key)}
        : {role: 'button'}
    };
  }
}));

vi.mock('@vue-aria/i18n', () => ({
  useLocalizedStringFormatter: () => ({
    format: (value: string) => value
  })
}));
