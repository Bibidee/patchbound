# Deployment and live evidence

This file records observed evidence only. Every lifecycle hash, PR, commit, and browser result below was observed during verification; no value is invented. Historical records are explicitly separated from the hardened deployment and are not reused as proof.

## Remediation status

- Status: `NOT READY FOR FINAL AUDIT`.
- Blocking item: real production write/finality browser evidence remains pending action-time confirmation; the Brave Computer Use session now has an injected EIP-1193 wallet on Studionet.
- Hardened contract: deployed and finalized on Studionet.
- Production frontend: redeployed and aliased to `https://patchbound.vercel.app`.
- Genuine success and expiry/refund lifecycles: verified against the hardened contract.
- Release manifest verification is implemented in [`release-manifest.json`](../release-manifest.json) and `npm run release:verify`.

## Hardened settlement architecture

The deployed revision uses one-shot settlement dispatch. A successful payout or refund claim validates the agreement-specific entitlement and role, records `PAYOUT_DISPATCHED` or `REFUND_DISPATCHED`, debits aggregate `claimable`, consumes the agreement entitlement, records `dispatched_amount`, and emits exactly one finalized external transfer.

There is no public retry and no public confirmation method. GenLayer external transfers are asynchronous child transactions, and the parent contract cannot inspect the later child receipt. The frontend may observe the child receipt, but that receipt is evidence rather than an authorization boundary. See the [official value-transfer documentation](https://docs.genlayer.com/developers/intelligent-contracts/features/value-transfers) and [official message documentation](https://docs.genlayer.com/developers/intelligent-contracts/features/messages).

## Local preflight

- [x] `npm run network:check` — Studionet-only source tree.
- [x] `npm run cli -- --version` — GenLayer CLI `0.39.1`.
- [x] `npm run typecheck`.
- [x] `npm run lint` — clean after excluding generated caches.
- [x] `npm run release:verify` — manifest, contract hash, network, deployment address, and Git provenance verified.
- [x] `npm run test` — 12 UI tests passed after wallet-boundary coverage was added.
- [x] `npm run direct:test` — 37 Python Direct Mode tests passed after bounded-sequence invariant coverage was added.
- [x] `npm run build` — production build completed successfully.
- [x] `npm run preflight` — network check, release verification, typecheck, lint, 12 UI tests, 37 Direct Mode tests, and production build all passed.
- [x] `npm audit --omit=dev --audit-level=high` — no production high/critical advisories after the dependency update.
- [ ] Full dependency audit is not entirely zero: 5 moderate dev-only transitive findings remain in the GenLayer CLI/Vitest/Dockerode toolchain; forcing Vitest 4 would be a breaking change.
- [x] Public CI for the hardened source passed on both branches: [main run](https://github.com/Bibidee/patchbound/actions/runs/36877417761) and [master run](https://github.com/Bibidee/patchbound/actions/runs/36877418062).
- [x] repository search finds no forbidden network configuration.
- [x] no secrets or private keys are tracked.

## Machine-verifiable release record

The current release record is [`release-manifest.json`](../release-manifest.json). It records the immutable deployed contract source commit and SHA-256, hardened contract address and deployment transaction, production frontend deployment, CI status context, real success/refund lifecycles, the real `ci_required=true` three-stage lifecycle, and two additional hostile live transactions. Run `npm run release:verify` to verify the local contract bytes and Git ancestry without contacting a mutable service.

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

## Hardened contract deployment

- Source commit: `d16c560d4278ee8765dabfee475607b3cb3a282c` (`Harden settlement to single emission`).
- Source SHA-256: `FBD84070CBA426AC69EA9FA6A377FB46770F4CC29ECEDC29C55C4E68DD1C29DB`.
- Address: `0xF9C533e541d04bfcaac45A4cEc008154E9ed7471`.
- Deployment transaction: [`0xce5cf9984882bb0931396f4db462afce5e1527a9d8684049f60434d1f2116a8d`](https://explorer-studio.genlayer.com/tx/0xce5cf9984882bb0931396f4db462afce5e1527a9d8684049f60434d1f2116a8d).
- Deployment status: `FINALIZED`.
- Deployment consensus: `MAJORITY_AGREE`.
- Deploying account: `signalbond-challenger-unlocked` (`0x865e118a3be4fa0760775565fcd31be156e1e3d7`).

## Historical frontend deployment

- Production URL: `https://patchbound.vercel.app`
- Historical configured contract: `0x4CBb65036b3E688dAEE420127c2aeD14CDE41Db5`
- Historical deployment commit: `fa4fa8bedaad4060f836296484f80ebde8c4a307`
- Historical Vercel deployment: `dpl_5z7WAm9ZDw2WMwzW3y9G8do4jjqT` (`READY`)

## Production frontend deployment

- Production URL: [`https://patchbound.vercel.app`](https://patchbound.vercel.app).
- Production contract environment: `0xF9C533e541d04bfcaac45A4cEc008154E9ed7471`.
- Vercel deployment: `dpl_5MZ7CKV4RfubPCqbnbHFUJeMFCLy` (`READY`).
- Deployment URL: [`https://patchbound-1ye3zda4v-bibidees-projects.vercel.app`](https://patchbound-1ye3zda4v-bibidees-projects.vercel.app).
- Inspector: [`https://vercel.com/bibidees-projects/patchbound/5MZ7CKV4RfubPCqbnbHFUJeMFCLy`](https://vercel.com/bibidees-projects/patchbound/5MZ7CKV4RfubPCqbnbHFUJeMFCLy).

## Real lifecycle A — recovery, satisfied evaluation, and payout dispatch

- Contract: `0xF9C533e541d04bfcaac45A4cEc008154E9ed7471`.
- Agreement ID: `1`; reward `10000000000000000` wei (`0.01 GEN`).
- Create: `0x6dc0ef3ab3a71ebb59c652d11134451b6b2d164a9a469b4f5a7df5b2cb2efe96` (`FINALIZED`, `MAJORITY_AGREE`).
- Accept: `0x3756a7d7032813d38f8b2f83bdeb2e2079f8395a6e849e55114d668b26625c8e` (`FINALIZED`, `MAJORITY_AGREE`).
- First evaluation: `0x695dcdbf21f5e29d0740dad3f877d55b1a1805db1a9ecdca75dd62bd37dbb4d9` (`FINALIZED`, `INCONCLUSIVE`); PR #2 was documentation-only and correctly did not satisfy the source clause.
- Evidence PR: [#3](https://github.com/Bibidee/patchbound/pull/3).
- Bound base SHA: `d16c560d4278ee8765dabfee475607b3cb3a282c`.
- Bound head SHA: `558256931c66d85cae9a3dcf3d26095d1c85d4ab`.
- Second evaluation: `0xe0d132d3caf03df2894c5be67c7b1fda167cce2efcaac07f1001a1d44c880ce4` (`FINALIZED`, `MAJORITY_AGREE`).
- Agreement CI policy: `ci_required=false`; the recorded validator state is `NOT_REQUIRED`.
- Evidence digest: `cd2b7b12b71fb6919d45ea6eceaf487ce8abfb2d194fae9ff98215bfac30bb73`.
- Final evaluation: `SATISFIED`; settlement state `PAYABLE` before claim.
- Claim: `0x470f5371bc630ccaef6b891706388951f3391409f900dfa6f53314f052897228` (`FINALIZED`, `MAJORITY_AGREE`).
- Transfer child: `0x34611caf9444551c2d78ecde75937e232a94540bfdf3bd1bfa75fe6eb564cd65` (`FINALIZED`, `NO_MAJORITY`, `value_credited=true`).
- Final canonical state: `PAYABLE` / `PAYOUT_DISPATCHED`; `dispatched_amount=10000000000000000`; developer claimable `0`.

This proves recovery from an inconclusive evaluation without reopening or mutating agreement terms. Only the satisfied attempt became payable.

## Real lifecycle C — required CI pending, failure, success, and payout

- Contract: `0xF9C533e541d04bfcaac45A4cEc008154E9ed7471`.
- Agreement ID: `3`; reward `10000000000000000` wei (`0.01 GEN`); `ci_required=true`.
- Create: `0xf296b4a47853d64d1888c3c56e9b17749213eca97f1d30b8b2f750a941bd13a0` (`FINALIZED`).
- Accept: `0xd73fba65400b7f165d67f1271c8487e4eee149ceab77bc1fb97273fe731b7e6f` (`FINALIZED`).
- Public evidence PR: [#4](https://github.com/Bibidee/patchbound/pull/4); base SHA `860108e38072418f2d837584f0ed12a94cf2ae0f`.
- Stage A: head `1eda4f5974aeba0a129ca23d95a54f828a8a88f6`, real combined status `PENDING`, evaluation `0xb0a3530875117cd1f878a741f164deffa9a012abfcb0d326a2ed9d7f98e07c67`, outcome `INCONCLUSIVE`, digest `c6519d6581f44abb2f70040528c9d3970a29ae12cdc10423c6b6fab00299c92c`; agreement remained `ACTIVE`.
- Stage B: head `583068bf4395d3009b979ebe8cd2534ff44a04bc`, real combined status `FAILURE`, evaluation `0x998126d843e138cfe7b9cc8efb7dde4b9ec2afaca01d58b57719c5cd5d5501f0`, outcome `NOT_SATISFIED`, digest `77d73b315d591d37566d849d197d068a8f217427bbc686853e0b1fa1504e3fa8`; agreement remained `ACTIVE`.
- Stage C: head `c5a023415e55ed2338143f08869ea4e04a0cc318`, real combined status `SUCCESS`, evaluation `0x138b35400be16cbcdcd6c253f91b00d9e97bb78a55323cad898ff2f5c0513509`, outcome `SATISFIED`, digest `bb82a0de3335829586639190aceb3e74b54aa1f781f19cbc80ca4c05074eabe8`.
- Claim: `0x11bbabfc5d97f7d426d96504cef9d9a25c5885cbd7cd318b8beb086a8f0f9a82` (`FINALIZED`).
- Transfer child: `0x4acb35fa42baacb0f62adc707935ac2fa14e3211825a57d71521cce82b7e5dd8`; `value_credited=true`.
- Final canonical state: `PAYABLE` / `PAYOUT_DISPATCHED`; `dispatched_amount=10000000000000000`; developer and requester claimable balances `0`.

This is the genuine public-CI lifecycle proof. The exact combined status is published by Patchbound CI under `Patchbound CI / combined status` for the PR head SHA.

## Real lifecycle B — expiry and refund dispatch

- Contract: `0xF9C533e541d04bfcaac45A4cEc008154E9ed7471`.
- Agreement ID: `2`; reward `5000000000000000` wei (`0.005 GEN`).
- Create: `0xa1f493122860a79406220c149dd363b75d0fcbfa90305204a8bfbcfb0d2fb80d` (`FINALIZED`, `MAJORITY_AGREE`).
- No acceptance was submitted; close-expired: `0x955b2578d5add9fffb787a0db28a61ce3b11225e392eaa9b065eac450a4ff678` (`FINALIZED`, `MAJORITY_AGREE`).
- State before claim: `EXPIRED` / `REFUNDABLE`; requester claimable `5000000000000000`.
- Refund claim: `0x7ee4308d23d941bd14e50c8bc150e79ec710a725c34e2844300da4810189ca9a` (`FINALIZED`, `MAJORITY_AGREE`).
- Transfer child: `0xa3567bf25d7f2b94833565dbf682f6dea497e6f7feca2719f8c899dea5e1e2b8` (`FINALIZED`, `NO_MAJORITY`, `value_credited=true`).
- Final canonical state: `EXPIRED` / `REFUND_DISPATCHED`; `dispatched_amount=5000000000000000`; requester claimable `0`.

## Duplicate payout and confirmation attack proof

- Second `claim_funds("1")`: `0x09a1286e96fd49fbd4242ab2c35a37b446c025fd411b3e9393b266c947ce877f` (`FINALIZED`, `MAJORITY_AGREE`).
- All validators returned a rollback: `No funds from this agreement are claimable by this wallet`.
- No child transfer was triggered; canonical state remained `PAYOUT_DISPATCHED`, dispatched amount `10000000000000000`, claimable `0`.
- `confirm_transfer` and `retry_pending_transfer` are absent from the hardened contract, so neither confirmation nor retry can fabricate or duplicate settlement.

## Browser verification

Observed through Computer Use in Brave on 2026-10-01: production `/` and `/work/1` loaded; the Studionet/61999 badge and navigation rendered; the Brave-injected account `0x4a7d76b8c4668a3426d6d54ec24b41fa87b532f5` connected and displayed; app-level disconnect/reconnect worked; `/work/1` displayed canonical agreement `1` with `SATISFIED`, `PAYOUT_DISPATCHED`, PR #3, and its bound head SHA after refresh. Funded browser writes were not started without action-time confirmation. See [`docs/BROWSER_E2E.md`](BROWSER_E2E.md) for the observed-only matrix.

- [x] application loads without critical errors on production `/` and `/work/1`
- [x] missing injected wallet is handled with a clear disconnected state
- [x] connect works with injected EIP-1193 wallet
- [x] disconnect works
- [ ] account changes update UI from a real Brave `accountsChanged` event
- [ ] wrong network is detected
- [ ] switching targets 61999
- [ ] write reaches wallet
- [ ] submitted state is shown
- [ ] accepted state is labelled provisional
- [ ] finalized state is distinct
- [x] contract state survives refresh
- [ ] failed/inconclusive attempt is understandable
- [x] explorer links point to real 61999 objects
- [ ] narrow/mobile layout verified in Computer Use production browser (local narrow-width checks remain separate evidence)

## Historical deployments not used as remediation evidence

The following records belong to earlier source revisions and are retained only for provenance. They do not prove the hardened architecture:

- Older contract: `0x4CBb65036b3E688dAEE420127c2aeD14CDE41Db5`; deployment `0xd7f1b214b186612c9a3798f7324b6d8ceaab0eaa704d6b93c2d82fe5c3cbad3d`.
- Vulnerable settlement revision: `0xb1651987F8854ad446E1F2A845b59d1c470234A7`; deployment `0xfcdb885c37545c78e2179578524105bb62081f49c5a44070f2d552b37d2a90e3`.
- Historical frontend deployment: `dpl_5z7WAm9ZDw2WMwzW3y9G8do4jjqT`.
- Historical lifecycle records that mention `PAID`, `REFUNDED`, confirmation transactions, or retry behavior refer to that old architecture only and are deliberately excluded from the current proofs above.

## Remaining limitations

- GenLayer external child transfers are asynchronous. The contract cannot inspect a later child receipt, and a failed child transfer does not automatically return value to the sender. The safe policy is one emission with honest dispatch accounting; no public retry or confirmation path is exposed.
- Browser wallet write-path checks require an injected EIP-1193 wallet on the Computer Use test host. Brave now provides one, but funded writes still require action-time confirmation; the separate signed direct Studionet lifecycle verification is complete.
- Dev-only moderate dependency findings remain documented; production high/critical audit findings are clear.
