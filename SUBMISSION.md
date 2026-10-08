# Verdant Relay -- Submission Notes

Verdant Relay is proof-backed accountability for environmental commitments. A steward stakes GEN behind a measurable sustainability pledge, submits public evidence, and lets GenLayer validators score fulfillment into fulfilled, partial, failed, or inconclusive lanes.

## Submission Parameters

- Project name: `Verdant Relay`
- Category/tag: `Governance`, `DeFi`, or `Other`
- Live app: `https://verdant-auras-projects-2f862c53.vercel.app`
- GitHub repository: `https://github.com/Hilda26/verdant`
- Network: `GenLayer StudioNet`
- Contract address: `0x27101Dd16615F6D78D112F897369cEA6190b7FD9`
- Deployment tx: `0xed39da562dc7194762f15a4f28fc5c1ccbccadeded0de176f012e35dc38bf72c`
- One-liner: `Verdant Relay turns environmental promises into staked, evidence-scored commitments on GenLayer.`
- Access note: Vercel deployment protection is disabled; reviewers can open the app directly.

## Highlights

1. **Staked impact pledges.** Every commitment names a metric, target units, deadline, beneficiary, and stake.
2. **Evidence packets.** Public evidence is fetched, hashed, excerpted, and stored before review.
3. **Scored outcomes.** Validators return a 0-100 score and one of four lanes: fulfilled, partial, failed, or inconclusive.
4. **Accountability payouts.** Fulfilled pledges return stake, partial pledges split stake, and failed pledges redirect stake to the beneficiary.
5. **No fake fallback data.** Empty contract reads show an empty relay board.

## Main Contract Methods

```text
open_pledge
submit_evidence
review_evidence
expire_pledge
get_relay
list_pledges
list_evidence
get_pledge
get_evidence
```

## Verification Commands

```bash
npm run verify:schema
npm run lint
npm test
npm run build
python -m pytest tests/direct -q
```
