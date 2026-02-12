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

import {getScrollParents} from './getScrollParents';
import {isChrome, isIOS} from './platform';

interface ScrollIntoViewOpts {
  block?: ScrollLogicalPosition;
  inline?: ScrollLogicalPosition;
}

interface ScrollIntoViewportOpts {
  containingElement?: Element | null;
}

/**
 * Scrolls `scrollView` so that `element` is visible.
 * Similar to `element.scrollIntoView({block: 'nearest'})` (not supported in Edge),
 * but does not affect parents above `scrollView`.
 */
export function scrollIntoView(
  scrollView: HTMLElement,
  element: HTMLElement,
  opts: ScrollIntoViewOpts = {}
): void {
  let {block = 'nearest', inline = 'nearest'} = opts;

  if (scrollView === element) {
    return;
  }

  let y = scrollView.scrollTop;
  let x = scrollView.scrollLeft;

  const target = element.getBoundingClientRect();
  const view = scrollView.getBoundingClientRect();
  const itemStyle = window.getComputedStyle(element);
  const viewStyle = window.getComputedStyle(scrollView);
  const root = document.scrollingElement || document.documentElement;

  const viewTop = scrollView === root ? 0 : view.top;
  const viewBottom = scrollView === root ? scrollView.clientHeight : view.bottom;
  const viewLeft = scrollView === root ? 0 : view.left;
  const viewRight = scrollView === root ? scrollView.clientWidth : view.right;

  const scrollMarginTop = parseInt(itemStyle.scrollMarginTop, 10) || 0;
  const scrollMarginBottom = parseInt(itemStyle.scrollMarginBottom, 10) || 0;
  const scrollMarginLeft = parseInt(itemStyle.scrollMarginLeft, 10) || 0;
  const scrollMarginRight = parseInt(itemStyle.scrollMarginRight, 10) || 0;

  const scrollPaddingTop = parseInt(viewStyle.scrollPaddingTop, 10) || 0;
  const scrollPaddingBottom = parseInt(viewStyle.scrollPaddingBottom, 10) || 0;
  const scrollPaddingLeft = parseInt(viewStyle.scrollPaddingLeft, 10) || 0;
  const scrollPaddingRight = parseInt(viewStyle.scrollPaddingRight, 10) || 0;

  const borderTopWidth = parseInt(viewStyle.borderTopWidth, 10) || 0;
  const borderBottomWidth = parseInt(viewStyle.borderBottomWidth, 10) || 0;
  const borderLeftWidth = parseInt(viewStyle.borderLeftWidth, 10) || 0;
  const borderRightWidth = parseInt(viewStyle.borderRightWidth, 10) || 0;

  const scrollAreaTop = target.top - scrollMarginTop;
  const scrollAreaBottom = target.bottom + scrollMarginBottom;
  const scrollAreaLeft = target.left - scrollMarginLeft;
  const scrollAreaRight = target.right + scrollMarginRight;

  const scrollBarOffsetX = scrollView === root ? 0 : borderLeftWidth + borderRightWidth;
  const scrollBarOffsetY = scrollView === root ? 0 : borderTopWidth + borderBottomWidth;
  const scrollBarWidth = scrollView.offsetWidth - scrollView.clientWidth - scrollBarOffsetX;
  const scrollBarHeight = scrollView.offsetHeight - scrollView.clientHeight - scrollBarOffsetY;

  let scrollPortTop = viewTop + borderTopWidth + scrollPaddingTop;
  let scrollPortBottom = viewBottom - borderBottomWidth - scrollPaddingBottom - scrollBarHeight;
  let scrollPortLeft = viewLeft + borderLeftWidth + scrollPaddingLeft;
  let scrollPortRight = viewRight - borderRightWidth - scrollPaddingRight;

  // iOS always positions the scrollbar on the right.
  if (viewStyle.direction === 'rtl' && !isIOS()) {
    scrollPortLeft += scrollBarWidth;
  } else {
    scrollPortRight -= scrollBarWidth;
  }

  const shouldScrollBlock = scrollAreaTop < scrollPortTop || scrollAreaBottom > scrollPortBottom;
  const shouldScrollInline = scrollAreaLeft < scrollPortLeft || scrollAreaRight > scrollPortRight;

  if (shouldScrollBlock && block === 'start') {
    y += scrollAreaTop - scrollPortTop;
  } else if (shouldScrollBlock && block === 'center') {
    y += (scrollAreaTop + scrollAreaBottom) / 2 - (scrollPortTop + scrollPortBottom) / 2;
  } else if (shouldScrollBlock && block === 'end') {
    y += scrollAreaBottom - scrollPortBottom;
  } else if (shouldScrollBlock && block === 'nearest') {
    const start = scrollAreaTop - scrollPortTop;
    const end = scrollAreaBottom - scrollPortBottom;
    y += Math.abs(start) <= Math.abs(end) ? start : end;
  }

  if (shouldScrollInline && inline === 'start') {
    x += scrollAreaLeft - scrollPortLeft;
  } else if (shouldScrollInline && inline === 'center') {
    x += (scrollAreaLeft + scrollAreaRight) / 2 - (scrollPortLeft + scrollPortRight) / 2;
  } else if (shouldScrollInline && inline === 'end') {
    x += scrollAreaRight - scrollPortRight;
  } else if (shouldScrollInline && inline === 'nearest') {
    const start = scrollAreaLeft - scrollPortLeft;
    const end = scrollAreaRight - scrollPortRight;
    x += Math.abs(start) <= Math.abs(end) ? start : end;
  }

  if (process.env.NODE_ENV === 'test') {
    scrollView.scrollLeft = x;
    scrollView.scrollTop = y;
    return;
  }

  scrollView.scrollTo({left: x, top: y});
}

/**
 * Scrolls the `targetElement` so it is visible in the viewport. Accepts an optional `opts.containingElement`
 * that will be centered in the viewport prior to scrolling the targetElement into view.
 */
export function scrollIntoViewport(
  targetElement: Element | null,
  opts: ScrollIntoViewportOpts = {}
): void {
  const {containingElement} = opts;
  if (targetElement && targetElement.isConnected) {
    const root = document.scrollingElement || document.documentElement;
    const isScrollPrevented = window.getComputedStyle(root).overflow === 'hidden';

    // Ignore Chrome due to known native scrollIntoView behavior issues.
    if (!isScrollPrevented && !isChrome()) {
      const {left: originalLeft, top: originalTop} = targetElement.getBoundingClientRect();
      targetElement.scrollIntoView?.({block: 'nearest'});
      const {left: newLeft, top: newTop} = targetElement.getBoundingClientRect();

      // Account for sub-pixel rounding differences.
      if (Math.abs(originalLeft - newLeft) > 1 || Math.abs(originalTop - newTop) > 1) {
        containingElement?.scrollIntoView?.({block: 'center', inline: 'center'});
        targetElement.scrollIntoView?.({block: 'nearest'});
      }
    } else {
      const {left: originalLeft, top: originalTop} = targetElement.getBoundingClientRect();
      let scrollParents = getScrollParents(targetElement, true);
      for (const scrollParent of scrollParents) {
        scrollIntoView(scrollParent as HTMLElement, targetElement as HTMLElement);
      }

      const {left: newLeft, top: newTop} = targetElement.getBoundingClientRect();
      if (Math.abs(originalLeft - newLeft) > 1 || Math.abs(originalTop - newTop) > 1) {
        scrollParents = containingElement ? getScrollParents(containingElement, true) : [];
        for (const scrollParent of scrollParents) {
          scrollIntoView(scrollParent as HTMLElement, containingElement as HTMLElement, {
            block: 'center',
            inline: 'center'
          });
        }
      }
    }
  }
}
