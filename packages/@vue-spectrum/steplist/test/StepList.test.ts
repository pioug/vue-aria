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

import {Item, StepList} from '../src';
import React from 'react';
import {render} from '@testing-library/react';

vi.mock('../src/StepListItem', async () => {
  let React = await vi.importActual<typeof import('react')>('react');

  return {
    StepListItem: ({item, isDisabled}: {item: {index?: number; rendered?: React.ReactNode}; isDisabled?: boolean}) => {
      let isFirst = item.index === 0;
      let itemDisabled = !isFirst || Boolean(isDisabled);

      return React.createElement(
        'li',
        null,
        React.createElement(
          'a',
          {
            'aria-current': isFirst ? 'step' : undefined,
            'aria-disabled': itemDisabled ? 'true' : undefined,
            href: '#',
            tabIndex: isFirst ? 0 : undefined
          },
          item.rendered
        )
      );
    }
  };
});

vi.mock('@vue-aria/steplist', async () => {
  let React = await vi.importActual<typeof import('react')>('react');

  return {
    useStepList: (props: Record<string, any>, state: {selectedKey?: string}) => {
      React.useEffect(() => {
        props.onSelectionChange?.(state.selectedKey);
      }, [props, state.selectedKey]);

      return {
        listProps: {
          role: 'list',
          id: props.id,
          'aria-label': props['aria-label']
        }
      };
    }
  };
});

vi.mock('@vue-stately/steplist', async () => {
  let React = await vi.importActual<typeof import('react')>('react');

  return {
    useStepListState: (props: Record<string, any>) => {
      let collection = React.Children.toArray(props.children).map((child: any, index) => ({
        key: String(child.key ?? `item-${index}`).replace(/^\.\$/, ''),
        rendered: child.props.children,
        index
      }));

      return {
        collection,
        selectedKey: collection[0]?.key,
        disabledKeys: new Set<string>()
      };
    }
  };
});

vi.mock('@vue-spectrum/provider', () => ({
  useProviderProps: <T,>(props: T) => props
}));

vi.mock('@vue-aria/i18n', () => ({
  useLocale: () => ({
    locale: 'en-US',
    direction: 'ltr'
  }),
  useLocalizedStringFormatter: () => ({
    format: (value: string) => value
  }),
  useNumberFormatter: () => ({
    format: (value: number) => String(value)
  }),
  useCollator: () => new Intl.Collator('en-US')
}));

let items = [
  {key: 'step-one', value: 'Step 1'},
  {key: 'step-two', value: 'Step 2'},
  {key: 'step-three', value: 'Step 3'},
  {key: 'step-four', value: 'Step 4'}
];

function renderStepList(props: Record<string, unknown> = {}) {
  return render(
    React.createElement(
      StepList,
      {
        id: 'steplist-id',
        'aria-label': 'steplist-test',
        ...props
      },
      items.map((item) => React.createElement(Item, {key: item.key}, item.value))
    )
  );
}

describe('StepList', () => {
  it('renders', () => {
    let onSelectionChange = vi.fn();
    let tree = renderStepList({onSelectionChange});
    let stepListItems = tree.getAllByRole('link');

    expect(stepListItems.length).toBe(4);
    expect(stepListItems[0].getAttribute('aria-current')).toBe('step');
    expect(stepListItems[0].getAttribute('tabindex')).toBe('0');
    expect(stepListItems[0].textContent).toContain('Step 1');
    expect(onSelectionChange).toHaveBeenCalled();
    expect(onSelectionChange).toHaveBeenCalledWith('step-one');

    for (let i = 1; i < stepListItems.length; i++) {
      expect(stepListItems[i].getAttribute('aria-disabled')).toBe('true');
    }

    let stepList = tree.getByLabelText('steplist-test');
    expect(stepList.getAttribute('id')).toBe('steplist-id');
  });

  it('attaches a user provided ref', () => {
    let ref = React.createRef<{UNSAFE_getDOMNode(): HTMLOListElement | null}>();
    let tree = renderStepList({ref});
    let stepList = tree.getByLabelText('steplist-test');

    expect(ref.current?.UNSAFE_getDOMNode()).toBe(stepList);
  });
});
