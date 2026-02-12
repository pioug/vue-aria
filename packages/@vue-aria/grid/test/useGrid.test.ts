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

import {GridCollection, useGridState} from '@vue-stately/grid';
import {Item} from '@vue-stately/collections';
import {mergeProps} from '@vue-aria/utils';
import {render} from '@testing-library/react';
import {useGrid, useGridCell, useGridRow} from '../src';
import {useListState} from '@vue-stately/list';
import React from 'react';
import userEvent from '@testing-library/user-event';

vi.mock('@vue-aria/utils', async () => {
  let actual = await vi.importActual<any>('@vue-aria/utils');
  return {
    ...actual,
    useSyntheticLinkProps: () => ({})
  };
});

vi.mock('@vue-aria/i18n', () => ({
  useLocale: () => ({
    direction: 'ltr',
    locale: 'en-US'
  }),
  useCollator: () => ({
    compare: (a: string, b: string) => String(a).localeCompare(String(b))
  }),
  useLocalizedStringFormatter: () => ({
    format: () => ''
  })
}));

if (!(globalThis as any).CSS) {
  (globalThis as any).CSS = {};
}

if (!(globalThis as any).CSS.escape) {
  (globalThis as any).CSS.escape = (value: string) => String(value);
}

function Grid(props: any) {
  let {gridFocusMode = 'row', cellFocusMode = 'child'} = props;
  let state = useListState(props);
  let gridState = useGridState({
    ...props,
    selectionMode: 'multiple',
    collection: React.useMemo(() => new GridCollection({
      columnCount: 1,
      items: Array.from(state.collection).map(item => ({
        type: 'item',
        childNodes: [{
          ...item,
          index: 0,
          type: 'cell'
        }]
      }))
    }), [state.collection])
  });

  let ref = React.useRef<HTMLDivElement>(null);
  let {gridProps} = useGrid({
    'aria-label': 'Grid',
    focusMode: gridFocusMode
  }, gridState, ref);

  return React.createElement(
    'div',
    {
      ...gridProps,
      ref
    },
    Array.from(gridState.collection).map(item => React.createElement(Row, {
      focusMode: cellFocusMode,
      item,
      key: item.key,
      state: gridState
    }))
  );
}

function Row({state, item, focusMode}) {
  let rowRef = React.useRef<HTMLDivElement>(null);
  let cellRef = React.useRef<HTMLDivElement>(null);
  let cellNode = Array.from(item.childNodes)[0];
  let {rowProps} = useGridRow({node: item}, state, rowRef);
  let {gridCellProps} = useGridCell({
    node: cellNode,
    focusMode
  }, state, cellRef);

  return React.createElement(
    'div',
    {
      ...rowProps,
      ref: rowRef
    },
    React.createElement(
      'div',
      {
        ...mergeProps(gridCellProps),
        ref: cellRef
      },
      cellNode.rendered
    )
  );
}

function renderGrid(props = {}) {
  return render(
    React.createElement(
      Grid,
      props,
      React.createElement(
        Item,
        {textValue: 'Item 1'},
        React.createElement('button', {'aria-label': 'Switch 1'}, 'Switch 1'),
        React.createElement('button', {'aria-label': 'Switch 2'}, 'Switch 2')
      ),
      React.createElement(
        Item,
        {textValue: 'Item 2'},
        React.createElement('button', {'aria-label': 'Switch 3'}, 'Switch 3'),
        React.createElement('button', {'aria-label': 'Switch 4'}, 'Switch 4'),
        React.createElement('button', {'aria-label': 'Switch 5'}, 'Switch 5')
      ),
      React.createElement(
        Item,
        {textValue: 'Item 3'},
        React.createElement('button', {'aria-label': 'Switch 6'}, 'Switch 6'),
        React.createElement('button', {'aria-label': 'Switch 7'}, 'Switch 7')
      )
    )
  );
}

describe('useGrid', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeAll(() => {
    user = userEvent.setup({delay: null});
  });

  it('gridFocusMode = row, cellFocusMode = cell', async () => {
    let tree = renderGrid({gridFocusMode: 'row', cellFocusMode: 'cell'});

    await user.tab();
    expect(document.activeElement).toBe(tree.getAllByRole('row')[0]);

    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(tree.getAllByRole('gridcell')[0]);

    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(tree.getAllByRole('button')[0]);

    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(tree.getAllByRole('button')[1]);

    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(tree.getAllByRole('row')[0]);

    await user.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(tree.getAllByRole('gridcell')[0]);

    tree.getAllByRole('button')[1].focus();
    await user.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(tree.getAllByRole('button')[0]);

    await user.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(tree.getAllByRole('gridcell')[0]);

    await user.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(tree.getAllByRole('row')[0]);
  });

  it('gridFocusMode = row, cellFocusMode = child', async () => {
    let tree = renderGrid({gridFocusMode: 'row', cellFocusMode: 'child'});

    await user.tab();
    expect(document.activeElement).toBe(tree.getAllByRole('row')[0]);

    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(tree.getAllByRole('button')[0]);

    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(tree.getAllByRole('button')[1]);

    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(tree.getAllByRole('row')[0]);

    await user.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(tree.getAllByRole('button')[1]);

    await user.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(tree.getAllByRole('button')[0]);

    await user.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(tree.getAllByRole('row')[0]);

    await user.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(tree.getAllByRole('button')[1]);
  });

  it('gridFocusMode = cell, cellFocusMode = child', async () => {
    let tree = renderGrid({gridFocusMode: 'cell', cellFocusMode: 'child'});

    await user.tab();
    expect(document.activeElement).toBe(tree.getAllByRole('button')[0]);

    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(tree.getAllByRole('button')[1]);

    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(tree.getAllByRole('button')[0]);

    await user.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(tree.getAllByRole('button')[1]);

    await user.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(tree.getAllByRole('button')[0]);

    await user.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(tree.getAllByRole('button')[1]);
  });

  it('gridFocusMode = cell, cellFocusMode = cell', async () => {
    let tree = renderGrid({gridFocusMode: 'cell', cellFocusMode: 'cell'});

    await user.tab();
    expect(document.activeElement).toBe(tree.getAllByRole('gridcell')[0]);

    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(tree.getAllByRole('button')[0]);

    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(tree.getAllByRole('button')[1]);

    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(tree.getAllByRole('gridcell')[0]);

    await user.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(tree.getAllByRole('button')[1]);

    await user.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(tree.getAllByRole('button')[0]);

    await user.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(tree.getAllByRole('gridcell')[0]);
  });
});
