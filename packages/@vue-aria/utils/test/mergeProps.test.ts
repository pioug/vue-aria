import { afterEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { mergeProps } from "../src/mergeProps";
import { idsUpdaterMap } from "../src/useId";

describe("mergeProps", () => {
  afterEach(() => {
    idsUpdaterMap.clear();
  });

  it("handles one argument", () => {
    const onClick = vi.fn();
    const className = "primary";
    const id = "test_id";
    const merged = mergeProps({ onClick, className, id });

    expect(merged.onClick).toBe(onClick);
    expect(merged.className).toBe(className);
    expect(merged.id).toBe(id);
  });

  it("chains event handlers in order", () => {
    const first = vi.fn();
    const second = vi.fn();
    const merged = mergeProps(
      { onClick: first, "aria-label": "a" },
      { onClick: second }
    );

    expect(typeof merged.onClick).toBe("function");
    (merged.onClick as (event?: unknown) => void)();

    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
    expect(first.mock.invocationCallOrder[0]).toBeLessThan(
      second.mock.invocationCallOrder[0]
    );
  });

  it("merges props with different keys and preserves callback order", () => {
    const spy = vi.fn();
    const merged = mergeProps(
      { onClick: () => spy("click-first") },
      { onHover: () => spy("hover"), style: { margin: 2, opacity: 0.5 } },
      { onClick: () => spy("click-second"), onFocus: () => spy("focus"), style: { opacity: 1 } }
    ) as {
      onClick: () => void;
      onHover: () => void;
      onFocus: () => void;
      style: Record<string, unknown>;
    };

    merged.onClick();
    expect(spy).toHaveBeenNthCalledWith(1, "click-first");
    expect(spy).toHaveBeenNthCalledWith(2, "click-second");
    expect(spy.mock.invocationCallOrder[0]).toBeLessThan(spy.mock.invocationCallOrder[1]);

    merged.onFocus();
    merged.onHover();

    expect(spy).toHaveBeenNthCalledWith(3, "focus");
    expect(spy).toHaveBeenNthCalledWith(4, "hover");
    expect(merged.style).toEqual({ margin: 2, opacity: 1 });
  });

  it("merges class values", () => {
    const merged = mergeProps(
      { class: "base" },
      { class: "active" }
    ) as unknown as { class: unknown[] };

    expect(merged.class).toEqual(["base", "active"]);
  });

  it("merges UNSAFE_className values", () => {
    const merged = mergeProps(
      { UNSAFE_className: "base" },
      { UNSAFE_className: "active" }
    ) as { UNSAFE_className: string };

    expect(merged.UNSAFE_className).toBe("base active");
  });

  it("merges style objects", () => {
    const merged = mergeProps(
      { style: { color: "red", opacity: 0.8 } },
      { style: { opacity: 1 } }
    ) as { style: Record<string, unknown> };

    expect(merged.style).toEqual({ color: "red", opacity: 1 });
  });

  it("merges UNSAFE_style objects", () => {
    const merged = mergeProps(
      { UNSAFE_style: { color: "red", opacity: 0.8 } },
      { UNSAFE_style: { opacity: 1 } }
    ) as { UNSAFE_style: Record<string, unknown> };

    expect(merged.UNSAFE_style).toEqual({ color: "red", opacity: 1 });
  });

  it("combines ids using mergeIds semantics", () => {
    const updater = { current: null as string | null };
    idsUpdaterMap.set("id2", [updater]);

    const merged = mergeProps(
      { id: "id1" },
      { id: "id2" }
    ) as { id: string };

    expect(merged.id).toBe("id1");
    expect(updater.current).toBe("id1");
  });

  it("overrides non-special props with the latest value", () => {
    const merged = mergeProps(
      { data: "id1" },
      { data: "id2" }
    ) as { data: string };

    expect(merged.data).toBe("id2");
  });

  it("merges refs", () => {
    const objectRef = ref<HTMLElement | null>(null);
    const callbackRef = vi.fn();
    const merged = mergeProps(
      { ref: objectRef },
      { ref: callbackRef }
    ) as { ref: (value: HTMLElement | null) => void };
    const node = document.createElement("div");

    merged.ref(node);

    expect(objectRef.value).toBe(node);
    expect(callbackRef).toHaveBeenCalledWith(node);
  });

  it("ignores undefined values from later props", () => {
    const merged = mergeProps(
      { id: "first" },
      { id: undefined }
    ) as { id: string };

    expect(merged.id).toBe("first");
  });
});
