# Verdant Relay -- Submission Notes

Verdant Relay is proof-backed accountability for environmental commitments. A steward stakes GEN behind a measurable sustainability pledge, submits public evidence, and lets GenLayer validators score fulfillment into fulfilled, partial, failed, or inconclusive lanes.

## Submission Parameters

- Project name: `Verdant Relay`
- Category/tag: `Governance`, `DeFi`, or `Other`
- Live app: `https://verdant-protocole.vercel.app`
- GitHub repository: `https://github.com/Hilda26/verdant`
- Network: `GenLayer StudioNet`
- Contract address: `0x6688bd877464CF5AC3a2Af94FB67962fC6106A3f`
- Deployment tx: `0x2b3500f6c6c76a73b57d033f02ea30d61cf379c097e4f0a6447101637c809d32`
- One-liner: `Verdant Relay turns environmental promises into staked, evidence-scored commitments on GenLayer.`
- Access note: Vercel deployment protection is disabled; reviewers can open the app directly.

## Highlights

1. **Staked impact pledges.** Every commitment names a metric, target units, deadline, beneficiary, and stake.
2. **Evidence packets.** Public evidence is fetched, hashed, excerpted, and stored before review.
3. **Scored outcomes.** Validators return a 0-100 score and one of four lanes: fulfilled, partial, failed, or inconclusive.
4. **Accountability payouts.** Fulfilled pledges return steward stake, partial pledges split steward stake, failed or expired pledges redirect stake to the beneficiary, and reporter evidence bonds are returned after resolution.
5. **Timeout recovery.** Unresolved pending evidence can be recovered after seven days so deposited GEN is not locked by stalled adjudication.
6. **No fake fallback data.** Empty contract reads show an empty relay board.

## Main Contract Methods

```text
open_pledge
submit_evidence
review_evidence
expire_pledge
recover_unresolved_evidence
get_relay
list_pledges
list_evidence
get_pledge
get_evidence
```

## Settlement Details

- Fulfilled: verdict `FULFILLED`, score `>= 90`; steward receives the pledged stake, reporter receives the evidence bond.
- Partial: verdict `PARTIAL`, score `40-89`; verified units use `min(target_units, max(1, claimed_units * score // 100))`; steward receives half the stake and the beneficiary receives the remainder; reporter receives the evidence bond.
- Failed: verdict `FAILED`, score `<= 39`; beneficiary receives the stake and reporter receives the evidence bond.
- Inconclusive: pledge reopens if still before deadline; if expired, stake goes to the beneficiary. Reporter evidence bond is returned.
- Timeout: after seven days, `recover_unresolved_evidence` marks pending evidence inconclusive, returns the reporter bond, and either reopens or expires the pledge based on the deadline.

## Evidence Authenticity Limitation

The contract stores fetched source/evidence excerpts and SHA-256 hashes, then relies on GenLayer validators to assess support for the environmental claim. It cannot cryptographically prove the real-world authenticity of public pages, photos, receipts, or sensor feeds; reviewers should treat the adjudication as evidence assessment rather than a guarantee that every off-chain artifact is genuine.

## Verification Commands

```bash
npm run verify:schema
npm run lint
npm test
npm run build
python -m pytest tests/direct -q
python -m pytest tests/integration -q -s
```
