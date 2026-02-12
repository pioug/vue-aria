/*
 * Copyright 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {render} from '@testing-library/react';
import {useDateField} from '../src/useDateField';
import React from 'react';
import userEvent from '@testing-library/user-event';

vi.mock('@vue-aria/i18n', () => ({
  useLocale: () => ({
    direction: 'ltr',
    locale: 'en-US'
  }),
  useLocalizedStringFormatter: () => ({
    format: () => ''
  })
}));

function ProgrammaticSetValueExampleRender() {
  let [value, setValue] = React.useState<any>(null);
  let ref = React.useRef<HTMLDivElement>(null);
  let state = React.useMemo(() => ({
    displayValidation: {
      isInvalid: false,
      validationDetails: {},
      validationErrors: []
    },
    maxGranularity: 'year',
    value,
    defaultValue: null,
    formatValue: () => 'January 1, 2020',
    confirmPlaceholder: () => {},
    commitValidation: () => {},
    setValue: (nextValue: any) => setValue(nextValue)
  }), [value]);
  let {fieldProps} = useDateField({'aria-label': 'Date'}, state as any, ref);
  let segments = value ? ['01', '/', '01', '/', '2020'] : ['mm', '/', 'dd', '/', 'yyyy'];

  return React.createElement(
    'div',
    null,
    React.createElement(
      'div',
      {
        ...fieldProps,
        'data-testid': 'field',
        ref
      },
      segments.map((text, i) => React.createElement(
        'span',
        {key: i},
        text
      ))
    ),
    React.createElement(
      'button',
      {
        'data-testid': 'set',
        onClick: () => state.setValue({year: 2020})
      },
      'Set'
    )
  );
}

describe('useDatePicker', function () {
  let user: ReturnType<typeof userEvent.setup>;
  beforeAll(() => {
    user = userEvent.setup({delay: null});
  });

  it('should commit programmatically setValue when field is empty', async () => {
    let {getByTestId} = render(React.createElement(ProgrammaticSetValueExampleRender));

    let field = getByTestId('field');
    expect(field.textContent).toBe('mm/dd/yyyy');
    await user.click(getByTestId('set'));
    expect(field.textContent).toContain('2020');
  });
});
