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

import {ClipboardEvent, DataTransfer} from './mocks';
import {fireEvent, render} from '@testing-library/react';
import React from 'react';
import {useClipboard} from '../src';
import userEvent from '@testing-library/user-event';

vi.mock('@vue-aria/i18n', () => ({
  useLocale: () => ({
    direction: 'ltr',
    locale: 'en-US'
  }),
  useLocalizedStringFormatter: () => ({
    format: () => ''
  })
}));

function Copyable(props: any) {
  let {clipboardProps} = useClipboard({
    getItems: () => [
      {
        'text/plain': 'hello world'
      }
    ],
    ...props
  });

  return React.createElement(
    'div',
    {
      ...clipboardProps,
      role: 'button',
      tabIndex: 0
    },
    'Copy'
  );
}

describe('useClipboard', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeAll(() => {
    user = userEvent.setup({delay: null});
  });

  it('copies items to the clipboard when focused', async () => {
    let onCopy = vi.fn();
    let tree = render(React.createElement(Copyable, {onCopy}));
    let button = tree.getByRole('button');

    await user.tab();
    expect(document.activeElement).toBe(button);

    let clipboardData = new DataTransfer();
    let allowDefault = fireEvent(button, new ClipboardEvent('beforecopy', {clipboardData}));
    expect(allowDefault).toBe(false);

    fireEvent(button, new ClipboardEvent('copy', {clipboardData}));
    expect(clipboardData.types).toContain('text/plain');
    expect(onCopy).toHaveBeenCalledTimes(1);
  });
});
