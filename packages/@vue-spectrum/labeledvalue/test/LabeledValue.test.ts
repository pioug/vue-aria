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

import {LabeledValue} from '../src';
import React from 'react';
import {render} from '@testing-library/react';

vi.mock('@vue-spectrum/label', async () => {
  let React = await vi.importActual<typeof import('react')>('react');

  return {
    Field: React.forwardRef(function Field(props: any, ref: any) {
      let {
        label,
        children,
        wrapperProps = {},
        wrapperClassName,
        elementType = 'span'
      } = props;
      let Element = elementType;

      return React.createElement(
        Element,
        {
          ...wrapperProps,
          className: wrapperClassName,
          ref
        },
        label ? React.createElement('span', null, label) : null,
        children
      );
    })
  };
});

vi.mock('@vue-aria/i18n', () => ({
  useListFormatter: () => ({
    format: (value: string[]) => value.join(', ')
  }),
  useNumberFormatter: () => ({
    format: (value: number) => String(value),
    formatRange: (start: number, end: number) => `${start}-${end}`
  }),
  useDateFormatter: () => ({
    format: (value: Date) => String(value),
    formatRange: (start: Date, end: Date) => `${String(start)}-${String(end)}`,
    resolvedOptions: () => ({
      timeZone: 'UTC'
    })
  })
}));

describe('LabeledValue', () => {
  it('renders a label and string value', () => {
    let {getByTestId} = render(
      React.createElement(LabeledValue, {
        'data-testid': 'test-id',
        label: 'Field label',
        value: 'test'
      })
    );

    let labeledValue = getByTestId('test-id');
    expect(labeledValue.textContent).toContain('Field label');
    expect(labeledValue.textContent).toContain('test');
  });

  it('renders a range number value', () => {
    let {getByTestId} = render(
      React.createElement(LabeledValue, {
        'data-testid': 'test-id',
        label: 'Field label',
        value: {start: 10, end: 20}
      })
    );

    let labeledValue = getByTestId('test-id');
    expect(labeledValue.textContent).toContain('10-20');
  });

  it('attaches a user provided ref to the outer element', () => {
    let ref = React.createRef<{UNSAFE_getDOMNode(): HTMLElement | null}>();
    let {getByTestId} = render(
      React.createElement(LabeledValue, {
        'data-testid': 'test-id',
        ref,
        value: 'test'
      })
    );

    let labeledValue = getByTestId('test-id');
    expect(ref.current?.UNSAFE_getDOMNode()).toBe(labeledValue);
  });
});
