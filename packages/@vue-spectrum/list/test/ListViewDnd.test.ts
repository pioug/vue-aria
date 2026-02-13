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
import {render, screen} from '@testing-library/react';

import './testSetup';
import {Item, ListView} from '../src';

describe('ListView drag and drop', () => {
  it('renders a custom drag preview when draggable hooks are provided', () => {
    let useDraggableCollectionState = vi.fn(() => ({
      draggedKey: 'foo',
      draggingKeys: new Set(['foo'])
    }));
    let useDraggableCollection = vi.fn();
    let renderPreview = vi.fn((keys: Set<string>, draggedKey: string) =>
      React.createElement('span', null, `Preview for ${draggedKey} (${keys.size})`)
    );
    let DragPreview = React.forwardRef(function MockDragPreview(
      props: {children?: (() => React.ReactNode) | React.ReactNode},
      ref: React.ForwardedRef<HTMLDivElement>
    ) {
      let content = typeof props.children === 'function' ? props.children() : props.children;
      return React.createElement('div', {ref, 'data-testid': 'drag-preview'}, content);
    });

    render(
      React.createElement(
        ListView,
        {
          items: [{key: 'foo', label: 'Foo'}],
          'aria-label': 'List',
          dragAndDropHooks: {
            useDraggableCollectionState,
            useDraggableCollection,
            renderPreview,
            DragPreview
          }
        } as any,
        (item: {label: string}) => React.createElement(Item, {textValue: item.label}, item.label)
      )
    );

    expect(useDraggableCollectionState).toHaveBeenCalledTimes(1);
    expect(useDraggableCollection).toHaveBeenCalledTimes(1);
    expect(renderPreview).toHaveBeenCalledWith(new Set(['foo']), 'foo');
    expect(screen.getByTestId('drag-preview').textContent).toContain('Preview for foo (1)');
  });
});
