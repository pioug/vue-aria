import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  announce,
  clearAnnouncer,
  destroyAnnouncer,
} from "../src";

function getAnnouncer(): HTMLElement | null {
  return document.querySelector("[data-live-announcer='true']");
}

describe("live announcer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    destroyAnnouncer();
    document.body.innerHTML = "";
    vi.useRealTimers();
  });

  it("creates announcer nodes and appends assertive announcements", () => {
    announce("Saved", "assertive", 1000);

    const announcer = getAnnouncer();
    expect(announcer).not.toBeNull();

    const logs = announcer?.querySelectorAll("[role='log']") ?? [];
    expect(logs.length).toBe(2);

    const assertiveLog = announcer?.querySelector("[aria-live='assertive']");
    expect(assertiveLog?.textContent).toContain("Saved");

    vi.advanceTimersByTime(1000);
    expect(assertiveLog?.textContent).toBe("");
  });

  it("supports polite and labelled announcements", () => {
    const label = document.createElement("span");
    label.id = "external-label";
    label.textContent = "Export completed";
    document.body.appendChild(label);

    announce({ "aria-labelledby": "external-label" }, "polite", 1000);

    const politeLog = getAnnouncer()?.querySelector("[aria-live='polite']");
    const entry = politeLog?.querySelector("[role='img']");

    expect(entry?.getAttribute("aria-labelledby")).toBe("external-label");
  });

  it("clears and destroys announcer", () => {
    announce("Message A", "assertive", 1000);
    announce("Message B", "polite", 1000);

    clearAnnouncer("assertive");

    const announcer = getAnnouncer();
    const assertiveLog = announcer?.querySelector("[aria-live='assertive']");
    const politeLog = announcer?.querySelector("[aria-live='polite']");

    expect(assertiveLog?.textContent).toBe("");
    expect((politeLog?.textContent?.length ?? 0) > 0).toBe(true);

    clearAnnouncer();
    expect(politeLog?.textContent).toBe("");

    destroyAnnouncer();
    expect(getAnnouncer()).toBeNull();
  });
});
