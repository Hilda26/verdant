# Verdant Relay

Proof-backed environmental commitments with staked accountability.

Verdant Relay is a GenLayer app for measurable sustainability pledges. A steward stakes GEN behind a public environmental commitment, submits evidence packets, and lets validators score fulfillment into clear lanes: fulfilled, partial, failed, or inconclusive.

## Why It Is Different

- **Impact pledges:** Every pledge has a title, category, region, metric, target units, deadline, source URL, beneficiary, and stake.
- **Evidence packets:** Receipts, public reports, photos, sensor feeds, or third-party pages are fetched, hashed, and stored before review.
- **Partial scoring:** Validators return a 0-100 score instead of a brittle yes/no result.
- **Accountability payouts:** Fulfilled pledges return stake, partial pledges split stake, and failed pledges redirect stake to the named beneficiary.
- **Poster relay UI:** The interface uses a bold Oddless-inspired split-board style for live pledges, evidence trails, and impact units.

## Contract

`contracts/VerdantRelay.py` exposes:

```text
open_pledge(...)
submit_evidence(...)
review_evidence(...)
expire_pledge(...)
get_relay()
list_pledges(...)
list_evidence(...)
get_pledge(...)
get_evidence(...)
```

## Local Development

```bash
npm install
npm run dev
```

Configure after deployment:

```bash
NEXT_PUBLIC_VERDANT_RELAY_CONTRACT=0x27101Dd16615F6D78D112F897369cEA6190b7FD9
NEXT_PUBLIC_GENLAYER_ENDPOINT=https://studio.genlayer.com/api
NEXT_PUBLIC_GENLAYER_CHAIN=studionet
```

StudioNet deployment:

```text
Contract: 0x27101Dd16615F6D78D112F897369cEA6190b7FD9
Tx: 0xed39da562dc7194762f15a4f28fc5c1ccbccadeded0de176f012e35dc38bf72c
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
```
