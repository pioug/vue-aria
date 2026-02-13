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
import {renderToString} from 'react-dom/server';

let mockState = {collection: []};
let mockLayout = {type: 'layout'};

vi.mock('@vue-stately/list', () => ({
  useListState: () => mockState
}));

vi.mock('@vue-spectrum/utils', () => ({
  useDOMRef: (ref: unknown) => ref
}));

vi.mock('../src/ListBoxBase', () => ({
  useListBoxLayout: () => mockLayout,
  ListBoxBase: React.forwardRef(function MockListBoxBase(props: Record<string, unknown>, ref: React.ForwardedRef<HTMLDivElement>) {
    return React.createElement('div', {
      ...props,
      ref,
      role: 'listbox'
    });
  })
}));

import {ListBox} from '../src';

describe('ListBox SSR', () => {
  it('should render without errors', () => {
    expect(() => {
      renderToString(
        React.createElement(
          ListBox,
          {'aria-label': 'Listbox'},
          React.createElement('div', {key: 'left'}, 'Left'),
          React.createElement('div', {key: 'middle'}, 'Middle'),
          React.createElement('div', {key: 'right'}, 'Right')
        )
      );
    }).not.toThrow();
  });
});
