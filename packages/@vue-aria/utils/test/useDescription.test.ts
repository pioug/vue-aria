import { describe, expect, it } from "vitest";
import { effectScope } from "vue";
import { useDescription } from "../src/useDescription";

describe("useDescription", () => {
  it("returns undefined aria-describedby when no description is passed", () => {
    const scope = effectScope();
    const result = scope.run(() => useDescription(undefined));
    expect(result?.descriptionProps.value["aria-describedby"]).toBeUndefined();
    scope.stop();
  });

  it("creates a hidden description node and wires aria-describedby", () => {
    const scope = effectScope();
    const result = scope.run(() => useDescription("Long press to open menu"));
    const id = result?.descriptionProps.value["aria-describedby"] as string | undefined;

    expect(id).toBeDefined();
    const node = id ? document.getElementById(id) : null;
    expect(node).not.toBeNull();
    expect(node?.textContent).toBe("Long press to open menu");
    expect(node?.style.display).toBe("none");

    scope.stop();
    expect(id ? document.getElementById(id) : null).toBeNull();
  });

  it("reuses a single node for the same description text", () => {
    const scopeA = effectScope();
    const resultA = scopeA.run(() => useDescription("Shared description"));
    const idA = resultA?.descriptionProps.value["aria-describedby"] as string | undefined;

    const scopeB = effectScope();
    const resultB = scopeB.run(() => useDescription("Shared description"));
    const idB = resultB?.descriptionProps.value["aria-describedby"] as string | undefined;

    expect(idA).toBeDefined();
    expect(idB).toBe(idA);

    scopeA.stop();
    expect(idA ? document.getElementById(idA) : null).not.toBeNull();

    scopeB.stop();
    expect(idA ? document.getElementById(idA) : null).toBeNull();
  });
});
