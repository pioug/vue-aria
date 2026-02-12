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
import {fireEvent, render, screen} from '@testing-library/react';
import {HiddenSelect, HiddenSelectProps} from '../src/HiddenSelect';

vi.mock('@vue-aria/form', () => ({
  useFormValidation: () => {}
}));

vi.mock('@vue-aria/i18n', () => ({
  useCollator: () => new Intl.Collator('en-US')
}));

vi.mock('@vue-aria/utils', async () => {
  const actual = await vi.importActual<typeof import('@vue-aria/utils')>('@vue-aria/utils');
  return {
    ...actual,
    useFormReset: () => {}
  };
});

type ItemData = {key: number, value: string};

function createState<T extends ItemData>(items: T[], value: string | string[] | null, setValue: (value: any) => void) {
  let itemMap = new Map(items.map((item) => [
    item.key,
    {
      key: item.key,
      type: 'item',
      textValue: item.value
    }
  ]));

  return {
    collection: {
      size: items.length,
      getKeys: () => itemMap.keys(),
      getItem: (key: number) => itemMap.get(key) ?? null
    },
    selectionManager: {
      selectionMode: 'single'
    },
    value,
    defaultValue: null,
    setValue
  };
}

function HiddenSelectExample(props: {
  items?: ItemData[],
  value?: string | null,
  label?: string,
  setValue?: (value: any) => void,
  hiddenProps?: Partial<HiddenSelectProps<any>>
}) {
  let triggerRef = React.useRef<HTMLButtonElement | null>(null);
  let {
    items = [],
    value = null,
    label,
    setValue = () => {},
    hiddenProps = {}
  } = props;
  let state = createState(items, value, setValue);

  return React.createElement(
    React.Fragment,
    null,
    React.createElement(HiddenSelect, {label, state: state as any, triggerRef, ...hiddenProps}),
    React.createElement('button', {ref: triggerRef}, 'trigger')
  );
}

function makeItems(size: number): ItemData[] {
  return Array.from({length: size}, (_, index) => ({
    key: index + 1,
    value: `${index + 1}`
  }));
}

describe('<HiddenSelect />', () => {
  it('should successfully render for collection.size <= 300 and no selected key', () => {
    render(React.createElement(HiddenSelectExample, {items: makeItems(5)}));
  });

  it('should successfully render for collection.size > 300 with a name and no selected key', () => {
    render(
      React.createElement(HiddenSelectExample, {
        items: makeItems(400),
        hiddenProps: {name: 'select'}
      })
    );
  });

  it('should have form value after initial render', () => {
    let formRef = React.createRef<HTMLFormElement>();
    render(
      React.createElement(
        'form',
        {ref: formRef},
        React.createElement(HiddenSelectExample, {
          value: 'value',
          items: [],
          hiddenProps: {name: 'select'}
        })
      )
    );

    let formData = new FormData(formRef.current!);
    expect(formData.get('select')).toEqual('value');
  });

  it('should update value when select onchange is triggered', () => {
    let setValue = vi.fn();
    render(
      React.createElement(HiddenSelectExample, {
        label: 'select',
        items: makeItems(5),
        setValue
      })
    );

    let select = screen.getByLabelText('select');
    fireEvent.change(select, {target: {value: '5'}});
    expect(setValue).toHaveBeenCalledWith('5');
  });

  it('should always add a data attribute data-a11y-ignore=\"aria-hidden-focus\"', () => {
    render(React.createElement(HiddenSelectExample, {items: makeItems(5)}));

    expect(screen.getByTestId('hidden-select-container').getAttribute('data-a11y-ignore')).toBe('aria-hidden-focus');
  });

  it('should always add a data attribute data-react-aria-prevent-focus', () => {
    render(React.createElement(HiddenSelectExample, {items: makeItems(5)}));

    expect(screen.getByTestId('hidden-select-container').getAttribute('data-react-aria-prevent-focus')).not.toBeNull();
  });
});
