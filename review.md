# Verdant Relay Review Fixes

## Team Review Addressed

Verdant Relay now enforces complete accounting for steward stakes and reporter evidence bonds across fulfilled, partial, failed, inconclusive, expired, and unresolved-evidence paths.

## Contract Changes

- Evidence bonds are no longer paid to the steward during fulfilled or partial settlement.
- Evidence bonds now return to the evidence reporter after fulfilled, partial, failed, inconclusive, or timeout recovery.
- Failed evidence no longer zeroes a reporter bond without paying it out.
- Pending evidence can be recovered after seven days through `recover_unresolved_evidence`.
- Expired pledges can settle even when evidence is pending, after the evidence timeout passes.
- Active pledge accounting now uses status-aware recounting, preventing double decrement after inconclusive expired reviews.
- Validator agreement now tolerates minor score differences within the same financial settlement lane while rejecting differences that cross fulfilled, partial, or failed boundaries.

## App Changes

- The pledge detail page exposes working actions for `submit_evidence`, `review_evidence`, `recover_unresolved_evidence`, and `expire_pledge`.
- The dashboard client reads the new evidence-bond accounting fields: `total_evidence_bonded` and `evidence_bonds_paid`.

## Clarifications Added

- Partial settlement formula: `min(target_units, max(1, claimed_units * score // 100))`.
- Partial stake split: half returns to the steward, remainder redirects to the beneficiary.
- Evidence authenticity limit: Verdant Relay hashes public evidence and uses validator assessment, but does not cryptographically prove real-world off-chain artifacts are genuine.

## Verification

Passed:

```bash
genvm-lint check contracts/VerdantRelay.py --json
python -m pytest tests/direct -q
npm run verify:schema
npm run lint
npm test
npm run build
python -m pytest tests/integration/test_verdant_lifecycle_e2e.py -q -s
```

StudioNet e2e proof:

- Fulfilled, partial, failed, inconclusive, expired, and timeout recovery flows finalized.
- Separate steward, reporter, and beneficiary wallets were used.
- Triggered transfer receipts were observed for payout paths.
- Final e2e summary: `total_staked=30`, `total_evidence_bonded=5`, `evidence_bonds_paid=5`, `stake_returned=7`, `stake_redirected=13`.

## Current Deployment

- Contract: `0x6688bd877464CF5AC3a2Af94FB67962fC6106A3f`
- Deploy tx: `0x2b3500f6c6c76a73b57d033f02ea30d61cf379c097e4f0a6447101637c809d32`
- App: `https://verdant-protocole.vercel.app`
