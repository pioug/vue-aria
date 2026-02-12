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

import {DragPreview, useDrag, useDrop} from '../src';
import {mergeProps} from '@vue-aria/utils';
import {useButton} from '@vue-aria/button';
import React, {useRef} from 'react';

export function Draggable(props: any) {
  let preview = useRef<HTMLDivElement>(null);
  let {dragProps, isDragging} = useDrag({
    getItems() {
      return [{
        'text/plain': 'hello world'
      }];
    },
    preview,
    ...props
  });

  return React.createElement(
    React.Fragment,
    null,
    React.createElement(
      'div',
      {
        ...dragProps,
        'data-dragging': isDragging,
        role: 'button',
        tabIndex: 0
      },
      props.children || 'Drag me'
    ),
    props.renderPreview
      ? React.createElement(
          DragPreview,
          {ref: preview},
          props.renderPreview
        )
      : null
  );
}

export function Droppable(props: any) {
  let ref = useRef<HTMLDivElement>(null);
  let {dropProps, isDropTarget} = useDrop({
    ref,
    ...props
  });

  let {buttonProps} = useButton({elementType: 'div'} as any, ref);

  return React.createElement(
    'div',
    {
      ...mergeProps(dropProps, buttonProps),
      'data-droptarget': isDropTarget,
      ref
    },
    props.children || 'Drop here'
  );
}
