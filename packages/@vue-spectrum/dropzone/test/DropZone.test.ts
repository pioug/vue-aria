/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {DropZone} from '../src';
import React from 'react';
import {render} from '@testing-library/react';

vi.mock('@vue-aria/i18n', () => ({
  useLocale: () => ({
    locale: 'en-US',
    direction: 'ltr'
  }),
  useLocalizedStringFormatter: () => ({
    format: (value: string) => value
  })
}));

describe('DropZone', () => {
  it('attaches a ref on the outer most div', () => {
    let dropZoneRef = React.createRef<{UNSAFE_getDOMNode(): HTMLElement | null}>();

    let tree = render(
      React.createElement(
        DropZone,
        {
          ref: dropZoneRef,
          'data-testid': 'dropzone'
        },
        React.createElement(
          'button',
          {
            'data-testid': 'button',
            type: 'button'
          },
          'Select a file'
        )
      )
    );

    let dropzone = tree.getByTestId('dropzone');
    let button = tree.getByTestId('button');
    expect(dropzone).toBe(tree.container.firstElementChild);
    expect(dropZoneRef.current?.UNSAFE_getDOMNode()).toBe(dropzone);
    expect(dropzone).not.toBe(button);
  });
});
