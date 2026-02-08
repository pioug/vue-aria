import { afterEach, describe, expect, it } from "vitest";
import { effectScope, nextTick } from "vue";
import { useVirtualDrop } from "../src/useVirtualDrop";
import { beginDragging, endDragging } from "../src/DragManager";

describe("useVirtualDrop", () => {
  afterEach(() => {
    endDragging();
  });

  it("returns click props with no description when not dragging", async () => {
    const scope = effectScope();
    let result: ReturnType<typeof useVirtualDrop> | undefined;

    scope.run(() => {
      result = useVirtualDrop();
    });

    await nextTick();

    expect(result?.dropProps.value["aria-describedby"]).toBeUndefined();
    expect(typeof result?.dropProps.value.onClick).toBe("function");

    scope.stop();
  });

  it("adds drag description when a drag session is active", async () => {
    beginDragging({ id: "drag-1" });

    const scope = effectScope();
    let result: ReturnType<typeof useVirtualDrop> | undefined;

    scope.run(() => {
      result = useVirtualDrop();
    });

    await nextTick();

    const describedBy = result?.dropProps.value["aria-describedby"] as string | undefined;
    expect(typeof describedBy).toBe("string");
    expect(describedBy?.length).toBeGreaterThan(0);

    const descriptionNode = describedBy ? document.getElementById(describedBy) : null;
    expect(descriptionNode?.textContent).toBe("Activate to drop.");

    scope.stop();
    await nextTick();

    if (describedBy) {
      expect(document.getElementById(describedBy)).toBeNull();
    }
  });
});
