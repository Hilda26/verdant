"use client";

import { useMemo, useState } from "react";
import { Clock3, FileUp, RotateCcw, Scale, ShieldCheck } from "lucide-react";
import { useWallet } from "@/components/wallet-provider";
import type { EvidencePacket, Pledge } from "@/lib/verdant";
import { useTransaction } from "@/lib/tx/useTransaction";

type PledgeActionsProps = {
  pledge: Pledge;
  evidence: EvidencePacket[];
  onSettled: () => Promise<void>;
};

export function PledgeActions({ pledge, evidence, onSettled }: PledgeActionsProps) {
  const { address, connect } = useWallet();
  const tx = useTransaction(onSettled);
  const activeEvidenceId = useMemo(
    () => pledge.active_evidence_id || evidence.find((packet) => packet.status === "PENDING")?.id || "",
    [evidence, pledge.active_evidence_id],
  );
  const [form, setForm] = useState({
    evidenceId: `${pledge.id}-evidence-${Number(pledge.evidence_count || "0") + 1}`,
    url: "https://example.com/verdant/evidence",
    summary:
      "Public receipts, dated implementation notes, and beneficiary-visible records support the reported environmental work for this pledge.",
    claimedUnits: pledge.target_units,
    bond: "1",
  });

  function update(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function account() {
    return address ?? await connect();
  }

  async function submitEvidence() {
    await tx.send(
      "Submit evidence",
      "submit_evidence",
      [form.evidenceId, pledge.id, form.url, form.summary, BigInt(form.claimedUnits || "0")],
      await account(),
      BigInt(form.bond || "0"),
    );
  }

  async function reviewEvidence() {
    if (!activeEvidenceId) return;
    await tx.send("Review evidence", "review_evidence", [activeEvidenceId], await account());
  }

  async function recoverEvidence() {
    if (!activeEvidenceId) return;
    await tx.send("Recover unresolved evidence", "recover_unresolved_evidence", [activeEvidenceId], await account());
  }

  async function expirePledge() {
    await tx.send("Expire pledge", "expire_pledge", [pledge.id], await account());
  }

  return (
    <section className="panel form-panel">
      <div className="section-label"><Scale size={16} /> Lifecycle actions</div>
      <h2>Settle the relay</h2>
      <div className="form-grid">
        <label>Evidence ID<input value={form.evidenceId} onChange={(event) => update("evidenceId", event.target.value)} /></label>
        <label>Evidence bond<input inputMode="numeric" value={form.bond} onChange={(event) => update("bond", event.target.value)} /></label>
        <label className="wide">Public evidence URL<input value={form.url} onChange={(event) => update("url", event.target.value)} /></label>
        <label>Claimed units<input inputMode="numeric" value={form.claimedUnits} onChange={(event) => update("claimedUnits", event.target.value)} /></label>
        <label className="wide">Evidence summary<textarea value={form.summary} onChange={(event) => update("summary", event.target.value)} /></label>
      </div>
      <div className="action-row">
        <button type="button" onClick={() => void submitEvidence()} disabled={pledge.status !== "ACTIVE"}><FileUp size={16} /> Submit</button>
        <button type="button" onClick={() => void reviewEvidence()} disabled={!activeEvidenceId}><Scale size={16} /> Review</button>
        <button type="button" onClick={() => void recoverEvidence()} disabled={!activeEvidenceId}><RotateCcw size={16} /> Recover</button>
        <button type="button" onClick={() => void expirePledge()}><Clock3 size={16} /> Expire</button>
      </div>
      {tx.error && <p className="error-text">{tx.error}</p>}
      {tx.transactions.length > 0 && (
        <div className="tx-stack">
          {tx.transactions.slice(0, 4).map((item) => (
            <div key={item.hash}><ShieldCheck size={15} /> {item.label}: {item.state}</div>
          ))}
        </div>
      )}
    </section>
  );
}
