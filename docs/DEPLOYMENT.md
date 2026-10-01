# Deployment and live evidence

This file records observed evidence only. Blank lifecycle fields are intentional; no transaction hash, PR, commit, or browser result is invented.

## Remediation status

- Status: `READY FOR LIVE LIFECYCLE EVIDENCE`.
- Contract source changed: yes.
- Remediation contract deployment: finalized successfully on Studionet.
- Remediation frontend deployment: production redeployed and ready.
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
- [x] Public CI for the remediation source passed on both branches: [main run](https://github.com/Bibidee/patchbound/actions/runs/36860207639) and [master run](https://github.com/Bibidee/patchbound/actions/runs/36860208351).
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
- Repository head at handoff: `fcd4d7bfac62769730c4ef150cdb9881fb126bd8`.
- Address: `0xb1651987F8854ad446E1F2A845b59d1c470234A7`.
- Deployment transaction: `0xfcdb885c37545c78e2179578524105bb62081f49c5a44070f2d552b37d2a90e3`.
- Finalized status and execution result: `FINALIZED` / successful execution.
- Explorer: https://explorer-studio.genlayer.com/tx/0xfcdb885c37545c78e2179578524105bb62081f49c5a44070f2d552b37d2a90e3
- Deploying account: `signalbond-challenger-unlocked` (`0x865e118a3be4fa0760775565fcd31be156e1e3d7`).

## Historical frontend deployment

- Production URL: `https://patchbound.vercel.app`
- Historical configured contract: `0x4CBb65036b3E688dAEE420127c2aeD14CDE41Db5`
- Historical deployment commit: `fa4fa8bedaad4060f836296484f80ebde8c4a307`
- Historical Vercel deployment: `dpl_5z7WAm9ZDw2WMwzW3y9G8do4jjqT` (`READY`)

## Remediation frontend deployment

- Production URL: `https://patchbound.vercel.app`
- Configured remediation contract: `0xb1651987F8854ad446E1F2A845b59d1c470234A7`.
- Vercel deployment: `dpl_Bq4xD6jcY8ReyHomuAgTq1bs3Kvu` (`READY`).
- Deployment alias: `https://patchbound-5ut17p4nn-bibidees-projects.vercel.app`.

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

Observed during browser verification on 2026-10-01: production `/`, `/new`, `/activity`, and `/work/1` loaded after the remediation redeploy; the Studionet/61999 badge and navigation rendered; `/work/1` no longer failed closed for a missing contract address. The Connect wallet control still correctly reports `No injected EVM wallet found. Install MetaMask or Rabby.` in this browser. The local remediation build passed exact narrow-width overflow checks at 1440, 1024, 768, and 390px. No usable public agreement-bound PR or injected wallet was available for genuine lifecycle execution.

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
- [x] explorer links point to real 61999 objects
- [x] narrow/mobile layout verified for overflow
