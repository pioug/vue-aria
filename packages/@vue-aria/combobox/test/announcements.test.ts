import { describe, expect, it, vi } from "vitest";

const { isAppleDeviceMock } = vi.hoisted(() => ({
  isAppleDeviceMock: vi.fn(),
}));

vi.mock("@vue-aria/utils", async () => {
  const actual = await vi.importActual<typeof import("@vue-aria/utils")>(
    "@vue-aria/utils"
  );
  return {
    ...actual,
    isAppleDevice: isAppleDeviceMock,
  };
});

import {
  getComboBoxCountAnnouncement,
  shouldAnnounceAppleSelection,
} from "../src/useComboBox";

describe("combobox announcements", () => {
  it("returns item count announcement using provided formatter", () => {
    const formatter = {
      format: vi.fn((_key: string, values: { optionCount: number }) => `count:${values.optionCount}`),
    };

    const message = getComboBoxCountAnnouncement(
      {
        collection: {
          getKeys: () => ["item-a", "section-1", "item-b"].values(),
          getItem: (key: string) => {
            if (key === "section-1") {
              return { type: "section" };
            }
            return { type: "item" };
          },
        },
      } as any,
      formatter as any
    );

    expect(message).toBe("count:2");
    expect(formatter.format).toHaveBeenCalledWith("countAnnouncement", {
      optionCount: 2,
    });
  });

  it("delegates apple announcement detection to platform helper", () => {
    isAppleDeviceMock.mockReturnValueOnce(true);
    expect(shouldAnnounceAppleSelection()).toBe(true);

    isAppleDeviceMock.mockReturnValueOnce(false);
    expect(shouldAnnounceAppleSelection()).toBe(false);
  });
});
