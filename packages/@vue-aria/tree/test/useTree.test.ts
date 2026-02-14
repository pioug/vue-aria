import { describe, expect, it, vi } from "vitest";

const { useGridListMock } = vi.hoisted(() => ({
  useGridListMock: vi.fn(() => ({
    gridProps: {
      role: "grid",
      id: "grid-id",
    },
  })),
}));

vi.mock("@vue-aria/gridlist", async () => {
  const actual = await vi.importActual<typeof import("@vue-aria/gridlist")>(
    "@vue-aria/gridlist"
  );
  return {
    ...actual,
    useGridList: useGridListMock,
  };
});

import { useTree } from "../src/useTree";

describe("useTree", () => {
  it("delegates to useGridList and forces treegrid role", () => {
    const state = {} as any;
    const ref = { current: document.createElement("div") as HTMLElement | null };

    const { gridProps } = useTree(
      {
        "aria-label": "Tree",
      },
      state,
      ref
    );

    expect(useGridListMock).toHaveBeenCalledWith(
      {
        "aria-label": "Tree",
      },
      state,
      ref
    );
    expect(gridProps.role).toBe("treegrid");
    expect(gridProps.id).toBe("grid-id");
  });
});
