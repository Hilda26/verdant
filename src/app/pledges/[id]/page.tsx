"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileCheck, Leaf, RefreshCw } from "lucide-react";
import { loadPledge, type EvidencePacket, type Pledge } from "@/lib/verdant";

export default function PledgeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [pledge, setPledge] = useState<Pledge>();
  const [evidence, setEvidence] = useState<EvidencePacket[]>([]);
  const [error, setError] = useState<string>();

  const refresh = useCallback(async () => {
    setError(undefined);
    try {
      const result = await loadPledge(id);
      setPledge(result.pledge);
      setEvidence(result.evidence);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load pledge.");
    }
  }, [id]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <main className="page-shell compact">
      <Link className="back-link" href="/pledges"><ArrowLeft size={16} /> Back to pledges</Link>
      {error && <p className="error-text">{error}</p>}
      {!pledge ? (
        <section className="panel"><p>Reading pledge...</p></section>
      ) : (
        <>
          <section className="detail-hero">
            <div>
              <div className="section-label"><Leaf size={16} /> {pledge.status}</div>
              <h1>{pledge.title}</h1>
              <p>{pledge.metric}</p>
            </div>
            <button type="button" className="ghost-button" onClick={() => void refresh()}><RefreshCw size={16} /> Refresh</button>
          </section>
          <section className="stats-grid">
            <Stat label="Target" value={pledge.target_units} />
            <Stat label="Verified" value={pledge.verified_units} />
            <Stat label="Last score" value={`${pledge.last_score}%`} />
            <Stat label="Stake" value={`${pledge.stake} GEN`} />
          </section>
          <section className="panel">
            <div className="section-label"><FileCheck size={16} /> Evidence trail</div>
            <div className="evidence-list">
              {evidence.length === 0 ? <div className="empty-state">No evidence submitted yet.</div> : evidence.map((packet) => (
                <article className="evidence-row" key={packet.id}>
                  <strong>{packet.id}</strong>
                  <span>{packet.status} - score {packet.score}% - {packet.claimed_units} claimed units</span>
                  <p>{packet.summary}</p>
                </article>
              ))}
            </div>
          </section>
        </>
      )}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <article className="stat-card"><small>{label}</small><strong>{value}</strong></article>;
}
