# Deployment and live evidence

This file records observed evidence only. Every lifecycle hash, PR, commit, and browser result below was observed during verification; no value is invented.

## Remediation status

- Status: `READY FOR RE-AUDIT`.
- Contract source changed: yes.
- Remediation contract deployment: finalized successfully on Studionet.
- Remediation frontend deployment: production redeployed and ready.
- Real lifecycle evidence: agreement 3 success and agreement 1 expiry/refund paths verified on Studionet.

## Local preflight

- [x] `npm run network:check` — Studionet-only source tree.
- [x] `npm run cli -- --version` — GenLayer CLI `0.39.1`.
- [x] `npm run typecheck`.
- [x] `npm run lint` — clean after excluding generated caches.
- [x] `npm run test` — 8 UI tests passed.
- [x] `npm run direct:test` — 25 Python Direct Mode tests passed with Python 3.13.16.
- [x] `npm run build` — production build completed successfully.
- [x] `npm run preflight` — network check, typecheck, lint, 8 UI tests, 25 Direct Mode tests, and production build all passed.
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
- Repository head at handoff: `13960c9` (`Verify finalized transfer credit`).
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
- Frontend repository commit: `13960c9`.
- Vercel deployment: `dpl_EPAKM7jQmwDu9uiDtBozaxpqe4kU` (`READY`).
- Deployment alias: `https://patchbound-84eak38he-bibidees-projects.vercel.app`.

## Real lifecycle A — satisfied and paid

- Agreement ID: `3`.
- Create transaction: `0x5539b2f4cc3dca6610bc9a02157a67579810fc3f4b049e95fa01964de838f7e6` (`FINALIZED`, majority agree).
- Accept transaction: `0x88492f2c5ff289e49e59d0a35b907ccccee72a74b42d95c27249258a821bc826` (`FINALIZED`, majority agree).
- First evaluate transaction: `0x31dbc7bdcb16594ea1fc673748c95a2791d7fa13c845514322162aef5dd11c1d` (`FINALIZED`, `INCONCLUSIVE`; marker was only in the PR description and not bounded evidence).
- Evidence correction commit: `36f822e7987035b23d587260b1319d582f682384`.
- Second evaluate transaction: `0x0b483444a7de4d0eebd6c1b10b34e31deeb02b32f9243563a9805fd6b311585a` (`FINALIZED`, `SATISFIED`, `MAJORITY_AGREE`).
- Bound PR: [#1](https://github.com/Bibidee/patchbound/pull/1).
- Bound base SHA: `ddf44fe5b1027d73f8247a2709eaca5c8cb01e95`.
- Bound head SHA: `36f822e7987035b23d587260b1319d582f682384`.
- Evidence digest: `05e04f41a0ee980983e8e6630b7ce86862c1611ed7ae093b05ca9e817d37174e`.
- Final outcome: `SATISFIED`; settlement state `PAYABLE` before claim.
- Claim transaction: `0xf96e531ec5192aa3784491be26bb6803e76c990701d245f6c7d8bd0df7ca4acb` (`FINALIZED`, majority agree).
- Transfer child transaction: `0x42a07cebf059b85152b1db3070409f992a06842a7325060eb44643c328efba2a` (`FINALIZED`, external receipt `value_credited=true`; result label `NO_MAJORITY`).
- Confirmation transaction: `0x01ac49c86d3ab79a034726df65feddaa3f313df5d1cd942293c0dde578994d3b` (`FINALIZED`, majority agree).
- Final agreement state: `PAID`; finalized `get_claimable(developer)` is `0`.

## Real lifecycle B — alternate outcome and recovery

- Agreement ID: `1`.
- Path: `ACTIVE` → delivery deadline passed → `close_expired` → requester refund.
- Close-expired transaction: `0x01e1de2a06766a5b35015e5a4c7f8592f45d4be2a01b97e57661333a28fe6e87` (`FINALIZED`, majority agree).
- Refund claim transaction: `0xc1f92ae997d676afb349f084ca56459833f474dbd1c6e83e711c72e1434eddd8` (`FINALIZED`, majority agree).
- Transfer child: `0x54970b79c5d54b96988afa61ce15340448e0a14338498869a7109a682c54a886` (`FINALIZED`, external receipt `status=success`, `value_credited=true`).
- Confirmation transaction: `0xd2866ec06804f70d5551768a03804ad44ae7d300e03483f7b53f18fd31de5d17` (`FINALIZED`, majority agree).
- Final on-chain state: `EXPIRED` / `REFUNDED`.
- Recovery status: verified; the finalized child receipt proves recipient credit before confirmation.

Additional cancellation-refund evidence is recorded for agreement `2`: create `0x9e8ddc934f91d8beb5fde6ff3862681aa9447b6788d859a031496597a9fed354`, cancel `0xe2c1aa3f9218ca3e9f34cf27fd277d70c9b8be80407fbf3be2ac8040257632f0`, claim `0xe7055c818ad49e684ab3dcb7e0db59ba639eb458d164edeb0eeb5a9cefbb8fab`, child `0xf9be4ff04e94f8ec78c4a3e07b1b33ba7f37ca787796fd1ef32dbaa67771b76a` (`value_credited=true`), and confirmation `0x239ff49f52d6432b16279848d75844cd3a2c95c47ba09a802a91063461c9b8cc`.

## Browser verification

Observed during browser verification on 2026-10-01: production `/`, `/new`, `/activity`, and `/work/1` loaded after the remediation redeploy; the Studionet/61999 badge and navigation rendered; `/work/1` no longer failed closed for a missing contract address. The Connect wallet control still correctly reports `No injected EVM wallet found. Install MetaMask or Rabby.` in this browser. The local remediation build passed exact narrow-width overflow checks at 1440, 1024, 768, and 390px. The public agreement-bound PR and live lifecycle were verified through the signed Studionet path; browser wallet write-path checks remain unavailable in this browser because no injected EIP-1193 wallet is present.

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
