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

import React from 'react';
import ReactDOMServer from 'react-dom/server';
import {useLandmark} from '../src/useLandmark';

function Main(props: any) {
  let ref = React.useRef<HTMLElement | null>(null);
  let {landmarkProps} = useLandmark({...props, role: 'main'}, ref as any);
  return React.createElement('main', {ref, ...landmarkProps}, props.children);
}

describe('useLandmark SSR', function () {
  it('renders without errors', function () {
    expect(() => ReactDOMServer.renderToString(
      React.createElement(Main)
    )).not.toThrow();
  });
});
