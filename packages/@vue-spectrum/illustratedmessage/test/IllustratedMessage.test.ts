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

import {IllustratedMessage} from '../src';
import React from 'react';
import {render, screen} from '@testing-library/react';

vi.mock('@vue-aria/i18n', () => ({
  useLocale: () => ({
    locale: 'en-US',
    direction: 'ltr'
  })
}));

const dataTestId = 'im-svg';

function Image(props: React.SVGProps<SVGSVGElement>) {
  return React.createElement(
    'svg',
    {
      ...props,
      'data-testid': dataTestId
    },
    React.createElement('path')
  );
}

describe('IllustratedMessage', () => {
  it('should render all parts of an IllustratedMessage', () => {
    render(
      React.createElement(
        IllustratedMessage,
        null,
        React.createElement('div', null, 'bar'),
        React.createElement('h3', null, 'foo'),
        React.createElement(Image)
      )
    );

    expect(screen.getByTestId(dataTestId)).toBeTruthy();
    expect(screen.getByText('foo')).toBeTruthy();
    expect(screen.getByText('bar')).toBeTruthy();
  });

  it('should render only an svg', () => {
    render(
      React.createElement(
        IllustratedMessage,
        null,
        React.createElement(Image)
      )
    );

    expect(screen.getByTestId(dataTestId)).toBeTruthy();
    expect(screen.queryByText('foo')).toBe(null);
    expect(screen.queryByText('bar')).toBe(null);
  });

  it('should render heading and description without an svg', () => {
    render(
      React.createElement(
        IllustratedMessage,
        null,
        React.createElement('h3', null, 'foo'),
        React.createElement('div', null, 'bar')
      )
    );

    expect(screen.queryByTestId(dataTestId)).toBe(null);
    expect(screen.getByText('foo')).toBeTruthy();
    expect(screen.getByText('bar')).toBeTruthy();
  });
});
