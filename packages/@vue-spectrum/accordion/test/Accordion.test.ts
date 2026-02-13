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

import {Accordion, Disclosure, DisclosurePanel, DisclosureTitle} from '../src';
import React from 'react';
import {render, within} from '@testing-library/react';

vi.mock('@vue-spectrum/provider', () => ({
  useProviderProps: <T,>(props: T) => props
}));

vi.mock('@vue-aria/i18n', () => ({
  useLocale: () => ({
    locale: 'en-US',
    direction: 'ltr'
  })
}));

let items = [
  {id: 'one', title: 'one title', children: 'one children'},
  {id: 'two', title: 'two title', children: 'two children'},
  {id: 'three', title: 'three title', children: 'three children'}
];

function renderComponent(props: Record<string, unknown> = {}) {
  return render(
    React.createElement(
      Accordion,
      props,
      items.map((item) => React.createElement(
        Disclosure,
        {
          key: item.id,
          id: item.id
        },
        React.createElement(DisclosureTitle, null, item.title),
        React.createElement(DisclosurePanel, null, item.children)
      ))
    )
  );
}

describe('Accordion', () => {
  it('renders disclosure headings and content', () => {
    let tree = renderComponent();
    let accordionItems = tree.getAllByRole('heading');

    expect(accordionItems.length).toBe(3);

    for (let i = 0; i < accordionItems.length; i++) {
      let button = within(accordionItems[i]).getByRole('button');
      expect(button.textContent).toContain(items[i].title);
    }

    expect(tree.getByText('one children')).toBeTruthy();
  });
});
