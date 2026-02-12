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

import {FocusScope} from '../src';
import {act, render, waitFor} from '@testing-library/react';
import {createPortal} from 'react-dom';
import React from 'react';

describe('FocusScope owner document', function () {
  let iframe: HTMLIFrameElement;
  let iframeRoot: HTMLDivElement;

  function IframeExample({children}) {
    return createPortal(React.createElement(React.Fragment, null, children), iframeRoot);
  }

  beforeEach(() => {
    iframe = document.createElement('iframe');
    document.body.appendChild(iframe);

    let iframeDocument = iframe.contentWindow!.document;
    iframeRoot = iframeDocument.createElement('div');
    iframeDocument.body.appendChild(iframeRoot);
  });

  afterEach(() => {
    iframe.remove();
  });

  it('allows focusing a child element in iframe owner document', async function () {
    render(
      React.createElement(
        IframeExample,
        null,
        React.createElement(
          FocusScope,
          null,
          React.createElement('input', {'data-testid': 'input1'}),
          React.createElement('input', {'data-testid': 'input2'})
        )
      )
    );

    await waitFor(() => {
      expect(iframe.contentWindow!.document.querySelector('input[data-testid=\"input1\"]')).toBeTruthy();
    });

    let iframeDocument = iframe.contentWindow!.document;

    let input1 = iframeDocument.querySelector('input[data-testid=\"input1\"]') as HTMLInputElement;
    let input2 = iframeDocument.querySelector('input[data-testid=\"input2\"]') as HTMLInputElement;

    act(() => {
      input1.focus();
    });
    expect(iframeDocument.activeElement).toBe(input1);
    expect(input2).toBeTruthy();
  });
});
