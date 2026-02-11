import { describe, expect, it, vi } from "vitest";
import { useSearchField } from "../src/useSearchField";

interface SearchFieldHandlers {
  onKeydown?: (event: KeyboardEvent) => void;
}

interface ClearButtonHandlers {
  onPress?: () => void;
  onPressStart?: () => void;
}

describe("useSearchField", () => {
  it("returns base input props with search type", () => {
    const { inputProps } = useSearchField({
      "aria-label": "Search",
      defaultValue: "abc",
    });

    expect(inputProps.value.type).toBe("search");
    expect(inputProps.value.value).toBe("abc");
    expect(typeof inputProps.value.onKeydown).toBe("function");
  });

  it("submits current value on Enter when onSubmit is provided", () => {
    const onSubmit = vi.fn();
    const { inputProps } = useSearchField({
      "aria-label": "Search",
      defaultValue: "query",
      onSubmit,
    });
    const handlers = inputProps.value as SearchFieldHandlers;
    const event = new KeyboardEvent("keydown", {
      key: "Enter",
      bubbles: true,
      cancelable: true,
    });

    handlers.onKeydown?.(event);

    expect(event.defaultPrevented).toBe(true);
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith("query");
  });

  it("clears value and calls onClear on Escape when non-empty", () => {
    const onClear = vi.fn();
    const { inputProps } = useSearchField({
      "aria-label": "Search",
      defaultValue: "query",
      onClear,
    });
    const handlers = inputProps.value as SearchFieldHandlers;

    const firstEscape = new KeyboardEvent("keydown", {
      key: "Escape",
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(firstEscape, "target", { value: { value: "query" } });
    handlers.onKeydown?.(firstEscape);

    expect(firstEscape.defaultPrevented).toBe(true);
    expect(onClear).toHaveBeenCalledTimes(1);
    expect(inputProps.value.value).toBe("");

    const secondEscape = new KeyboardEvent("keydown", {
      key: "Escape",
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(secondEscape, "target", { value: { value: "" } });
    handlers.onKeydown?.(secondEscape);
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it("prevents Enter when disabled and does not submit", () => {
    const onSubmit = vi.fn();
    const { inputProps } = useSearchField({
      "aria-label": "Search",
      isDisabled: true,
      onSubmit,
    });
    const handlers = inputProps.value as SearchFieldHandlers;
    const event = new KeyboardEvent("keydown", {
      key: "Enter",
      bubbles: true,
      cancelable: true,
    });

    handlers.onKeydown?.(event);

    expect(event.defaultPrevented).toBe(true);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("does not intercept Enter when readOnly", () => {
    const onSubmit = vi.fn();
    const { inputProps } = useSearchField({
      "aria-label": "Search",
      isReadOnly: true,
      onSubmit,
    });
    const handlers = inputProps.value as SearchFieldHandlers;
    const event = new KeyboardEvent("keydown", {
      key: "Enter",
      bubbles: true,
      cancelable: true,
    });

    handlers.onKeydown?.(event);

    expect(event.defaultPrevented).toBe(false);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("returns clear button props and clears on press", () => {
    const onClear = vi.fn();
    const focus = vi.fn();
    const inputRef = {
      focus,
    } as unknown as HTMLInputElement;

    const { clearButtonProps, inputProps } = useSearchField({
      "aria-label": "Search",
      defaultValue: "query",
      onClear,
      inputRef,
    });
    const handlers = clearButtonProps.value as ClearButtonHandlers;

    expect(clearButtonProps.value["aria-label"]).toBe("Clear search");
    expect(clearButtonProps.value.excludeFromTabOrder).toBe(true);

    handlers.onPressStart?.();
    handlers.onPress?.();

    expect(focus).toHaveBeenCalledTimes(1);
    expect(onClear).toHaveBeenCalledTimes(1);
    expect(inputProps.value.value).toBe("");
  });

  it("does not expose defaultValue in input props", () => {
    const { inputProps } = useSearchField({
      "aria-label": "Search",
      defaultValue: "abc",
    });

    expect(inputProps.value.defaultValue).toBeUndefined();
  });

  it("localizes clear button label from locale context fallback", () => {
    const languageSpy = vi
      .spyOn(window.navigator, "language", "get")
      .mockReturnValue("fr-FR");

    const { clearButtonProps } = useSearchField({
      "aria-label": "Search",
      defaultValue: "abc",
    });

    expect(clearButtonProps.value["aria-label"]).toBe("Effacer la recherche");
    languageSpy.mockRestore();
  });
});
