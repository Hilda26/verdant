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

## Deployed Contract StudioNet Proof

The latest deployed contract at `0x6688bd877464CF5AC3a2Af94FB67962fC6106A3f` was tested directly on StudioNet with separate steward, reporter, and beneficiary wallets. The test finalized every essential frontend write method: `open_pledge`, `submit_evidence`, `review_evidence`, `expire_pledge`, and `recover_unresolved_evidence`.

Deployed-contract transaction proof:

```text
FULFILLED
open_pledge:      0x65f6d27e98b7fe66635e9a9b46ef219447924f71245acc0c1281984686949c88
submit_evidence:  0x3d048509adf7cd22994814e1bfd9c29cb922d4984b75e3e8f874a9f2a81b96c5
review_evidence:  0x20ef97716dc7ba59b6fcacb9c962ada88034955810184be4fec9c00f6bb38456
transfers:        0x5387e6ca50a33a02664d5699157bafb65e24ae62c5dbe68ce5645adb7c771687, 0x378be785f1aa661c5f152ba873e1324975e1e635ed25821d81ef22822a967c5f

PARTIAL
open_pledge:      0x10fd491737bc4d0fdcbc04cc159462b4ff218cecb4f0a101411580764785cbae
submit_evidence:  0x3cd7866dd543b0b33d5a63fcd01c923b71e9c307b049c178534a4342e89c094c
review_evidence:  0xde77d695f75b81492aa9404fbf9ecadf7d01e6f1479f2d5c67d2a064f9b453bd
transfers:        0x5c631b25e059ed2a3c2bfcaef8ada63db5f2405eac80955de46e77180c3036bd, 0xfe3206c08918152db6f003bf69985736133f4dcbdc3217c33386bae3683f0eec, 0xfd74d7014fdfb39ee3a05242bad8f53e781e445814b34d978ea7bff5b5a5d21f

FAILED
open_pledge:      0x47d935ba2115cfee95c6d761b7c5cc49a6ce692dfaeba4bffbd401687baa449d
submit_evidence:  0x71f789701379c17a7b3432238751a2c7e4b3ae53dc4ef5ac27b27deea7e0d7c9
review_evidence:  0xe40c42f65e657df239637e0c4fa9b3d8842581a6ea8e27b4b0bd369b0ef01624
transfers:        0x005f4d13bb2ca0a4f3b46701cbb867bcc00aa0066d7ca4b58e8ccb6344a4974e, 0xde3edfb8bd73e57ef178e351d45d1422038e1a011808cf8beeda6a0685644e62

INCONCLUSIVE
open_pledge:      0xb39c8fd41e98c83216b4668bde6a373a2484a1ca299e79422192f975ad23e543
submit_evidence:  0xbd2446ebead380819001538b4568a0712a44b2fc621b9458c55a0f4a643dc77c
review_evidence:  0xbe82578433afe67ebf3ef9ccff646a64236e3b3e5d45d6c8ce249d6ddf58be58
transfer:         0x76e7cc8095f6eb93aa3e82f0166254fdff4d7663c6ff0b0dd2b35f07ed7fff1a

EXPIRED
open_pledge:      0xab7c1ca9cb3b63db9e56c21e4259feec9d11e1a62cf3ed6ad9475d0a39dd1afd
expire_pledge:    0x82af380e9306a47d147bcb373acf378bc30bde2521471e2b2ce2a26416d0d39d
transfer:         0x3aa664fa05b34faae34647f7076336e7e7006bee6025deeb3da8a69119a65eaf

TIMEOUT RECOVERY
open_pledge:                  0x2de9a6bcac14f0833493ad81b1433ab55c5f470c1ffcdba0b7c9d50a3d31fc4c
submit_evidence:              0x72e85a1d4695647d2566498523721e7d72e2880b7a0d92de0b43012a9f5ac63a
recover_unresolved_evidence:  0xc7f329d8d7b98b333ea043d52e9debce2b865d00acb2e56c31b29d33c9e633ba
transfer:                     0x6beb5387df6ebc7620af137232f1abc633734827fdb2ce811e96ffde3d1d5e35
```

The deployed-contract e2e test asserted:

- Reporter bonds returned to the original reporter for fulfilled, partial, failed, inconclusive, and timeout recovery.
- Steward stake returned on fulfilled outcomes.
- Partial settlement returned half of the stake to the steward and redirected the remainder to the beneficiary.
- Failed and expired stakes redirected to the beneficiary.
- Every tested evidence bond was cleared to `0` after resolution.
- Counters increased consistently: `total_staked +30`, `total_evidence_bonded +5`, `evidence_bonds_paid +5`.
- Final deployed-contract summary after the proof run: `total_staked=30`, `total_evidence_bonded=5`, `evidence_bonds_paid=5`, `stake_returned=7`, `stake_redirected=13`, `active_pledges=2`.

Deployed source and schema were verified:

```text
genlayer code 0x6688bd877464CF5AC3a2Af94FB67962fC6106A3f
DEPLOYED_SOURCE_MATCH=true

genlayer schema 0x6688bd877464CF5AC3a2Af94FB67962fC6106A3f
write methods present: open_pledge, submit_evidence, review_evidence, expire_pledge, recover_unresolved_evidence
```

## Current Deployment

- Contract: `0x6688bd877464CF5AC3a2Af94FB67962fC6106A3f`
- Deploy tx: `0x2b3500f6c6c76a73b57d033f02ea30d61cf379c097e4f0a6447101637c809d32`
- App: `https://verdant-protocole.vercel.app`
