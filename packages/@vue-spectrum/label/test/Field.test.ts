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

import {Field} from '../src';
import React from 'react';
import {render, screen} from '@testing-library/react';

vi.mock('@vue-spectrum/provider', () => ({
  Provider: ({children}: {children: React.ReactNode}) => React.createElement(React.Fragment, null, children),
  useProviderProps: <T,>(props: T) => props
}));

vi.mock('@vue-aria/i18n', () => ({
  useLocale: () => ({
    locale: 'en-US',
    direction: 'ltr'
  }),
  useLocalizedStringFormatter: () => ({
    format: (key: string) => key
  })
}));

function renderField(props: Record<string, unknown> = {}) {
  return render(
    React.createElement(
      Field,
      {
        label: 'Field label',
        labelProps: {htmlFor: 'field-id'},
        ...props
      } as any,
      React.createElement('input', {id: 'field-id'})
    )
  );
}

describe('Field', () => {
  it('renders a labeled field', () => {
    renderField();
    expect(screen.getByLabelText('Field label')).toBeTruthy();
  });

  it('supports a ref on the outer wrapper', () => {
    let ref = React.createRef<HTMLDivElement>();
    renderField({ref});
    expect(ref.current?.tagName).toBe('DIV');
  });
});
