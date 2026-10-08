"use client";

import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { TransactionStatus } from "genlayer-js/types";
import type { CalldataEncodable, TransactionHash } from "genlayer-js/types";

const DEFAULT_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000" as const;
export const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_VERDANT_RELAY_CONTRACT || DEFAULT_CONTRACT_ADDRESS) as `0x${string}` | undefined;
const endpoint = process.env.NEXT_PUBLIC_GENLAYER_ENDPOINT ?? "https://studio.genlayer.com/api";
const explorer = "https://explorer-studio.genlayer.com";

export type PledgeStatus = "ACTIVE" | "EVIDENCE_OPEN" | "FULFILLED" | "PARTIAL" | "FAILED" | "EXPIRED" | string;
export type EvidenceStatus = "PENDING" | "FULFILLED" | "PARTIAL" | "FAILED" | "INCONCLUSIVE" | string;

export type RelaySummary = {
  pledges_created: string;
  active_pledges: string;
  fulfilled_pledges: string;
  failed_pledges: string;
  evidence_packets: string;
  total_staked: string;
  stake_returned: string;
  stake_redirected: string;
  impact_units_verified: string;
};

export type Pledge = {
  id: string;
  steward: string;
  beneficiary: string;
  title: string;
  category: string;
  region: string;
  metric: string;
  target_units: string;
  deadline: string;
  source_url: string;
  source_sha256: string;
  source_excerpt: string;
  status: PledgeStatus;
  created_at: string;
  stake: string;
  active_evidence_id: string;
  evidence_count: string;
  verified_units: string;
  last_score: string;
  review_rationale: string;
};

export type EvidencePacket = {
  id: string;
  pledge_id: string;
  reporter: string;
  evidence_url: string;
  evidence_sha256: string;
  evidence_excerpt: string;
  summary: string;
  claimed_units: string;
  status: EvidenceStatus;
  filed_at: string;
  reviewed_at: string;
  verdict: string;
  score: string;
  rationale: string;
  evidence_bond: string;
};

export type Dashboard = { summary: RelaySummary; pledges: Pledge[]; evidence: EvidencePacket[] };

export const EMPTY_RELAY: RelaySummary = {
  pledges_created: "0",
  active_pledges: "0",
  fulfilled_pledges: "0",
  failed_pledges: "0",
  evidence_packets: "0",
  total_staked: "0",
  stake_returned: "0",
  stake_redirected: "0",
  impact_units_verified: "0",
};

export const EMPTY_DASHBOARD: Dashboard = { summary: EMPTY_RELAY, pledges: [], evidence: [] };

export const txUrl = (hash: string) => `${explorer}/tx/${hash}`;
export const addressUrl = (address: string) => `${explorer}/address/${address}`;

type EncodedArg =
  | string
  | number
  | boolean
  | null
  | EncodedArg[]
  | { __verdantBigInt: string }
  | { [key: string]: EncodedArg };

function client(account?: `0x${string}`) {
  return createClient({ chain: studionet, endpoint, account, provider: typeof window === "undefined" ? undefined : window.ethereum });
}

function configuredAddress(): `0x${string}` {
  if (!CONTRACT_ADDRESS || /^0x0{40}$/i.test(CONTRACT_ADDRESS)) throw new Error("Verdant Relay contract not configured.");
  return CONTRACT_ADDRESS;
}

export async function readContract<T>(functionName: string, args: CalldataEncodable[] = []): Promise<T> {
  if (typeof window !== "undefined") {
    const response = await fetch("/api/verdant/read", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ functionName, args: args.map(encodeArg) }),
    });
    const payload = await response.json() as { result?: T; error?: string };
    if (!response.ok || payload.error) {
      throw new Error(`Unable to read Verdant Relay on StudioNet: ${payload.error ?? response.statusText}`);
    }
    return payload.result as T;
  }

  return await client().readContract({ address: configuredAddress(), functionName, args }) as T;
}

function encodeArg(value: CalldataEncodable): EncodedArg {
  if (typeof value === "bigint") return { __verdantBigInt: value.toString() };
  if (Array.isArray(value)) return value.map((item) => encodeArg(item as CalldataEncodable));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, encodeArg(item as CalldataEncodable)]));
  }
  return value as EncodedArg;
}

export async function loadDashboard(): Promise<Dashboard> {
  const [summary, pledges, evidence] = await Promise.all([
    readContract<RelaySummary>("get_relay"),
    readContract<Pledge[]>("list_pledges", ["", 0n, 50n]),
    readContract<EvidencePacket[]>("list_evidence", ["", 0n, 50n]),
  ]);
  return { summary, pledges, evidence };
}

export async function loadPledge(id: string): Promise<{ pledge: Pledge; evidence: EvidencePacket[] }> {
  const [pledge, evidence] = await Promise.all([
    readContract<Pledge>("get_pledge", [id]),
    readContract<EvidencePacket[]>("list_evidence", [id, 0n, 50n]),
  ]);
  return { pledge, evidence };
}

export async function writeContract(account: `0x${string}`, functionName: string, args: CalldataEncodable[], value = 0n) {
  const writer = client(account);
  await writer.connect("studionet");
  return await writer.writeContract({ address: configuredAddress(), functionName, args, value, consensusMaxRotations: 3 }) as TransactionHash;
}

export async function waitFinalized(account: `0x${string}`, hash: TransactionHash) {
  const writer = client(account);
  await writer.connect("studionet");
  await writer.waitForTransactionReceipt({ hash, status: TransactionStatus.FINALIZED, interval: 5000, retries: 180 });
  const transaction = await writer.getTransaction({ hash });
  const execution = transaction?.consensus_data?.leader_receipt?.[0]?.execution_result;
  if (execution && execution !== "SUCCESS") throw new Error(`Finalized transaction rolled back (${execution}).`);
  return { transaction, triggered: (transaction as unknown as { triggered_transactions?: string[] } | undefined)?.triggered_transactions ?? [] };
}

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on?: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
    };
  }
}
