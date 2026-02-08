import { describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { useTimeField } from "../src";
import type { DateFieldSegment } from "@vue-aria/datefield";

function createDateValue(value: string): { toString: () => string } {
  return {
    toString: () => value,
  };
}

describe("useTimeField", () => {
  it("uses timeValue for hidden input serialization", () => {
    const root = document.createElement("div");
    const segment = document.createElement("div");
    segment.tabIndex = 0;
    root.appendChild(segment);
    document.body.appendChild(root);

    const segments = ref<readonly DateFieldSegment[]>([
      {
        type: "hour",
        text: "10",
        value: 10,
        minValue: 1,
        maxValue: 12,
        isEditable: true,
      },
    ]);

    const state = {
      value: ref(createDateValue("2026-02-08T10:00:00")),
      timeValue: ref(createDateValue("10:45:00")),
      defaultValue: ref(createDateValue("09:00:00")),
      dateValue: ref(createDateValue("2026-02-08")),
      maxGranularity: ref("hour"),
      segments,
      isDisabled: ref(false),
      isReadOnly: ref(false),
      isRequired: ref(false),
      displayValidation: ref({
        isInvalid: false,
        validationErrors: [],
        validationDetails: null,
      }),
      confirmPlaceholder: vi.fn(),
      commitValidation: vi.fn(),
      setValue: vi.fn(),
    };

    const { inputProps } = useTimeField(
      {
        label: "Time",
      },
      state,
      root
    );

    expect(inputProps.value.value).toBe("10:45:00");
  });
});
