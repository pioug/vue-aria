import { describe, expect, it } from "vitest";
import {
  UNSTABLE_useLoadMoreSentinel,
  useLoadMoreSentinel,
} from "../src/index";

describe("@vue-aria/utils index exports", () => {
  it("exports UNSTABLE_useLoadMoreSentinel as an alias", () => {
    expect(UNSTABLE_useLoadMoreSentinel).toBe(useLoadMoreSentinel);
  });
});
