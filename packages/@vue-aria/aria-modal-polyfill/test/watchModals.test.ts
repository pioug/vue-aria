import {afterEach, describe, expect, it, vi} from 'vitest';

const hideOthersCalls: HTMLElement[][] = [];
const undoFns: Array<ReturnType<typeof vi.fn>> = [];

vi.mock('aria-hidden', () => ({
  hideOthers: vi.fn((elements: HTMLElement[]) => {
    hideOthersCalls.push(elements);
    const undo = vi.fn();
    undoFns.push(undo);
    return undo;
  })
}));

import {watchModals} from '../src/index';

async function flushMutations() {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

function createModalContainer(label: string, attr: 'aria-modal' | 'data-ismodal' = 'aria-modal') {
  const container = document.createElement('div');
  const modal = document.createElement('div');
  if (attr === 'aria-modal') {
    modal.setAttribute('aria-modal', 'true');
  } else {
    modal.setAttribute('data-ismodal', 'true');
  }
  modal.setAttribute('data-label', label);
  container.append(modal);
  return {container, modal};
}

afterEach(() => {
  document.body.innerHTML = '';
  hideOthersCalls.length = 0;
  undoFns.length = 0;
});

describe('watchModals', () => {
  it('returns a noop function when no matching target exists', () => {
    const revert = watchModals('[data-no-target]');
    expect(typeof revert).toBe('function');
    expect(() => revert()).not.toThrow();
  });

  it('hides around a modal and restores when removed', async () => {
    document.body.innerHTML = '<main></main>';
    const stopWatching = watchModals();
    const {container, modal} = createModalContainer('first');

    document.body.append(container);
    await flushMutations();

    expect(hideOthersCalls).toHaveLength(1);
    expect(hideOthersCalls[0]).toEqual([modal]);

    document.body.removeChild(container);
    await flushMutations();

    expect(undoFns[0]).toHaveBeenCalledTimes(1);
    stopWatching();
  });

  it('keeps live announcer visible while hiding others', async () => {
    const liveAnnouncer = document.createElement('div');
    liveAnnouncer.setAttribute('data-live-announcer', 'true');
    document.body.append(liveAnnouncer);

    const stopWatching = watchModals();
    const {container, modal} = createModalContainer('first');
    document.body.append(container);
    await flushMutations();

    expect(hideOthersCalls).toHaveLength(1);
    expect(hideOthersCalls[0]).toEqual([modal, liveAnnouncer]);
    stopWatching();
  });

  it('handles nested modals by always tracking the latest one', async () => {
    const stopWatching = watchModals();
    const first = createModalContainer('first');
    const second = createModalContainer('second');

    document.body.append(first.container);
    await flushMutations();

    document.body.append(second.container);
    await flushMutations();

    expect(hideOthersCalls).toHaveLength(2);
    expect(hideOthersCalls[0]).toEqual([first.modal]);
    expect(hideOthersCalls[1]).toEqual([second.modal]);
    expect(undoFns[0]).toHaveBeenCalledTimes(1);

    document.body.removeChild(second.container);
    await flushMutations();

    expect(hideOthersCalls).toHaveLength(3);
    expect(hideOthersCalls[2]).toEqual([first.modal]);
    expect(undoFns[1]).toHaveBeenCalledTimes(1);

    stopWatching();
    expect(undoFns[2]).toHaveBeenCalledTimes(1);
  });

  it('also detects modals marked with data-ismodal', async () => {
    const stopWatching = watchModals();
    const {container, modal} = createModalContainer('custom', 'data-ismodal');

    document.body.append(container);
    await flushMutations();

    expect(hideOthersCalls).toHaveLength(1);
    expect(hideOthersCalls[0]).toEqual([modal]);
    stopWatching();
  });
});
