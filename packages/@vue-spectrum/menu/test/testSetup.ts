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

type MockTreeItem = {
  key: string,
  type: 'item',
  textValue: string,
  rendered: React.ReactNode
};

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

function mergeProps(...propsList: Array<Record<string, unknown> | undefined>) {
  let merged: Record<string, unknown> = {};

  for (let props of propsList) {
    if (!props) {
      continue;
    }

    for (let [key, value] of Object.entries(props)) {
      let previousValue = merged[key];
      if (typeof previousValue === 'function' && typeof value === 'function' && key.startsWith('on')) {
        merged[key] = (...args: unknown[]) => {
          previousValue(...args);
          value(...args);
        };
      } else {
        merged[key] = value;
      }
    }
  }

  return merged;
}

function toItems(props: Record<string, unknown>) {
  let fromItems = Array.isArray(props.items)
    ? (props.items as Array<Record<string, unknown>>).map((item, index) => ({
        key: String(item.key ?? item.id ?? `item-${index}`),
        type: 'item' as const,
        textValue: String(item.name ?? item.label ?? item.key ?? `Item ${index + 1}`),
        rendered: item.name ?? item.label ?? item.key ?? `Item ${index + 1}`
      }))
    : [];

  if (fromItems.length > 0) {
    return fromItems;
  }

  let fromChildren: MockTreeItem[] = [];
  for (let [index, child] of React.Children.toArray(props.children).entries()) {
    if (!React.isValidElement(child)) {
      continue;
    }

    fromChildren.push({
      key: String(child.key ?? `item-${index}`),
      type: 'item',
      textValue: typeof child.props.children === 'string' ? child.props.children : `Item ${index + 1}`,
      rendered: child.props.children
    });
  }

  return fromChildren;
}

vi.mock('@vue-spectrum/utils', async () => {
  let actual = await vi.importActual<typeof import('@vue-spectrum/utils')>('@vue-spectrum/utils');
  return {
    ...actual,
    classNames,
    SlotProvider: ({children}: {children?: React.ReactNode}) => children,
    useDOMRef: <T,>(ref: T) => {
      if (ref && typeof ref === 'object' && 'current' in (ref as Record<string, unknown>)) {
        return ref;
      }
      return React.useRef(null);
    },
    unwrapDOMRef: <T,>(ref: T) => {
      if (ref && typeof ref === 'object' && 'current' in (ref as Record<string, unknown>)) {
        return (ref as {current: unknown}).current;
      }
      return ref;
    },
    useIsMobileDevice: () => false,
    useStyleProps: (props: Record<string, unknown> = {}) => ({
      styleProps: {
        className: typeof props.UNSAFE_className === 'string' ? props.UNSAFE_className : undefined,
        style: props.UNSAFE_style
      }
    }),
    useSlotProps: <T,>(props: T) => props
  };
});

vi.mock('@vue-aria/utils', () => ({
  mergeProps,
  useLayoutEffect: React.useEffect,
  useSyncRef: (context: {ref?: {current: unknown}} | undefined, ref: {current: unknown} | null | undefined) => {
    if (context?.ref && ref) {
      context.ref.current = ref.current;
    }
  },
  useSlotId: () => 'mock-slot-id',
  filterDOMProps: (props: Record<string, unknown>) => {
    let domProps: Record<string, unknown> = {};
    for (let [key, value] of Object.entries(props)) {
      if (key.startsWith('aria-') || key.startsWith('data-') || key === 'id') {
        domProps[key] = value;
      }
    }
    return domProps;
  },
  isFocusWithin: () => false
}));

vi.mock('@vue-aria/i18n', () => ({
  useLocalizedStringFormatter: () => ({
    format: (key: string, args?: {prevMenuButton?: string}) => {
      if (key === 'moreActions') {
        return 'More actions';
      }

      if (key === 'backButton') {
        return `Back to ${args?.prevMenuButton ?? ''}`.trim();
      }

      return key;
    }
  }),
  useLocale: () => ({
    locale: 'en-US',
    direction: 'ltr'
  })
}));

vi.mock('@vue-aria/focus', () => ({
  FocusScope: ({children}: {children?: React.ReactNode}) => children
}));

vi.mock('@vue-spectrum/button', () => ({
  ActionButton: ({
    children,
    onPress,
    isDisabled,
    onClick,
    onAction: _onAction,
    items: _items,
    ...props
  }: {
    children?: React.ReactNode;
    onPress?: () => void;
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
    isDisabled?: boolean;
  } & Record<string, unknown>) =>
    React.createElement('button', {
      ...props,
      type: 'button',
      disabled: Boolean(isDisabled),
      onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
        if (!isDisabled) {
          onPress?.();
        }
        onClick?.(event);
      }
    }, children)
}));

vi.mock('@vue-spectrum/overlays', () => ({
  Popover: ({
    children,
    state
  }: {
    children?: React.ReactNode,
    state?: {isOpen?: boolean}
  }) => state?.isOpen ? React.createElement('div', {'data-testid': 'menu-popover'}, children) : null,
  Tray: ({
    children,
    state
  }: {
    children?: React.ReactNode,
    state?: {isOpen?: boolean}
  }) => state?.isOpen ? React.createElement('div', {'data-testid': 'menu-tray'}, children) : null
}));

vi.mock('@vue-aria/interactions', () => ({
  useInteractOutside: () => undefined,
  PressResponder: ({
    children,
    onPress,
    ref
  }: {
    children?: React.ReactNode,
    onPress?: () => void,
    ref?: React.Ref<HTMLElement>
  }) => {
    if (!React.isValidElement(children)) {
      return children;
    }

    let child = children as React.ReactElement<Record<string, unknown>>;
    return React.cloneElement(child, {
      ...child.props,
      ref,
      onClick: (...args: unknown[]) => {
        onPress?.();
        (child.props.onClick as ((...args: unknown[]) => void) | undefined)?.(...args);
      }
    });
  }
}));

vi.mock('@vue-aria/menu', () => ({
  useMenu: () => ({
    menuProps: {
      role: 'menu'
    }
  }),
  useMenuTrigger: (_props: Record<string, unknown>, state: {toggle: () => void}) => ({
    menuTriggerProps: {
      onPress: () => state.toggle()
    },
    menuProps: {}
  }),
  useSubmenuTrigger: (
    _props: Record<string, unknown>,
    state: {open: () => void; close: () => void}
  ) => ({
    submenuTriggerProps: {
      onPress: () => state.open(),
      'aria-haspopup': 'menu'
    },
    submenuProps: {
      onClose: () => state.close()
    },
    popoverProps: {}
  })
}));

vi.mock('@vue-stately/menu', () => ({
  useMenuTriggerState: (props: Record<string, unknown> = {}) => {
    let isControlled = props.isOpen !== undefined;
    let [internalOpen, setInternalOpen] = React.useState(Boolean(props.defaultOpen));
    let isOpen = isControlled ? Boolean(props.isOpen) : internalOpen;

    let setOpen = (next: boolean) => {
      if (!isControlled) {
        setInternalOpen(next);
      }
      if (typeof props.onOpenChange === 'function') {
        props.onOpenChange(next);
      }
    };

    return {
      isOpen,
      focusStrategy: null,
      expandedKeysStack: [],
      open: () => setOpen(true),
      close: () => setOpen(false),
      toggle: () => setOpen(!isOpen)
    };
  },
  useSubmenuTriggerState: () => {
    let [isOpen, setOpen] = React.useState(false);
    return {
      isOpen,
      open: () => setOpen(true),
      close: () => setOpen(false)
    };
  }
}));

vi.mock('@vue-stately/tree', () => ({
  useTreeState: (props: Record<string, unknown> = {}) => {
    let items = toItems(props);
    let byKey = new Map(items.map((item) => [item.key, item]));

    return {
      collection: {
        [Symbol.iterator]: function* () {
          for (let item of items) {
            yield item;
          }
        },
        getItem: (key: unknown) => byKey.get(String(key)) ?? null
      },
      onAction: props.onAction
    };
  }
}));

vi.mock('../src/MenuItem', () => ({
  MenuItem: ({
    item,
    state
  }: {
    item: {key: string; rendered?: React.ReactNode; textValue?: string},
    state: {onAction?: (key: string) => void}
  }) => React.createElement(
    'button',
    {
      type: 'button',
      role: 'menuitem',
      onClick: () => state.onAction?.(item.key)
    },
    item.rendered ?? item.textValue ?? item.key
  )
}));

vi.mock('../src/MenuSection', () => ({
  MenuSection: ({
    item
  }: {
    item: {key: string}
  }) => React.createElement('div', {role: 'group'}, item.key)
}));
