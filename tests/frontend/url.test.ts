import { describe, expect, it } from "vitest";
import { isHttpsUrl, isPledgeId } from "@/lib/validation/url";

describe("Verdant Relay input validation", () => {
  it("accepts only https urls", () => {
    expect(isHttpsUrl("https://example.com/report")).toBe(true);
    expect(isHttpsUrl("http://example.com/report")).toBe(false);
    expect(isHttpsUrl("not a url")).toBe(false);
  });

  it("keeps pledge ids route-safe and contract-safe", () => {
    expect(isPledgeId("compost-pledge_1")).toBe(true);
    expect(isPledgeId("ab")).toBe(false);
    expect(isPledgeId("bad/id")).toBe(false);
  });
});
