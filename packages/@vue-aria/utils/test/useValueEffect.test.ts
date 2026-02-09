import { describe, expect, it } from "vitest";
import { effectScope, nextTick } from "vue";
import { useValueEffect } from "../src/useValueEffect";

describe("useValueEffect", () => {
  it("applies yielded values sequentially across ticks", async () => {
    const scope = effectScope();
    const state = scope.run(() => useValueEffect(0));
    if (!state) {
      throw new Error("Failed to create value effect state");
    }

    const [value, queue] = state;

    queue(function* sequence() {
      yield 1;
      yield 2;
    });

    expect(value.value).toBe(1);

    await nextTick();
    await nextTick();

    expect(value.value).toBe(2);
    scope.stop();
  });

  it("skips duplicate yielded values in the same run", () => {
    const scope = effectScope();
    const state = scope.run(() => useValueEffect(5));
    if (!state) {
      throw new Error("Failed to create value effect state");
    }

    const [value, queue] = state;

    queue(function* sequence() {
      yield 5;
      yield 5;
      yield 8;
    });

    expect(value.value).toBe(8);
    scope.stop();
  });

  it("supports lazy default values", () => {
    let calls = 0;
    const scope = effectScope();
    const state = scope.run(() =>
      useValueEffect(() => {
        calls += 1;
        return 3;
      })
    );
    if (!state) {
      throw new Error("Failed to create value effect state");
    }

    const [value] = state;
    expect(value.value).toBe(3);
    expect(calls).toBe(1);
    scope.stop();
  });

  it("replaces a running generator when queue is called again", async () => {
    const scope = effectScope();
    const state = scope.run(() => useValueEffect(0));
    if (!state) {
      throw new Error("Failed to create value effect state");
    }

    const [value, queue] = state;

    queue(function* first() {
      yield 1;
      yield 2;
    });

    expect(value.value).toBe(1);

    queue(function* second() {
      yield 10;
    });

    expect(value.value).toBe(10);

    await nextTick();
    await nextTick();

    expect(value.value).toBe(10);
    scope.stop();
  });
});
