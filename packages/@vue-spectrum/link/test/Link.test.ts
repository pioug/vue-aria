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

import {Link} from '../src';
import React from 'react';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('@vue-aria/utils', async (importOriginal) => {
  let actual = await importOriginal<typeof import('@vue-aria/utils')>();
  return {
    ...actual,
    useRouter: () => ({
      isNative: true,
      open: () => {},
      useHref: (href: string) => href
    }),
    useLinkProps: (props: Record<string, string> = {}) => ({
      href: props.href,
      target: props.target,
      rel: props.rel,
      download: props.download,
      ping: props.ping,
      referrerPolicy: props.referrerPolicy
    })
  };
});

vi.mock('@vue-spectrum/provider', () => ({
  useProviderProps: <T,>(props: T) => props
}));

vi.mock('@vue-aria/i18n', () => ({
  useLocale: () => ({
    locale: 'en-US',
    direction: 'ltr'
  })
}));

describe('Link', () => {
  it('handles defaults', async () => {
    let onPress = vi.fn();
    let user = userEvent.setup();

    render(
      React.createElement(
        Link,
        {onPress},
        'Click me'
      )
    );

    let link = screen.getByText('Click me');
    expect(link).toBeTruthy();

    await user.click(link);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('supports UNSAFE_className', () => {
    render(
      React.createElement(
        Link,
        {UNSAFE_className: 'test-class'},
        'Click me'
      )
    );

    let link = screen.getByText('Click me');
    expect((link.getAttribute('class') || '').includes('test-class')).toBe(true);
  });

  it('wraps string to span', () => {
    render(
      React.createElement(Link, null, 'Click me')
    );

    let link = screen.getByRole('link');
    expect(link).toBeTruthy();
    expect(link.nodeName).toBe('SPAN');
    expect(link.getAttribute('tabIndex')).toBe('0');
  });

  it('supports href', () => {
    render(
      React.createElement(
        Link,
        {href: 'https://adobe.com'},
        'Click me'
      )
    );

    let link = screen.getByRole('link');
    expect(link).toBeTruthy();
    expect(link.nodeName).toBe('A');
    expect((link as HTMLAnchorElement).href).toBe('https://adobe.com/');
  });

  it('wraps custom child element', async () => {
    let onPress = vi.fn();
    let ref = React.createRef<HTMLAnchorElement>();
    let user = userEvent.setup();

    render(
      React.createElement(
        Link,
        {
          UNSAFE_className: 'test-class',
          onPress
        },
        React.createElement(
          'a',
          {
            href: '#only-hash-in-jsdom',
            ref
          },
          'Click me'
        )
      )
    );

    let link = screen.getByRole('link');
    expect(link).toBeTruthy();
    expect(link.nodeName).toBe('A');
    expect(ref.current).toBe(link);
    expect((link.getAttribute('class') || '').includes('test-class')).toBe(true);
    expect(link.getAttribute('href')).toBe('#only-hash-in-jsdom');

    await user.click(link);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('supports custom data attributes', () => {
    render(
      React.createElement(
        Link,
        {'data-testid': 'test'},
        'Click me'
      )
    );

    let link = screen.getByRole('link');
    expect(link.getAttribute('data-testid')).toBe('test');
  });

  it('supports autofocus', () => {
    render(
      React.createElement(
        Link,
        {autoFocus: true},
        'Click me'
      )
    );

    let link = screen.getByRole('link');
    expect(document.activeElement).toBe(link);
  });
});
