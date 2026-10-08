import Link from "next/link";
import { ArrowUpRight, ClipboardCheck, Sprout } from "lucide-react";
import type { Pledge } from "@/lib/verdant";

export function PledgeCard({ pledge }: { pledge: Pledge }) {
  const score = Number.parseInt(pledge.last_score || "0", 10);
  return (
    <article className="pledge-card">
      <div className="card-kicker">
        <span>{pledge.status}</span>
        <span>{pledge.category}</span>
      </div>
      <h3><Link href={`/pledges/${pledge.id}`}>{pledge.title}</Link></h3>
      <p>{pledge.metric}</p>
      <div className="pledge-grid">
        <span><Sprout size={16} /> {pledge.verified_units}/{pledge.target_units} units</span>
        <span><ClipboardCheck size={16} /> {pledge.evidence_count} packet(s)</span>
      </div>
      <div className="meter" aria-label="review score">
        <span style={{ width: `${Math.min(100, Math.max(0, score))}%` }} />
      </div>
      <div className="card-footer">
        <code>{pledge.id}</code>
        <Link href={pledge.source_url} target="_blank" rel="noreferrer">Source <ArrowUpRight size={14} /></Link>
      </div>
    </article>
  );
}
