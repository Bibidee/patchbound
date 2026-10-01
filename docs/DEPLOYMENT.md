# Deployment and live evidence

This file records observed evidence only. Blank lifecycle fields are intentional; no transaction hash, PR, commit, or browser result is invented.

## Remediation status

- Status: `READY FOR LIVE LIFECYCLE EVIDENCE` only after the corrected contract is deployed and the frontend is repointed.
- Contract source changed: yes.
- Remediation contract deployment: pending signer unlock; no new address or deployment transaction is recorded.
- Remediation frontend deployment: pending the new contract address.
- Real lifecycle evidence: not executed; a developer wallet, funded accounts, and a public agreement-bound GitHub PR are required.

## Local preflight

- [x] `npm run network:check` — Studionet-only source tree.
- [x] `npm run cli -- --version` — GenLayer CLI `0.39.1`.
- [x] `npm run typecheck`.
- [x] `npm run lint` — clean after excluding generated caches.
- [x] `npm run test` — 7 UI tests passed.
- [x] `npm run direct:test` — 25 Python Direct Mode tests passed with Python 3.13.16.
- [x] `npm run build` — production build completed successfully.
- [x] `npm run preflight` — network check, typecheck, lint, 7 UI tests, 25 Direct Mode tests, and production build all passed.
- [x] `npm audit --omit=dev --audit-level=high` — no production high/critical advisories after the dependency update.
- [ ] Full dependency audit is not entirely zero: 5 moderate dev-only transitive findings remain in the GenLayer CLI/Vitest/Dockerode toolchain; forcing Vitest 4 would be a breaking change.
- [x] Public CI for `866f5524f29f5afcea16b12c1b7067384e0b790f` passed on both branches: [main run](https://github.com/Bibidee/patchbound/actions/runs/36859292182) and [master run](https://github.com/Bibidee/patchbound/actions/runs/36859292631).
- [x] repository search finds no forbidden network configuration.
- [x] no secrets or private keys are tracked.

## Network

- Network: Studionet
- Chain ID: `61999`
- RPC: `https://studio.genlayer.com/api`
- Explorer: `https://explorer-studio.genlayer.com`

## Historical contract deployment

The following records belong to the prior deployed source revision and are retained for provenance. They are not the remediation deployment:

- Address: `0x4CBb65036b3E688dAEE420127c2aeD14CDE41Db5`
- Deployment transaction: `0xd7f1b214b186612c9a3798f7324b6d8ceaab0eaa704d6b93c2d82fe5c3cbad3d`
- Status: `FINALIZED`
- Explorer: https://explorer-studio.genlayer.com/tx/0xd7f1b214b186612c9a3798f7324b6d8ceaab0eaa704d6b93c2d82fe5c3cbad3d
- Source SHA-256: `004637DFA73D303E821516557DC2DD81B8324E13655A36CEDC6306BD981FCD9A`
- Source commit: `288f4b1989dcbe552fb238203e80b5a6b9e9316b`

## Remediation contract deployment

- Source commit: `cd88e2633e926417ce9ddffeadc3b373c1f36cae`.
- Source SHA-256: `3E95A6310194919588C12DA17FB47A44483A1A1846C942AEEFB86989312E57EF`.
- Address: pending genuine Studionet deployment.
- Deployment transaction: pending genuine Studionet deployment.
- Finalized status and execution result: pending receipt verification.
- Explorer: pending genuine transaction.

The configured CLI account is `signalbond-challenger-unlocked` with address `0x865e118a3be4fa0760775565fcd31be156e1e3d7`; its keystore is locked, so deployment cannot proceed until the authorized keystore password is supplied locally.

## Historical frontend deployment

- Production URL: `https://patchbound.vercel.app`
- Historical configured contract: `0x4CBb65036b3E688dAEE420127c2aeD14CDE41Db5`
- Historical deployment commit: `fa4fa8bedaad4060f836296484f80ebde8c4a307`
- Historical Vercel deployment: `dpl_5z7WAm9ZDw2WMwzW3y9G8do4jjqT` (`READY`)

## Remediation frontend deployment

- Production URL: `https://patchbound.vercel.app`
- Configured remediation contract: pending new address.
- Vercel deployment: pending after contract deployment and final build.

## Real lifecycle A — satisfied and paid

- Agreement ID:
- Create transaction:
- Accept transaction:
- Evaluate transaction:
- Bound PR:
- Bound head SHA:
- Final outcome:
- Claim transaction:
- Transfer child transaction:
- Confirmation transaction:
- Final agreement state:

## Real lifecycle B — alternate outcome and recovery

- Agreement ID:
- Transaction:
- PR / SHA:
- Outcome:
- Reason:
- Recovery action:
- Recovery transaction:

## Browser verification

Observed during browser verification on 2026-10-01: production `/`, `/new`, and `/activity` loaded; the Studionet/61999 badge and navigation rendered; the Connect wallet control gave the clear message `No injected EVM wallet found. Install MetaMask or Rabby.` The local remediation build also rendered `/` and `/new` with no horizontal overflow at the available 1280px browser width. Exact mobile emulation was unavailable, and the production shell is still the historical deployment until the new contract is deployed. The production repository had no usable public agreement-bound PR during the earlier audit.

- [x] application loads without critical errors on production `/`, `/new`, and `/activity`
- [x] missing injected wallet is handled with a clear message
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
- [ ] narrow/mobile layout verified
