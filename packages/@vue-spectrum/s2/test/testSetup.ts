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

(globalThis as {React?: typeof React}).React = React;

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

class IntersectionObserverMock {
  root = null;
  rootMargin = '';
  thresholds = [0];
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

if (!window.matchMedia) {
  window.matchMedia = (query: string): MediaQueryList => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false
  });
}

if (!window.ResizeObserver) {
  window.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;
}

if (!window.IntersectionObserver) {
  window.IntersectionObserver = IntersectionObserverMock as unknown as typeof IntersectionObserver;
}

if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}

if (!Element.prototype.animate) {
  Element.prototype.animate = () =>
    ({
      finished: Promise.resolve()
    }) as Animation;
}

if (!Element.prototype.getAnimations) {
  Element.prototype.getAnimations = () => [];
}

const passthroughComponent = React.forwardRef<HTMLElement, Record<string, unknown>>(function PassthroughComponent(
  props,
  ref
) {
  let {children, ...otherProps} = props;
  return React.createElement('div', {...otherProps, ref}, children as React.ReactNode);
});

const passthroughButton = React.forwardRef<HTMLButtonElement, Record<string, unknown>>(function PassthroughButton(
  props,
  ref
) {
  let {children, ...otherProps} = props;
  return React.createElement('button', {...otherProps, type: 'button', ref}, children as React.ReactNode);
});

vi.mock('../style', () => {
  function style() {
    const resolver = () => '';
    resolver.toString = () => '';
    return resolver;
  }

  function iconStyle() {
    return '';
  }

  function focusRing() {
    return {};
  }

  return {
    style,
    iconStyle,
    focusRing,
    size: (value: number) => `${value}px`,
    space: (value: number) => `[${value}px]`,
    fontRelative: (value: number) => `[${value}px]`,
    lightDark: (light: string, dark: string) => `light-dark(${light}, ${dark})`,
    colorMix: () => '[color-mix]',
    color: (value: string) => value,
    baseColor: (value: string) => value
  };
});

vi.mock('../style/spectrum-theme', () => ({
  edgeToText: () => '[edge-to-text]',
  linearGradient: () => '[linear-gradient]'
}));

vi.mock('../style/style-macro', () => ({
  raw: () => '[raw]',
  keyframes: () => 'mock-keyframes',
  parseArbitraryValue: (value: string) => {
    if (typeof value === 'string' && value.startsWith('[') && value.endsWith(']')) {
      return value.slice(1, -1);
    }
    return undefined;
  }
}));

vi.mock('../src/Provider', () => ({
  Provider: ({children}: {children?: React.ReactNode}) => React.createElement(React.Fragment, null, children),
  ColorSchemeContext: React.createContext({colorScheme: 'light'})
}));

vi.mock('react-aria-components', () => {
  const contexts = new Map<string, React.Context<unknown>>();
  class Size {
    width: number;
    height: number;
    constructor(width = 0, height = 0) {
      this.width = width;
      this.height = height;
    }
  }

  class Rect {
    x: number;
    y: number;
    width: number;
    height: number;
    constructor(x = 0, y = 0, width = 0, height = 0) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
    }
  }

  class LayoutBase {
    constructor(..._args: unknown[]) {}
  }

  const stateHelpers = {
    composeRenderProps: (value: unknown, fn: (resolved: unknown) => unknown) =>
      typeof fn === 'function' ? fn(value) : value,
    useContextProps: <TProps, TRef>(props: TProps, ref: TRef) => [props, ref] as const,
    useSlottedContext: () => null,
    useLocale: () => ({locale: 'en-US', direction: 'ltr'}),
    useTableOptions: () => ({}),
    parseColor: () => ({toString: () => '#000'})
  };

  const baseModule: Record<string, unknown> = {
    Provider: ({children}: {children?: React.ReactNode}) =>
      React.createElement(React.Fragment, null, children),
    Button: passthroughButton,
    MenuItem: passthroughComponent,
    Toolbar: passthroughComponent,
    Label: passthroughComponent,
    Text: passthroughComponent,
    Input: React.forwardRef<HTMLInputElement, Record<string, unknown>>(function MockInput(props, ref) {
      return React.createElement('input', {...props, ref});
    }),
    TextArea: React.forwardRef<HTMLTextAreaElement, Record<string, unknown>>(function MockTextArea(props, ref) {
      return React.createElement('textarea', {...props, ref});
    }),
    Link: React.forwardRef<HTMLAnchorElement, Record<string, unknown>>(function MockLink(props, ref) {
      let {children, ...otherProps} = props;
      return React.createElement('a', {...otherProps, href: '#', ref}, children as React.ReactNode);
    }),
    Size,
    Rect,
    ListLayout: LayoutBase,
    GridLayout: LayoutBase,
    TableLayout: LayoutBase,
    WaterfallLayout: LayoutBase,
    ...stateHelpers
  };

  return new Proxy(baseModule, {
    get(target, prop: string) {
      if (prop in target) {
        return target[prop];
      }
      if (prop.endsWith('Context')) {
        if (!contexts.has(prop)) {
          contexts.set(prop, React.createContext(null));
        }
        return contexts.get(prop);
      }
      if (prop.startsWith('use')) {
        return () => ({});
      }
      if (
        prop.includes('Button')
        || prop === 'Tab'
        || prop === 'MenuItem'
        || prop === 'SelectionIndicator'
      ) {
        return passthroughButton;
      }
      return passthroughComponent;
    }
  });
});

vi.mock('react-aria', () => ({
  FocusScope: ({children}: {children?: React.ReactNode}) => React.createElement(React.Fragment, null, children),
  VisuallyHidden: ({children}: {children?: React.ReactNode}) => React.createElement(React.Fragment, null, children),
  useButton: () => ({buttonProps: {}}),
  useHover: () => ({hoverProps: {}, isHovered: false}),
  useFocusRing: () => ({focusProps: {}, isFocusVisible: false}),
  useFocusVisible: () => ({isFocusVisible: false}),
  useKeyboard: () => ({keyboardProps: {}}),
  useLabel: () => ({labelProps: {}, fieldProps: {}}),
  useModalOverlay: () => ({modalProps: {}, underlayProps: {}}),
  useOverlayTrigger: () => ({triggerProps: {}, overlayProps: {}}),
  useObjectRef: (ref: unknown) => ref,
  useLocalizedStringFormatter: () => ({format: (value: string) => value}),
  useLocale: () => ({locale: 'en-US', direction: 'ltr'}),
  useId: () => 'mock-id',
  mergeProps: (...args: Record<string, unknown>[]) => Object.assign({}, ...args)
}));

vi.mock('react-stately', () => ({
  useMenuTriggerState: () => ({isOpen: false, open: vi.fn(), close: vi.fn(), toggle: vi.fn()}),
  useOverlayTriggerState: () => ({isOpen: false, open: vi.fn(), close: vi.fn(), toggle: vi.fn()}),
  useListData: () => ({items: []}),
  useTreeData: () => ({items: []}),
  useAsyncList: () => ({items: []})
}));

vi.mock('@react-stately/utils', () => ({
  useControlledState: <T>(value: T, defaultValue: T) => [value ?? defaultValue, vi.fn()] as const
}));

vi.mock('@react-stately/layout', () => ({
  LayoutNode: class LayoutNode {}
}));
