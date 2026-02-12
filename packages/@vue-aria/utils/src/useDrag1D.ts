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

/* eslint-disable rulesdir/pure-render */

import {getEventTarget, nodeContains} from './shadowdom/DOMFunctions';
import {getOffset} from './getOffset';
import type {MutableRefObjectLike, VueRefLike} from './mergeRefs';

type Orientation = 'horizontal' | 'vertical';

type RefObjectLike<T> = MutableRefObjectLike<T> | VueRefLike<T> | null | undefined;

function getRefValue<T>(ref: RefObjectLike<T>): T | null | undefined {
  if (!ref) {
    return undefined;
  }

  if ('current' in ref) {
    return ref.current;
  }

  if ('value' in ref) {
    return ref.value;
  }

  return undefined;
}

interface UseDrag1DProps {
  containerRef: RefObjectLike<HTMLElement>;
  reverse?: boolean;
  orientation?: Orientation;
  onHover?: (hovered: boolean) => void;
  onDrag?: (dragging: boolean) => void;
  onPositionChange?: (position: number) => void;
  onIncrement?: () => void;
  onDecrement?: () => void;
  onIncrementToMax?: () => void;
  onDecrementToMin?: () => void;
  onCollapseToggle?: () => void;
}

interface DragHandlers {
  onMouseDown: (e: MouseEvent) => void;
  onMouseEnter: () => void;
  onMouseOut: () => void;
  onKeyDown: (e: KeyboardEvent) => void;
}

// Keep track of elements that we are currently handling dragging for via useDrag1D.
const draggingElements: HTMLElement[] = [];

export function useDrag1D(props: UseDrag1DProps): DragHandlers {
  console.warn('useDrag1D is deprecated, please use `useMove` instead https://react-spectrum.adobe.com/react-aria/useMove.html');

  let {
    containerRef,
    reverse,
    orientation,
    onHover,
    onDrag,
    onPositionChange,
    onIncrement,
    onDecrement,
    onIncrementToMax,
    onDecrementToMin,
    onCollapseToggle
  } = props;

  let getPosition = (e: MouseEvent) => (orientation === 'horizontal' ? e.clientX : e.clientY);
  let getNextOffset = (e: MouseEvent) => {
    let container = getRefValue(containerRef);
    if (!container) {
      return 0;
    }

    let containerOffset = getOffset(container, reverse, orientation);
    let mouseOffset = getPosition(e);
    return reverse ? containerOffset - mouseOffset : mouseOffset - containerOffset;
  };

  let dragging = {current: false};
  let prevPosition = {current: 0};

  // Keep track of the current handlers in a ref so that the events can access them.
  let handlers = {current: {onPositionChange, onDrag}};
  handlers.current.onDrag = onDrag;
  handlers.current.onPositionChange = onPositionChange;

  let onMouseDragged = (e: MouseEvent) => {
    e.preventDefault();
    let nextOffset = getNextOffset(e);
    if (!dragging.current) {
      dragging.current = true;
      handlers.current.onDrag?.(true);
      handlers.current.onPositionChange?.(nextOffset);
    }

    if (prevPosition.current === nextOffset) {
      return;
    }

    prevPosition.current = nextOffset;
    onPositionChange?.(nextOffset);
  };

  let onMouseUp = (e: MouseEvent) => {
    let target = getEventTarget(e) as HTMLElement;
    dragging.current = false;
    let nextOffset = getNextOffset(e);
    handlers.current.onDrag?.(false);
    handlers.current.onPositionChange?.(nextOffset);

    draggingElements.splice(draggingElements.indexOf(target), 1);
    window.removeEventListener('mouseup', onMouseUp, false);
    window.removeEventListener('mousemove', onMouseDragged, false);
  };

  let onMouseDown = (e: MouseEvent) => {
    const target = e.currentTarget as HTMLElement;
    // If we're already handling dragging on a descendant with useDrag1D, then
    // we don't want to handle the drag motion on this target as well.
    if (draggingElements.some((elt) => nodeContains(target, elt))) {
      return;
    }

    draggingElements.push(target);
    window.addEventListener('mousemove', onMouseDragged, false);
    window.addEventListener('mouseup', onMouseUp, false);
  };

  let onMouseEnter = () => {
    onHover?.(true);
  };

  let onMouseOut = () => {
    onHover?.(false);
  };

  let onKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'Left':
      case 'ArrowLeft':
        if (orientation === 'horizontal') {
          e.preventDefault();
          if (onDecrement && !reverse) {
            onDecrement();
          } else if (onIncrement && reverse) {
            onIncrement();
          }
        }
        break;
      case 'Up':
      case 'ArrowUp':
        if (orientation === 'vertical') {
          e.preventDefault();
          if (onDecrement && !reverse) {
            onDecrement();
          } else if (onIncrement && reverse) {
            onIncrement();
          }
        }
        break;
      case 'Right':
      case 'ArrowRight':
        if (orientation === 'horizontal') {
          e.preventDefault();
          if (onIncrement && !reverse) {
            onIncrement();
          } else if (onDecrement && reverse) {
            onDecrement();
          }
        }
        break;
      case 'Down':
      case 'ArrowDown':
        if (orientation === 'vertical') {
          e.preventDefault();
          if (onIncrement && !reverse) {
            onIncrement();
          } else if (onDecrement && reverse) {
            onDecrement();
          }
        }
        break;
      case 'Home':
        e.preventDefault();
        onDecrementToMin?.();
        break;
      case 'End':
        e.preventDefault();
        onIncrementToMax?.();
        break;
      case 'Enter':
        e.preventDefault();
        onCollapseToggle?.();
        break;
    }
  };

  return {onMouseDown, onMouseEnter, onMouseOut, onKeyDown};
}
