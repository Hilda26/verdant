# Verdant Relay Walkthrough Script

## Scene 1: Open The Relay

Open the Verdant Relay app and introduce it as a GenLayer protocol for staked environmental commitments. Point out the Oddless-inspired split red/blue poster UI, heavy borders, and live relay panel.

## Scene 2: Open A Pledge

Fill the pledge form with a title, category, region, measurable impact metric, target units, deadline, public source URL, beneficiary address, and stake.

## Scene 3: Review The Relay Board

Show the relay board and explain that pledges are empty unless the deployed contract returns real state.

## Scene 4: Submit Evidence

Explain the `submit_evidence` path: a reporter posts a public evidence URL, summary, claimed units, and an evidence bond.

## Scene 5: Score Fulfillment

Explain `review_evidence`: validators return a verdict and score. Fulfilled returns stake, partial splits stake, failed redirects stake to the beneficiary, and inconclusive reopens the pledge.

## Scene 6: Submission Proof

Show the GitHub repository, deployed contract address, deployment transaction, Vercel URL, and successful verification commands.
