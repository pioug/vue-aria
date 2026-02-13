import { afterEach, describe, expect, it, vi } from "vitest";
import { effectScope, nextTick, ref, type EffectScope } from "vue";
import { useEnterAnimation, useExitAnimation } from "../src/animation";

async function flushAsyncUpdates() {
  await Promise.resolve();
  await nextTick();
  await Promise.resolve();
}

function createFinishedAnimation() {
  let resolveFinished: (() => void) | null = null;
  const finished = new Promise<void>((resolve) => {
    resolveFinished = resolve;
  });

  return {
    animation: { finished } as unknown as Animation,
    resolve() {
      resolveFinished?.();
    },
  };
}

describe("animation hooks", () => {
  let scope: EffectScope | null = null;
  const originalCSSTransition = (globalThis as any).CSSTransition;

  afterEach(() => {
    scope?.stop();
    scope = null;
    (globalThis as any).CSSTransition = originalCSSTransition;
  });

  it("keeps enter animation active until animations finish", async () => {
    class FakeTransition {
      public readonly finished: Promise<void>;
      public cancel = vi.fn();

      constructor(finished: Promise<void>) {
        this.finished = finished;
      }
    }

    (globalThis as any).CSSTransition = FakeTransition;

    const { animation, resolve } = createFinishedAnimation();
    const transition = new FakeTransition((animation as any).finished);
    const element = document.createElement("div");
    (element as any).getAnimations = () => [transition];

    const elementRef = ref<HTMLElement | null>(element);
    scope = effectScope();
    const isEntering = scope.run(() => useEnterAnimation(elementRef, true))!;

    await flushAsyncUpdates();
    expect(isEntering.value).toBe(true);
    expect(transition.cancel).toHaveBeenCalledTimes(1);

    resolve();
    await flushAsyncUpdates();
    expect(isEntering.value).toBe(false);
  });

  it("keeps exit animation active until animations finish", async () => {
    const { animation, resolve } = createFinishedAnimation();
    const element = document.createElement("div");
    (element as any).getAnimations = () => [animation];

    const elementRef = ref<HTMLElement | null>(element);
    const isOpen = ref(true);

    scope = effectScope();
    const isExiting = scope.run(() => useExitAnimation(elementRef, isOpen))!;
    await flushAsyncUpdates();
    expect(isExiting.value).toBe(false);

    isOpen.value = false;
    await flushAsyncUpdates();
    expect(isExiting.value).toBe(true);

    resolve();
    await flushAsyncUpdates();
    expect(isExiting.value).toBe(false);
  });

  it("resets exit animation when closing is interrupted", async () => {
    const { animation, resolve } = createFinishedAnimation();
    const element = document.createElement("div");
    (element as any).getAnimations = () => [animation];

    const elementRef = ref<HTMLElement | null>(element);
    const isOpen = ref(true);

    scope = effectScope();
    const isExiting = scope.run(() => useExitAnimation(elementRef, isOpen))!;
    await flushAsyncUpdates();

    isOpen.value = false;
    await flushAsyncUpdates();
    expect(isExiting.value).toBe(true);

    isOpen.value = true;
    await flushAsyncUpdates();
    expect(isExiting.value).toBe(false);

    resolve();
    await flushAsyncUpdates();
    expect(isExiting.value).toBe(false);
  });
});
