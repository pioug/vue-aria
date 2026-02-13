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

let virtualizerSpy = vi.fn();

vi.mock('@vue-spectrum/provider', () => ({
  useProvider: () => ({
    scale: 'medium'
  })
}));

vi.mock('@vue-spectrum/utils', () => ({
  classNames: (...values: Array<unknown>) => values
    .map((value) => typeof value === 'string' ? value : '')
    .filter(Boolean)
    .join(' '),
  useDOMRef: (ref: unknown) => ref,
  useStyleProps: () => ({
    styleProps: {}
  }),
  useUnwrapDOMRef: (ref: unknown) => ref
}));

vi.mock('@vue-aria/i18n', () => ({
  useCollator: () => ({
    compare: (a: string, b: string) => a.localeCompare(b)
  }),
  useLocale: () => ({
    direction: 'ltr'
  }),
  useLocalizedStringFormatter: () => ({
    format: (key: string) => key
  })
}));

vi.mock('@vue-stately/list', () => ({
  useListState: () => ({
    collection: [
      {key: 'one', rendered: 'One', textValue: 'One', childNodes: []}
    ]
  })
}));

vi.mock('@vue-stately/grid', () => {
  class GridCollection<T extends {key: string}> {
    private items: T[];
    public size: number;

    constructor(options: {items: T[]}) {
      this.items = options.items;
      this.size = this.items.length;
    }

    [Symbol.iterator]() {
      return this.items[Symbol.iterator]();
    }

    getItem(key: string) {
      return this.items.find((item) => item.key === key) ?? null;
    }

    getFirstKey() {
      return this.items[0]?.key ?? null;
    }
  }

  return {
    GridCollection,
    useGridState: () => ({
      disabledKeys: new Set(),
      selectionManager: {
        focusedKey: null,
        selectionMode: 'none'
      },
      collection: {
        size: 1,
        getFirstKey: () => 'one'
      }
    })
  };
});

vi.mock('@vue-aria/grid', () => ({
  useGrid: () => ({
    gridProps: {
      role: 'grid'
    }
  }),
  useGridRow: () => ({
    rowProps: {}
  }),
  useGridCell: () => ({
    gridCellProps: {}
  })
}));

vi.mock('@vue-aria/utils', () => ({
  mergeProps: (...args: Array<Record<string, unknown>>) => Object.assign({}, ...args)
}));

vi.mock('@vue-aria/virtualizer', () => ({
  Virtualizer: ({children, ...props}: {children?: React.ReactNode} & Record<string, unknown>) => {
    virtualizerSpy(props);
    return React.createElement(
      'div',
      {role: 'grid'},
      typeof children === 'function' ? null : children
    );
  },
  VirtualizerItem: ({children}: {children?: React.ReactNode}) => children
}));

vi.mock('../src/CardBase', () => ({
  CardBase: ({children}: {children?: React.ReactNode}) => React.createElement('article', null, children)
}));

vi.mock('@vue-spectrum/progress', () => ({
  ProgressCircle: () => React.createElement('div')
}));

import {CardView} from '../src';

describe('CardView', () => {
  beforeEach(() => {
    virtualizerSpy.mockClear();
  });

  it('renders a grid virtualizer', () => {
    render(
      React.createElement(
        CardView,
        {
          'aria-label': 'Card View',
          layout: class MockLayout {
            public layoutType = 'grid';
          }
        },
        React.createElement('div', {key: 'one'}, 'One')
      )
    );

    expect(screen.getByRole('grid')).toBeTruthy();
    expect(virtualizerSpy).toHaveBeenCalledTimes(1);
  });
});
