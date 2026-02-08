import { afterEach, describe, expect, it, vi } from "vitest";
import { effectScope, ref } from "vue";
import * as liveAnnouncer from "@vue-aria/live-announcer";
import { useToastState } from "@vue-aria/toast-state";
import { useToastRegion } from "../src";

describe("useToastRegion", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("provides region semantics and pauses/resumes timers on hover", () => {
    const pauseAll = vi.fn();
    const resumeAll = vi.fn();

    const scope = effectScope();
    let region!: ReturnType<typeof useToastRegion>;

    scope.run(() => {
      region = useToastRegion(
        {},
        {
          visibleToasts: ref([]),
          pauseAll,
          resumeAll,
        },
        ref(null)
      );
    });

    expect(region.regionProps.value.role).toBe("region");
    expect(region.regionProps.value["aria-label"]).toBe("Notifications");

    const currentTarget = document.createElement("div");
    const target = document.createElement("span");
    currentTarget.appendChild(target);

    (region.regionProps.value.onPointerenter as (event: PointerEvent) => void)({
      currentTarget,
      target,
      pointerType: "mouse",
    } as unknown as PointerEvent);

    (region.regionProps.value.onPointerleave as (event: PointerEvent) => void)({
      currentTarget,
      target,
      pointerType: "mouse",
    } as unknown as PointerEvent);

    expect(pauseAll).toHaveBeenCalledTimes(1);
    expect(resumeAll).toHaveBeenCalledTimes(1);

    scope.stop();
  });

  it("announces live status updates and restores focus when empty", () => {
    const announceSpy = vi.spyOn(liveAnnouncer, "announce");

    const externalButton = document.createElement("button");
    externalButton.textContent = "trigger";
    document.body.appendChild(externalButton);

    const regionElement = document.createElement("div");
    const toastElement = document.createElement("div");
    toastElement.setAttribute("role", "alertdialog");
    toastElement.tabIndex = -1;
    regionElement.appendChild(toastElement);
    document.body.appendChild(regionElement);

    const scope = effectScope();
    scope.run(() => {
      const state = useToastState<string>({
        maxVisibleToasts: 1,
      });

      const region = useToastRegion({}, state, ref(regionElement));

      state.add("First", { timeout: 0 });
      expect(region.regionProps.value["aria-label"]).toBe("1 notification");

      (region.regionProps.value.onFocusin as (event: FocusEvent) => void)({
        currentTarget: regionElement,
        target: toastElement,
        relatedTarget: externalButton,
      } as unknown as FocusEvent);

      (region.regionProps.value.onFocus as (event: FocusEvent) => void)({
        target: toastElement,
      } as unknown as FocusEvent);

      toastElement.focus();
      expect(document.activeElement).toBe(toastElement);

      state.clear();
      expect(document.activeElement).toBe(externalButton);
    });

    expect(announceSpy).toHaveBeenCalled();
    scope.stop();
    announceSpy.mockRestore();
  });
});
