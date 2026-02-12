import {afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi} from 'vitest';

import {runAfterTransition} from '../src/runAfterTransition';

class MockTransitionEvent extends Event {
  propertyName: string;

  constructor(type: string, eventInitDict?: TransitionEventInit) {
    super(type, eventInitDict);
    this.propertyName = eventInitDict?.propertyName || '';
  }
}

describe('runAfterTransition', () => {
  const originalTransitionEvent = globalThis.TransitionEvent;
  const nodes = new Set<Node>();

  beforeAll(() => {
    // jsdom does not define TransitionEvent.
    Object.defineProperty(globalThis, 'TransitionEvent', {
      configurable: true,
      writable: true,
      value: MockTransitionEvent
    });
  });

  afterAll(() => {
    Object.defineProperty(globalThis, 'TransitionEvent', {
      configurable: true,
      writable: true,
      value: originalTransitionEvent
    });
  });

  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      return setTimeout(() => cb(Date.now()), 0) as unknown as number;
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    cleanupElements();
  });

  function appendElement(element: HTMLElement) {
    nodes.add(element);
    document.body.appendChild(element);
    return element;
  }

  function cleanupElements() {
    for (const node of nodes) {
      if (node.parentNode) {
        node.parentNode.removeChild(node);
      }
      nodes.delete(node);
    }
  }

  it('calls callback immediately when no transition is running', () => {
    const callback = vi.fn();
    runAfterTransition(callback);
    vi.runOnlyPendingTimers();
    expect(callback).toHaveBeenCalled();
  });

  it('defers callback until transition end when a transition is running', () => {
    const element = appendElement(document.createElement('div'));
    const callback = vi.fn();

    element.dispatchEvent(
      new TransitionEvent('transitionrun', {
        propertyName: 'opacity',
        bubbles: true
      })
    );

    runAfterTransition(callback);
    vi.runOnlyPendingTimers();
    expect(callback).not.toHaveBeenCalled();

    element.dispatchEvent(
      new TransitionEvent('transitionend', {
        propertyName: 'opacity',
        bubbles: true
      })
    );
    expect(callback).toHaveBeenCalled();
  });

  it('calls multiple queued callbacks after transition ends', () => {
    const element = appendElement(document.createElement('div'));
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    element.dispatchEvent(
      new TransitionEvent('transitionrun', {
        propertyName: 'width',
        bubbles: true
      })
    );

    runAfterTransition(callback1);
    vi.runOnlyPendingTimers();
    runAfterTransition(callback2);
    vi.runOnlyPendingTimers();

    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).not.toHaveBeenCalled();

    element.dispatchEvent(
      new TransitionEvent('transitionend', {
        propertyName: 'width',
        bubbles: true
      })
    );

    expect(callback1).toHaveBeenCalled();
    expect(callback2).toHaveBeenCalled();
  });

  it('clears out detached elements from transition tracking', () => {
    const element = document.createElement('div');
    appendElement(element);
    const callback = vi.fn();

    element.dispatchEvent(
      new TransitionEvent('transitionrun', {
        propertyName: 'width',
        bubbles: true
      })
    );

    cleanupElements();

    runAfterTransition(callback);
    vi.runOnlyPendingTimers();

    expect(callback).toHaveBeenCalled();
  });
});
