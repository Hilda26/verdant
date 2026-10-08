import { describe, expect, it } from "vitest";
import { evidenceLabel, pledgeLabel, statusTone } from "@/lib/contract/status";

describe("Verdant Relay status helpers", () => {
  it("labels pledge states for readers", () => {
    expect(pledgeLabel("ACTIVE")).toBe("Active");
    expect(pledgeLabel("EVIDENCE_OPEN")).toBe("Evidence review");
    expect(pledgeLabel("PARTIAL")).toBe("Partially fulfilled");
  });

  it("maps active, partial, and failed states to distinct tones", () => {
    expect(statusTone("ACTIVE")).toBe("mint");
    expect(statusTone("PARTIAL")).toBe("sage");
    expect(statusTone("FAILED")).toBe("rose");
  });

  it("labels evidence classifications", () => {
    expect(evidenceLabel("FULFILLED")).toBe("Fulfilled");
    expect(evidenceLabel("INCONCLUSIVE")).toBe("Inconclusive");
  });
});
