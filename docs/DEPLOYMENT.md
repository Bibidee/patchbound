# Deployment and live evidence

Do not fill this file from assumptions. Record only transactions and browser behaviour actually observed.

## Preflight

- [ ] `npm run network:check`
- [ ] `npx genlayer --version` reports `0.39.1`
- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm run test`
- [ ] `npm run build`
- [ ] Direct Mode suite passes
- [ ] repository search finds no forbidden network configuration
- [ ] no secrets or private keys are tracked

## Contract deployment

- Network: Studionet
- Chain ID: 61999
- RPC: https://studio.genlayer.com/api
- Contract: Patchbound
- Address: `0x4CBb65036b3E688dAEE420127c2aeD14CDE41Db5`
- Deployment transaction: `0xd7f1b214b186612c9a3798f7324b6d8ceaab0eaa704d6b93c2d82fe5c3cbad3d`
- Deployment status: `FINALIZED`
- Explorer: https://explorer-studio.genlayer.com/tx/0xd7f1b214b186612c9a3798f7324b6d8ceaab0eaa704d6b93c2d82fe5c3cbad3d
- Contract source SHA-256: `004637DFA73D303E821516557DC2DD81B8324E13655A36CEDC6306BD981FCD9A`
- Git commit: unavailable; supplied handoff and GitHub repository do not contain a commit history.

## Frontend

- Production URL:
- Configured contract address:
- Deployment commit:

## Real lifecycle A — satisfied and paid

- Agreement ID:
- Create transaction:
- Accept transaction:
- Evaluate transaction:
- Bound PR:
- Bound head SHA:
- Final outcome:
- Claim transaction:
- Final agreement state:

## Real lifecycle B — alternate outcome

Use a real `NOT_SATISFIED` or `INCONCLUSIVE` attempt where practical.

- Agreement ID:
- Transaction:
- PR / SHA:
- Outcome:
- Reason:
- Recovery action:

## Browser verification

Desktop and narrow/mobile widths:

- [ ] application loads without critical errors
- [ ] connect works with injected EIP-1193 wallet
- [ ] disconnect works
- [ ] account changes update UI
- [ ] wrong network is detected
- [ ] switching targets 61999
- [ ] write reaches wallet
- [ ] submitted state is shown
- [ ] accepted state is labelled provisional
- [ ] finalized state is distinct
- [ ] contract state survives refresh
- [ ] failed/inconclusive attempt is understandable
- [ ] explorer links point to real 61999 objects
