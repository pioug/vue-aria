/*
 * Copyright 2021 Adobe. All rights reserved.
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
import {fireEvent, render, screen} from '@testing-library/react';
import {pointerMap} from '@vue-aria/test-utils';
import {setInteractionModality, useFocusVisible} from '../src/useFocusVisible';
import userEvent from '@testing-library/user-event';

function Example(props: any) {
  const {isFocusVisible} = useFocusVisible();
  return React.createElement('div', {tabIndex: 0, ...props}, `example${isFocusVisible ? '-focusVisible' : ''}`);
}

function toggleBrowserTabs(win = window) {
  const lastActiveElement = win.document.activeElement;
  if (lastActiveElement) {
    fireEvent(lastActiveElement, new Event('blur'));
  }
  fireEvent(win, new Event('blur'));
  Object.defineProperty(win.document, 'visibilityState', {
    value: 'hidden',
    writable: true
  });
  Object.defineProperty(win.document, 'hidden', {
    value: true,
    writable: true
  });
  fireEvent(win.document, new Event('visibilitychange'));

  Object.defineProperty(win.document, 'visibilityState', {
    value: 'visible',
    writable: true
  });
  Object.defineProperty(win.document, 'hidden', {
    value: false,
    writable: true
  });
  fireEvent(win.document, new Event('visibilitychange'));
  fireEvent(win, new Event('focus', {target: win}));
  if (lastActiveElement) {
    fireEvent(lastActiveElement, new Event('focus'));
  }
}

function toggleBrowserWindow(win = window) {
  fireEvent(win, new Event('blur', {target: win}));
  fireEvent(win, new Event('focus', {target: win}));
}

describe('useFocusVisible', function () {
  let user: ReturnType<typeof userEvent.setup>;

  beforeAll(() => {
    user = userEvent.setup({delay: null, pointerMap});
  });

  beforeEach(() => {
    setInteractionModality('pointer');
    fireEvent.focus(document.body);
  });

  it('returns positive isFocusVisible result after toggling browser tabs after keyboard navigation', async function () {
    render(React.createElement(Example));
    await user.tab();
    let el = screen.getByText('example-focusVisible');

    toggleBrowserTabs();

    expect(el.textContent).toBe('example-focusVisible');
  });

  it('returns negative isFocusVisible result after toggling browser tabs without prior keyboard navigation', async function () {
    render(React.createElement(Example));
    await user.tab();
    let el = screen.getByText('example-focusVisible');

    await user.click(el);
    toggleBrowserTabs();

    expect(el.textContent).toBe('example');
  });

  it('returns positive isFocusVisible result after toggling browser window after keyboard navigation', async function () {
    render(React.createElement(Example));
    await user.tab();
    let el = screen.getByText('example-focusVisible');

    toggleBrowserWindow();

    expect(el.textContent).toBe('example-focusVisible');
  });

  it('returns negative isFocusVisible result after toggling browser window without prior keyboard navigation', async function () {
    render(React.createElement(Example));
    await user.tab();
    let el = screen.getByText('example-focusVisible');

    await user.click(el);
    toggleBrowserWindow();

    expect(el.textContent).toBe('example');
  });
});
