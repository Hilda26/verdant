# Verdant Relay Review Notes

Verdant Relay is a fresh GenLayer project, not a Parvo/Paveron rename. The core mechanic is a staked environmental pledge resolved by public evidence and validator scoring.

## Built

- Added `contracts/VerdantRelay.py`.
- Added Verdant-specific typed client, read proxy, dashboard, pledge atlas, pledge detail view, and open-pledge form.
- Added direct lifecycle tests for fulfilled, partial, failed, and inconclusive reviews.
- Added schema verification, deployment script, integration deploy smoke test, and submission notes.

## Remaining Before Submission

- Deploy `contracts/VerdantRelay.py` to StudioNet.
- Set `NEXT_PUBLIC_VERDANT_RELAY_CONTRACT`.
- Push to a GitHub repo and deploy to Vercel.
- Record a walkthrough video after deployment.
