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

import {Draggable, Droppable} from './examples';
import {render} from '@testing-library/react';
import React from 'react';

vi.mock('@vue-aria/i18n', () => ({
  useLocale: () => ({
    direction: 'ltr',
    locale: 'en-US'
  }),
  useLocalizedStringFormatter: () => ({
    format: () => ''
  })
}));

describe('dnd basics', () => {
  it('renders draggable and droppable examples', () => {
    let {getAllByRole, getByText} = render(
      React.createElement(
        React.Fragment,
        null,
        React.createElement(Draggable),
        React.createElement(Droppable)
      )
    );

    expect(getByText('Drag me')).toBeTruthy();
    expect(getByText('Drop here')).toBeTruthy();
    expect(getAllByRole('button')).toHaveLength(2);
  });
});
