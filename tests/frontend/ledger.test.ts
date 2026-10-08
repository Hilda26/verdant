import { describe, expect, it } from "vitest";
import { EMPTY_DASHBOARD } from "@/lib/verdant";

describe("Verdant Relay dashboard fallback", () => {
  it("does not invent pledges when reads fail", () => {
    expect(EMPTY_DASHBOARD.summary.pledges_created).toBe("0");
    expect(EMPTY_DASHBOARD.summary.total_staked).toBe("0");
    expect(EMPTY_DASHBOARD.pledges).toEqual([]);
  });
});
