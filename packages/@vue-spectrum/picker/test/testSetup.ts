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

type PickerItem = {
  key: string,
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

function normalizeKey(key: unknown, fallback: string) {
  if (key == null || key === '') {
    return fallback;
  }

  return String(key).replace(/^\.\$/, '');
}

function toRenderedContent(node: React.ReactNode) {
  if (React.isValidElement(node)) {
    return node.props.children;
  }

  return node;
}

function toCollectionItems(props: Record<string, unknown>): PickerItem[] {
  let items: PickerItem[] = [];
  let children = props.children;

  if (Array.isArray(props.items) && typeof children === 'function') {
    for (let [index, item] of (props.items as Array<Record<string, unknown>>).entries()) {
      let key = normalizeKey(item.key ?? item.id, `item-${index}`);
      items.push({
        key,
        rendered: toRenderedContent(children(item))
      });
    }
    return items;
  }

  for (let [index, child] of React.Children.toArray(children).entries()) {
    if (!React.isValidElement(child)) {
      continue;
    }

    items.push({
      key: normalizeKey(child.key, `item-${index}`),
      rendered: child.props.children
    });
  }

  return items;
}

vi.mock('@vue-spectrum/utils', async () => {
  let actual = await vi.importActual<typeof import('@vue-spectrum/utils')>('@vue-spectrum/utils');
  return {
    ...actual,
    classNames,
    SlotProvider: ({children}: {children?: React.ReactNode}) => children,
    dimensionValue: (value: unknown) => typeof value === 'number' ? `${value}px` : value,
    useDOMRef: <T,>(ref: T) => ref,
    useIsMobileDevice: () => false,
    useSlotProps: <T,>(props: T) => ({...(props as Record<string, unknown>)}) as T,
    useUnwrapDOMRef: <T,>(ref: T) => ref
  };
});

vi.mock('@vue-spectrum/provider', () => ({
  useProvider: () => ({scale: 'medium'}),
  useProviderProps: <T,>(props: T) => ({...(props as Record<string, unknown>)}) as T
}));

vi.mock('@vue-spectrum/form', () => ({
  useFormProps: <T,>(props: T) => ({...(props as Record<string, unknown>)}) as T
}));

vi.mock('@vue-spectrum/text', () => ({
  Text: ({children}: {children?: React.ReactNode}) => React.createElement('span', null, children)
}));

vi.mock('@vue-spectrum/button', () => ({
  FieldButton: React.forwardRef(function MockFieldButton(
    props: Record<string, unknown>,
    ref: React.ForwardedRef<HTMLButtonElement>
  ) {
    let {
      children,
      isActive,
      isDisabled,
      isInvalid: _isInvalid,
      isQuiet: _isQuiet,
      autoFocus: _autoFocus,
      UNSAFE_className,
      ...domProps
    } = props;

    return React.createElement(
      'button',
      {
        ...domProps,
        ref,
        className: typeof UNSAFE_className === 'string' ? UNSAFE_className : undefined,
        disabled: Boolean(isDisabled),
        'aria-expanded': isActive ? 'true' : 'false'
      },
      children
    );
  })
}));

vi.mock('@vue-spectrum/label', () => ({
  Field: React.forwardRef(function MockField(
    props: {
      children?: React.ReactNode,
      label?: React.ReactNode,
      labelProps?: Record<string, unknown>,
      wrapperClassName?: string
    } & Record<string, unknown>,
    ref: React.ForwardedRef<HTMLSpanElement>
  ) {
    let {
      children,
      label,
      labelProps,
      wrapperClassName,
      descriptionProps: _descriptionProps,
      errorMessageProps: _errorMessageProps,
      validationErrors: _validationErrors,
      validationDetails: _validationDetails,
      isInvalid: _isInvalid,
      items: _items,
      onSelectionChange: _onSelectionChange,
      onOpenChange: _onOpenChange,
      onLoadMore: _onLoadMore,
      isLoading: _isLoading,
      showErrorIcon: _showErrorIcon,
      includeNecessityIndicatorInAccessibilityName: _includeNecessityIndicatorInAccessibilityName,
      elementType: _elementType,
      ...domProps
    } = props;

    return React.createElement(
      'span',
      {
        ...domProps,
        ref,
        className: wrapperClassName
      },
      label ? React.createElement('span', labelProps, label) : null,
      children
    );
  })
}));

vi.mock('@vue-spectrum/listbox', () => ({
  useListBoxLayout: () => ({type: 'list-layout'}),
  ListBoxBase: React.forwardRef(function MockListBoxBase(
    props: {
      state: {
        collection: {items: PickerItem[]},
        setSelectedKey: (key: string) => void
      }
    } & Record<string, unknown>,
    ref: React.ForwardedRef<HTMLUListElement>
  ) {
    let {
      state,
      autoFocus: _autoFocus,
      disallowEmptySelection: _disallowEmptySelection,
      focusOnPointerEnter: _focusOnPointerEnter,
      shouldSelectOnPressUp: _shouldSelectOnPressUp,
      layout: _layout,
      width: _width,
      UNSAFE_style: _unsafeStyle,
      isLoading: _isLoading,
      showLoadingSpinner: _showLoadingSpinner,
      onLoadMore: _onLoadMore,
      ...domProps
    } = props;

    return React.createElement(
      'ul',
      {
        ...domProps,
        ref,
        role: 'listbox'
      },
      state.collection.items.map((item) =>
        React.createElement(
          'li',
          {
            key: item.key,
            role: 'option',
            onClick: () => state.setSelectedKey(item.key)
          },
          item.rendered
        )
      )
    );
  })
}));

vi.mock('@vue-spectrum/overlays', () => ({
  Popover: ({children, state}: {children?: React.ReactNode, state: {isOpen: boolean}}) =>
    state.isOpen ? React.createElement('div', {'data-testid': 'picker-popover'}, children) : null,
  Tray: ({children, state}: {children?: React.ReactNode, state: {isOpen: boolean}}) =>
    state.isOpen ? React.createElement('div', {'data-testid': 'picker-tray'}, children) : null
}));

vi.mock('@vue-spectrum/progress', () => ({
  ProgressCircle: (props: Record<string, unknown>) => React.createElement('div', {
    role: 'progressbar',
    'aria-label': props['aria-label']
  })
}));

vi.mock('@vue-aria/utils', () => ({
  mergeProps,
  useId: () => `picker-id-${++idCounter}`,
  useLayoutEffect: React.useEffect,
  useResizeObserver: () => {}
}));

vi.mock('@vue-aria/select', () => ({
  HiddenSelect: () => null,
  useSelect: (
    props: Record<string, unknown>,
    state: {isOpen: boolean; open: () => void}
  ) => ({
    labelProps: {
      id: 'picker-label'
    },
    triggerProps: {
      'aria-haspopup': 'listbox',
      'aria-expanded': state.isOpen ? 'true' : 'false',
      'aria-controls': 'picker-listbox',
      'data-testid': props['data-testid'],
      onClick: () => state.open()
    },
    valueProps: {},
    menuProps: {
      id: 'picker-listbox'
    },
    hiddenSelectProps: {},
    descriptionProps: {},
    errorMessageProps: {},
    isInvalid: false,
    validationErrors: [],
    validationDetails: {}
  })
}));

vi.mock('@vue-aria/interactions', () => ({
  PressResponder: ({children, ...props}: {children: React.ReactNode} & Record<string, unknown>) => {
    if (!React.isValidElement(children)) {
      return children;
    }

    let child = children as React.ReactElement<Record<string, unknown>>;
    return React.cloneElement(child, {
      ...props,
      ...child.props,
      onClick: (...args: unknown[]) => {
        (props.onClick as ((...args: unknown[]) => void) | undefined)?.(...args);
        (child.props.onClick as ((...args: unknown[]) => void) | undefined)?.(...args);
      }
    });
  },
  useHover: () => ({
    hoverProps: {},
    isHovered: false
  })
}));

vi.mock('@vue-aria/i18n', () => ({
  useLocalizedStringFormatter: () => ({
    format: (key: string) => {
      if (key === 'placeholder') {
        return 'Select…';
      }

      if (key === 'loading') {
        return 'Loading';
      }

      return key;
    }
  })
}));

vi.mock('@vue-stately/select', () => ({
  useSelectState: (props: Record<string, unknown>) => {
    let items = toCollectionItems(props);
    let [isOpen, setOpen] = React.useState(false);
    let isControlled = props.selectedKey !== undefined;
    let [internalSelectedKey, setInternalSelectedKey] = React.useState<unknown>(props.defaultSelectedKey ?? null);
    let selectedKey = isControlled ? props.selectedKey : internalSelectedKey;
    let selectedItem = items.find((item) => item.key === String(selectedKey ?? '')) ?? null;

    let notifyOpenChange = (open: boolean) => {
      let onOpenChange = props.onOpenChange;
      if (typeof onOpenChange === 'function') {
        onOpenChange(open);
      }
    };

    return {
      collection: {
        items,
        size: items.length
      },
      selectedKey,
      selectedItem,
      isOpen,
      focusStrategy: null,
      open() {
        setOpen(true);
        notifyOpenChange(true);
      },
      close() {
        setOpen(false);
        notifyOpenChange(false);
      },
      setSelectedKey(key: string) {
        if (!isControlled) {
          setInternalSelectedKey(key);
        }

        let onSelectionChange = props.onSelectionChange;
        if (typeof onSelectionChange === 'function') {
          onSelectionChange(key);
        }

        setOpen(false);
        notifyOpenChange(false);
      }
    };
  }
}));
