"use client";

import { useState } from "react";
import { Plus, Send, ShieldCheck } from "lucide-react";
import { useWallet } from "@/components/wallet-provider";
import { useTransaction } from "@/lib/tx/useTransaction";

export function OpenPledgeForm({ onSettled }: { onSettled: () => Promise<void> }) {
  const { address, connect } = useWallet();
  const tx = useTransaction(onSettled);
  const [form, setForm] = useState({
    id: "compost-venue-pledge",
    title: "Compostable packaging for weekend market",
    category: "Waste diversion",
    region: "Lagos, Nigeria",
    metric: "Use compostable packaging for at least 500 public meal servings and submit receipt plus vendor evidence.",
    target: "500",
    deadline: "2026-12-31T23:59:59Z",
    source: "https://example.com/verdant/market-plan",
    beneficiary: "0x1111111111111111111111111111111111111111",
    stake: "5",
  });

  function update(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit() {
    const account = address ?? await connect();
    await tx.send(
      "Open environmental pledge",
      "open_pledge",
      [form.id, form.title, form.category, form.region, form.metric, BigInt(form.target || "0"), form.deadline, form.source, form.beneficiary],
      account,
      BigInt(form.stake || "0"),
    );
  }

  return (
    <section className="panel form-panel">
      <div className="section-label"><Plus size={16} /> New relay pledge</div>
      <h2>Stake an impact commitment</h2>
      <div className="form-grid">
        <label>Pledge ID<input value={form.id} onChange={(event) => update("id", event.target.value)} /></label>
        <label>Title<input value={form.title} onChange={(event) => update("title", event.target.value)} /></label>
        <label>Category<input value={form.category} onChange={(event) => update("category", event.target.value)} /></label>
        <label>Region<input value={form.region} onChange={(event) => update("region", event.target.value)} /></label>
        <label className="wide">Impact metric<textarea value={form.metric} onChange={(event) => update("metric", event.target.value)} /></label>
        <label>Target units<input inputMode="numeric" value={form.target} onChange={(event) => update("target", event.target.value)} /></label>
        <label>Deadline<input value={form.deadline} onChange={(event) => update("deadline", event.target.value)} /></label>
        <label className="wide">Public source URL<input value={form.source} onChange={(event) => update("source", event.target.value)} /></label>
        <label className="wide">Beneficiary address<input value={form.beneficiary} onChange={(event) => update("beneficiary", event.target.value)} /></label>
        <label>Stake<input inputMode="numeric" value={form.stake} onChange={(event) => update("stake", event.target.value)} /></label>
      </div>
      <button type="button" onClick={() => void submit()}><Send size={16} /> Open pledge</button>
      {tx.error && <p className="error-text">{tx.error}</p>}
      {tx.transactions.length > 0 && (
        <div className="tx-stack">
          {tx.transactions.slice(0, 3).map((item) => (
            <div key={item.hash}><ShieldCheck size={15} /> {item.label}: {item.state}</div>
          ))}
        </div>
      )}
    </section>
  );
}
