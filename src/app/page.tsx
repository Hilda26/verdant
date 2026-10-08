"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, BadgeCheck, CircleDollarSign, Leaf, RefreshCw, ShieldCheck } from "lucide-react";
import { EMPTY_DASHBOARD, loadDashboard, type Dashboard } from "@/lib/verdant";
import { OpenPledgeForm } from "@/components/open-pledge-form";
import { PledgeCard } from "@/components/pledge-card";

export default function Home() {
  const [dashboard, setDashboard] = useState<Dashboard>(EMPTY_DASHBOARD);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  async function refresh() {
    setLoading(true);
    setError(undefined);
    try {
      setDashboard(await loadDashboard());
    } catch (cause) {
      setDashboard(EMPTY_DASHBOARD);
      setError(cause instanceof Error ? cause.message : "Unable to load Verdant Relay.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  const { summary, pledges } = dashboard;
  return (
    <main className="page-shell">
      <section className="hero">
        <div>
          <div className="section-label"><Leaf size={16} /> Verdant Relay</div>
          <h1>Environmental promises that can be checked.</h1>
          <p>
            Stake GEN behind measurable sustainability commitments, submit public evidence packets,
            and let GenLayer validators score fulfillment into clear accountability lanes.
          </p>
          <div className="hero-actions">
            <a href="#open">Open pledge</a>
            <Link href="/pledges">Explore pledges</Link>
          </div>
        </div>
        <aside className="signal-panel">
          <div><Activity size={18} /> Relay status</div>
          <strong>{loading ? "Reading..." : `${summary.pledges_created} pledge(s)`}</strong>
          <span>{error ?? "No fake climate claims. Empty state means no on-chain relay data yet."}</span>
        </aside>
      </section>

      <section className="stats-grid">
        <Stat icon={<CircleDollarSign />} label="Total staked" value={`${summary.total_staked} GEN`} />
        <Stat icon={<ShieldCheck />} label="Active pledges" value={summary.active_pledges} />
        <Stat icon={<BadgeCheck />} label="Verified units" value={summary.impact_units_verified} />
      </section>

      <section className="split-layout" id="open">
        <OpenPledgeForm onSettled={refresh} />
        <section className="panel">
          <div className="panel-header">
            <div>
              <div className="section-label">Relay board</div>
              <h2>Recent pledges</h2>
            </div>
            <button type="button" className="ghost-button" onClick={() => void refresh()}><RefreshCw size={16} /> Refresh</button>
          </div>
          {error && <p className="error-text">{error}</p>}
          <div className="pledge-list">
            {pledges.length === 0 ? (
              <div className="empty-state">No pledges yet. Open the first relay commitment to start the board.</div>
            ) : (
              pledges.slice(0, 4).map((pledge) => <PledgeCard key={pledge.id} pledge={pledge} />)
            )}
          </div>
        </section>
      </section>
    </main>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <article className="stat-card">
      <span>{icon}</span>
      <small>{label}</small>
      <strong>{value}</strong>
    </article>
  );
}
