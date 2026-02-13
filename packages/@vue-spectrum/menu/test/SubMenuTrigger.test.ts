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

import './testSetup';
import {SubmenuTrigger} from '../src';

describe('SubmenuTrigger', () => {
  it('creates a collection node wrapper for submenu items', () => {
    let nodes = [...(SubmenuTrigger as unknown as {
      getCollectionNode: (props: {children: React.ReactNode[]}) => Iterable<{
        element: React.ReactElement,
        wrapper: (element: React.ReactElement) => React.ReactElement
      }>
    }).getCollectionNode({
      children: [
        React.createElement('div', {key: 'trigger'}, 'File'),
        React.createElement('div', {key: 'menu'}, 'Submenu')
      ]
    })];

    expect(nodes).toHaveLength(1);
    expect(nodes[0].element.props.hasChildItems).toBe(true);

    let wrapped = nodes[0].wrapper(React.createElement('div', {key: 'trigger'}, 'File'));
    expect(React.isValidElement(wrapped)).toBe(true);
  });
});
