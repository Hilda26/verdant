# Verdant Relay

Proof-backed environmental commitments with staked accountability.

Verdant Relay is a GenLayer app for measurable sustainability pledges. A steward stakes GEN behind a public environmental commitment, submits evidence packets, and lets validators score fulfillment into clear lanes: fulfilled, partial, failed, or inconclusive.

## Why It Is Different

- **Impact pledges:** Every pledge has a title, category, region, metric, target units, deadline, source URL, beneficiary, and stake.
- **Evidence packets:** Receipts, public reports, photos, sensor feeds, or third-party pages are fetched, hashed, and stored before review.
- **Partial scoring:** Validators return a 0-100 score instead of a brittle yes/no result.
- **Accountability payouts:** Fulfilled pledges return steward stake, partial pledges split steward stake, failed or expired pledges redirect stake to the named beneficiary, and evidence bonds return to the reporter once evidence is resolved.
- **Timeout recovery:** Pending evidence can be recovered after seven days, so pledge funds are not locked if adjudication stalls.
- **Poster relay UI:** The interface uses a bold Oddless-inspired split-board style for live pledges, evidence trails, and impact units.

## Contract

`contracts/VerdantRelay.py` exposes:

```text
open_pledge(...)
submit_evidence(...)
review_evidence(...)
expire_pledge(...)
recover_unresolved_evidence(...)
get_relay()
list_pledges(...)
list_evidence(...)
get_pledge(...)
get_evidence(...)
```

## Settlement Rules

- Fulfilled evidence requires a fulfilled verdict with score `>= 90`; the steward stake returns to the steward and the reporter evidence bond returns to the reporter.
- Partial evidence requires a partial verdict with score `40-89`. Verified units are `min(target_units, max(1, claimed_units * score // 100))`. Half the stake returns to the steward and the remainder goes to the beneficiary.
- Failed evidence requires a failed verdict with score `<= 39`; the stake goes to the beneficiary and the evidence bond returns to the reporter.
- Inconclusive evidence returns the pledge to active if the deadline is still open, or expires the pledge if the deadline has passed. In both cases the reporter bond is returned.
- Pending evidence can be timed out after seven days with `recover_unresolved_evidence`; if the pledge is already expired, recovery also settles the stake to the beneficiary.

## Evidence Authenticity

Verdant Relay hashes and stores public source and evidence excerpts at submission time, then asks GenLayer validators to judge whether the evidence supports the pledge. It does not cryptographically prove that an off-chain photo, sensor feed, receipt, or webpage is authentic; that limitation is handled by public-source review, recorded hashes, separate reporter/steward/beneficiary incentives, and validator consensus over the submitted evidence.

## Local Development

```bash
npm install
npm run dev
```

Configure after deployment:

```bash
NEXT_PUBLIC_VERDANT_RELAY_CONTRACT=0x6688bd877464CF5AC3a2Af94FB67962fC6106A3f
NEXT_PUBLIC_GENLAYER_ENDPOINT=https://studio.genlayer.com/api
NEXT_PUBLIC_GENLAYER_CHAIN=studionet
```

StudioNet deployment:

```text
Contract: 0x6688bd877464CF5AC3a2Af94FB67962fC6106A3f
Tx: 0x2b3500f6c6c76a73b57d033f02ea30d61cf379c097e4f0a6447101637c809d32
Vercel: https://verdant-protocole.vercel.app
```

Deploy to StudioNet:

```bash
python scripts/deploy-verdant.py
```

## Verification

```bash
npm run verify:schema
npm run lint
npm test
npm run build
python -m pytest tests/direct -q
python -m pytest tests/integration -q -s
```
