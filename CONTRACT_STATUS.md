# Verdant Relay Contract Status

## Implemented

- `contracts/VerdantRelay.py` defines the `VerdantRelay` GenLayer contract.
- Stewards can open staked environmental pledges through `open_pledge`.
- Reporters can submit public evidence packets through `submit_evidence`.
- Validators review evidence with `review_evidence`, returning fulfilled, partial, failed, or inconclusive lanes.
- The contract records source and evidence hashes, verified units, review scores, payout direction, and relay-level totals.
- Frontend reads are proxied through `/api/verdant/read` to avoid browser-side RPC/CORS failures.

## Local Verification

Expected commands:

```bash
npm run verify:schema
npm run lint
npm test
npm run build
python -m pytest tests/direct -q
```

## Deployment

Deployed on GenLayer StudioNet:

```text
Contract: 0x27101Dd16615F6D78D112F897369cEA6190b7FD9
Tx: 0xed39da562dc7194762f15a4f28fc5c1ccbccadeded0de176f012e35dc38bf72c
Vercel: https://project-12-kohl-omega.vercel.app
```

Redeploy with:

```bash
python scripts/deploy-verdant.py
python -m pytest tests/integration/test_verdant_deploy.py -q -s
```
