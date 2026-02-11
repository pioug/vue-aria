import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { simulateDesktop, simulateMobile } from "../src";

describe("@vue-spectrum/test-utils", () => {
  beforeEach(() => {
    (globalThis as { vi?: typeof vi }).vi = vi;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete (globalThis as { vi?: typeof vi }).vi;
  });

  it("simulateMobile clamps screen width to [0, 700]", () => {
    simulateMobile(1200);
    expect(window.screen.width).toBe(700);

    vi.restoreAllMocks();
    simulateMobile(-20);
    expect(window.screen.width).toBe(0);

    vi.restoreAllMocks();
    simulateMobile(640);
    expect(window.screen.width).toBe(640);
  });

  it("simulateDesktop clamps screen width to [701, +inf)", () => {
    simulateDesktop(300);
    expect(window.screen.width).toBe(701);

    vi.restoreAllMocks();
    simulateDesktop(960);
    expect(window.screen.width).toBe(960);
  });

  it("throws when no global spy API is available", () => {
    delete (globalThis as { vi?: typeof vi }).vi;
    expect(() => simulateMobile()).toThrow(
      "simulateMobile/simulateDesktop require a global jest or vi spy API."
    );
  });
});
