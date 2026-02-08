import { describe, expect, it } from "vitest";
import { ref } from "vue";
import { useId } from "../src/useId";

describe("useId", () => {
  it("returns explicit id when provided", () => {
    const id = useId("custom-id");
    expect(id.value).toBe("custom-id");
  });

  it("tracks reactive explicit id values", () => {
    const explicit = ref<string | undefined>("start-id");
    const id = useId(explicit);

    expect(id.value).toBe("start-id");

    explicit.value = "next-id";
    expect(id.value).toBe("next-id");

    explicit.value = undefined;
    expect(id.value).toMatch(/^v-aria-\d+$/);
  });

  it("returns stable fallback id per composable instance", () => {
    const id = useId();
    const first = id.value;
    const second = id.value;
    expect(second).toBe(first);
  });

  it("produces unique ids across instances", () => {
    const a = useId();
    const b = useId();

    expect(a.value).not.toBe(b.value);
  });
});
