import { describe, expect, it } from "vitest";
import { OverscanManager } from "../src/OverscanManager";
import { Rect } from "../src/Rect";

describe("OverscanManager", () => {
  it("expands the visible rect with default overscan", () => {
    const manager = new OverscanManager();
    manager.setVisibleRect(new Rect(10, 20, 300, 150));

    const rect = manager.getOverscannedRect();
    expect(rect.x).toBe(10);
    expect(rect.y).toBe(20);
    expect(rect.width).toBeGreaterThanOrEqual(300);
    expect(rect.height).toBeGreaterThan(150);
  });
});
