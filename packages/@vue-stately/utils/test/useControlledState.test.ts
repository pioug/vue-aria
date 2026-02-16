import { describe, expect, it, vi } from "vitest";
import { useControlledState } from "../src/useControlledState";

describe("useControlledState", () => {
  it("updates uncontrolled state", () => {
    const onChange = vi.fn();
    const [value, setValue] = useControlledState<string>(undefined, "default", onChange);

    expect(value.value).toBe("default");
    setValue("new");

    expect(value.value).toBe("new");
    expect(onChange).toHaveBeenCalledWith("new");
  });

  it("invokes callback in controlled mode without mutating local state", () => {
    const onChange = vi.fn();
    const [value, setValue] = useControlledState<string>("controlled", "default", onChange);

    setValue("new");

    expect(value.value).toBe("controlled");
    expect(onChange).toHaveBeenCalledWith("new");
  });
});
