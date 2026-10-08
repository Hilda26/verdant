"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { EMPTY_DASHBOARD, loadDashboard, type Dashboard } from "@/lib/verdant";
import { PledgeCard } from "@/components/pledge-card";

export default function PledgesPage() {
  const [dashboard, setDashboard] = useState<Dashboard>(EMPTY_DASHBOARD);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string>();

  useEffect(() => {
    loadDashboard().then(setDashboard).catch((cause) => setError(cause instanceof Error ? cause.message : "Unable to load pledges."));
  }, []);

  const pledges = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return dashboard.pledges;
    return dashboard.pledges.filter((pledge) => `${pledge.id} ${pledge.title} ${pledge.category} ${pledge.region} ${pledge.status}`.toLowerCase().includes(needle));
  }, [dashboard.pledges, query]);

  return (
    <main className="page-shell compact">
      <section className="page-title">
        <div>
          <div className="section-label">Relay atlas</div>
          <h1>Pledges</h1>
          <p>Scan environmental commitments, evidence state, and verification scores.</p>
        </div>
        <label className="searchbar"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search pledges" /></label>
      </section>
      {error && <p className="error-text">{error}</p>}
      <section className="pledges-grid">
        {pledges.length === 0 ? <div className="empty-state">No pledges to show.</div> : pledges.map((pledge) => <PledgeCard key={pledge.id} pledge={pledge} />)}
      </section>
    </main>
  );
}
