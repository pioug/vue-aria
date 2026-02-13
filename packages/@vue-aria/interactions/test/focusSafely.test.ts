import { describe, expect, it, vi } from "vitest";
import { focusSafely } from "../src/focusSafely";
import { getInteractionModality, setInteractionModality } from "../src/useFocusVisible";

describe("focusSafely", () => {
  it("focuses immediately for non-virtual modality", () => {
    setInteractionModality("keyboard");

    const element = document.createElement("button");
    document.body.appendChild(element);

    const focusSpy = vi.spyOn(element, "focus");
    focusSafely(element);

    expect(focusSpy).toHaveBeenCalledTimes(1);

    element.remove();
  });

  it("defers focus for virtual modality and still focuses", () => {
    setInteractionModality("virtual");

    const element = document.createElement("button");
    document.body.appendChild(element);

    const focusSpy = vi.spyOn(element, "focus");
    const rafSpy = vi
      .spyOn(window, "requestAnimationFrame")
      .mockImplementation((callback: FrameRequestCallback): number => {
        callback(performance.now());
        return 1;
      });

    focusSafely(element);

    expect(focusSpy).toHaveBeenCalledTimes(1);

    rafSpy.mockRestore();
    element.remove();
  });
});

describe("interaction modality", () => {
  it("tracks current modality", () => {
    setInteractionModality("pointer");
    expect(getInteractionModality()).toBe("pointer");

    setInteractionModality("keyboard");
    expect(getInteractionModality()).toBe("keyboard");
  });
});
