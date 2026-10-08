import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../contracts/VerdantRelay.py", import.meta.url), "utf8");
const required = [
  "class VerdantRelay(gl.Contract)",
  "def open_pledge",
  "def submit_evidence",
  "def review_evidence",
  "def expire_pledge",
  "def get_relay",
  "def list_pledges",
  "def list_evidence",
  "def get_pledge",
  "def get_evidence",
  "\"verdict\":\"FULFILLED|PARTIAL|FAILED|INCONCLUSIVE\"",
];

const missing = required.filter((needle) => !source.includes(needle));
if (missing.length) {
  console.error(`Verdant Relay contract missing expected entries: ${missing.join(", ")}`);
  process.exit(1);
}

console.log("Verdant Relay schema surface verified.");
