import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { announce, clearAnnouncer, destroyAnnouncer } from "../src";

describe("live announcer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    destroyAnnouncer();
  });

  afterEach(() => {
    destroyAnnouncer();
    vi.runAllTimers();
    vi.useRealTimers();
  });

  it("creates announcer and announces assertive text", () => {
    announce("Hello world", "assertive", 1000);
    vi.advanceTimersByTime(101);

    const host = document.querySelector("[data-live-announcer='true']") as HTMLElement | null;
    expect(host).toBeTruthy();

    const assertive = host?.querySelector("[aria-live='assertive']");
    expect(assertive?.textContent).toContain("Hello world");
  });

  it("announces polite messages", () => {
    announce("Polite", "polite", 1000);
    vi.advanceTimersByTime(101);

    const polite = document.querySelector("[aria-live='polite']");
    expect(polite?.textContent).toContain("Polite");
  });

  it("supports aria-labelledby message payload", () => {
    const label = document.createElement("div");
    label.id = "label-id";
    label.textContent = "label";
    document.body.appendChild(label);

    announce({ "aria-labelledby": "label-id" }, "assertive", 1000);
    vi.advanceTimersByTime(101);

    const announced = document.querySelector("[aria-live='assertive'] [role='img']");
    expect(announced?.getAttribute("aria-labelledby")).toBe("label-id");

    label.remove();
  });

  it("clears region content", () => {
    announce("To clear", "assertive", 1000);
    vi.advanceTimersByTime(101);

    clearAnnouncer("assertive");

    const assertive = document.querySelector("[aria-live='assertive']");
    expect(assertive?.textContent).toBe("");
  });

  it("destroys announcer node", () => {
    announce("bye", "assertive", 1000);
    vi.advanceTimersByTime(101);

    destroyAnnouncer();

    expect(document.querySelector("[data-live-announcer='true']")).toBeNull();
  });
});
