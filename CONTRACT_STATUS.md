# Verdant Relay Contract Status

## Implemented

- `contracts/VerdantRelay.py` defines the `VerdantRelay` GenLayer contract.
- Stewards can open staked environmental pledges through `open_pledge`.
- Reporters can submit public evidence packets through `submit_evidence`.
- Validators review evidence with `review_evidence`, returning fulfilled, partial, failed, or inconclusive lanes.
- Pending evidence can be recovered after a seven-day timeout through `recover_unresolved_evidence`.
- The contract records source and evidence hashes, verified units, review scores, payout direction, evidence-bond totals, and relay-level totals.
- Partial settlement is explicit: verified units are `min(target_units, max(1, claimed_units * score // 100))`, and steward stake is split 50/50 between steward return and beneficiary redirect.
- Evidence authenticity is limited to fetched excerpts, hashes, and validator assessment; Verdant Relay does not cryptographically prove real-world off-chain artifacts are genuine.
- Frontend reads are proxied through `/api/verdant/read` to avoid browser-side RPC/CORS failures.

## Local Verification

Expected commands:

```bash
npm run verify:schema
npm run lint
npm test
npm run build
python -m pytest tests/direct -q
python -m pytest tests/integration -q -s
```

## Deployment

Deployed on GenLayer StudioNet:

```text
Contract: 0x6688bd877464CF5AC3a2Af94FB67962fC6106A3f
Tx: 0x2b3500f6c6c76a73b57d033f02ea30d61cf379c097e4f0a6447101637c809d32
Vercel: https://verdant-protocole.vercel.app
```

Redeploy with:

```bash
python scripts/deploy-verdant.py
python -m pytest tests/integration/test_verdant_deploy.py -q -s
```
