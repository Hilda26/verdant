const PLEDGE_LABELS: Record<string, string> = {
  ACTIVE: "Active",
  EVIDENCE_OPEN: "Evidence review",
  FULFILLED: "Fulfilled",
  PARTIAL: "Partially fulfilled",
  FAILED: "Failed",
  EXPIRED: "Expired",
};

const EVIDENCE_LABELS: Record<string, string> = {
  PENDING: "Pending review",
  FULFILLED: "Fulfilled",
  PARTIAL: "Partial",
  FAILED: "Failed",
  INCONCLUSIVE: "Inconclusive",
};

export function pledgeLabel(status: string) {
  return PLEDGE_LABELS[status] ?? status.toLowerCase().replaceAll("_", " ");
}

export function evidenceLabel(status: string) {
  return EVIDENCE_LABELS[status] ?? status.toLowerCase().replaceAll("_", " ");
}

export function statusTone(status: string) {
  if (["ACTIVE", "FULFILLED"].includes(status)) return "mint";
  if (["EVIDENCE_OPEN", "PENDING", "PARTIAL", "INCONCLUSIVE"].includes(status)) return "sage";
  if (["FAILED", "EXPIRED"].includes(status)) return "rose";
  return "glass";
}

export const bondLabel = pledgeLabel;
export const pointLabel = evidenceLabel;
