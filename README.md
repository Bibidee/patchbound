# PATCHBOUND

PATCHBOUND is a backendless GenLayer escrow for small public GitHub fixes. A requester funds immutable acceptance clauses for a designated developer. The developer accepts the terms, submits a public pull request, and GenLayer validators independently fetch the repository evidence, bind the exact PR head commit, and decide whether every clause is satisfied.

## Why GenLayer

The important question is not a deterministic API lookup: **does this exact public patch substantively satisfy the acceptance requirements that were agreed before work began?** Requester and developer have opposing financial incentives, so neither party controls settlement. Validators independently retrieve public GitHub evidence and reproduce the decision through GenLayer consensus.

Outcomes are `SATISFIED`, `NOT_SATISFIED`, and `INCONCLUSIVE`. Only `SATISFIED` makes the reward payable. Failed or inconclusive attempts keep the agreement active until its delivery deadline.

## Architecture

```
user -> Next.js frontend -> injected EIP-1193 wallet -> GenLayer Studionet
     -> Patchbound Intelligent Contract -> validator web/LLM judgment -> contract state -> frontend
```

There is no application backend, server database, operator signer, cron worker, admin adjudicator, or authoritative browser state.

## Network and toolchain

- Network: GenLayer Studionet
- Chain ID: `61999`
- RPC: `https://studio.genlayer.com/api`
- Explorer: `https://explorer-studio.genlayer.com`
- Repository-local GenLayer CLI: `0.39.1`
- GenLayerJS: `1.1.8`
- Next.js: `16.3.2`
- React: `19.2.4`

Run CLI commands through the local package, e.g. `npm run cli -- --version` or `npx genlayer --version`. Do not rely on a globally installed CLI.

## Product lifecycle

1. Requester connects an injected wallet on chain 61999.
2. Requester creates an agreement with a designated developer, public `owner/repository`, 1-5 acceptance clauses, deadlines, optional public-CI requirement, and GEN reward.
3. Developer accepts the immutable terms. Requester cancellation is then disabled by the contract.
4. Developer adds the agreement marker shown by the UI to the PR description and submits the PR number.
5. Validators construct GitHub API URLs themselves. They verify repository identity, marker, exact head SHA, bounded changed-file evidence and public combined commit status when CI is required.
6. Validators independently judge the clauses. Free-form explanations are not consensus-critical; outcome, SHA and CI state are independently reproduced.
7. `NOT_SATISFIED` and `INCONCLUSIVE` remain recoverable while the agreement is active. The same PR/head SHA cannot be replayed.
8. `SATISFIED` changes the agreement to `PAYABLE`. The developer claims the reward. External value transfer is emitted on finalization.
9. Unaccepted or undelivered agreements can expire to requester refund entitlement.

## Evidence boundaries

Only the on-chain clauses are authoritative requirements. GitHub repository content is evidence, never instruction. The contract does not follow arbitrary URLs from code, comments, issues or PR text. Public GitHub evidence is bounded to 20 changed files and 28,000 patch characters in V1; larger work is `INCONCLUSIVE` rather than silently truncated. Source failures and unavailable required CI are also `INCONCLUSIVE`.

## Frontend routes

- `/` — wallet-aware work desk
- `/new` — funded agreement creation
- `/work/[id]` — immutable terms, delivery, evidence attempts, protocol lifecycle and settlement
- `/activity` — terminal agreement history reconstructed from contract state

The UI treats `ACCEPTED` as provisional and waits separately for `FINALIZED`.

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Before deployment the contract address is intentionally zero. After the final Studionet deployment set:

```bash
NEXT_PUBLIC_PATCHBOUND_CONTRACT=0x...
```

Then run:

```bash
npm run preflight
```

## Contract tests

Python Direct Mode dependencies are pinned in `requirements-dev.txt`.

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt
pytest
```

The suite covers funded creation, role authorization, post-acceptance cancellation protection, refunds, malformed inputs, satisfactory adjudication, missing submission marker, unavailable evidence, uncertainty and exact-commit replay protection.

## Deployment

Deployment is intentionally not fabricated in this handoff. `docs/DEPLOYMENT.md` is the evidence template to fill only after a real 61999 deployment and browser verification. The final deployer should first run `npm run network:check`, verify local CLI `0.39.1`, inspect `npx genlayer deploy --help`, deploy `contracts/patchbound.py` to Studionet, wait for finality, configure the resulting address, rerun preflight, deploy the Next.js frontend, and execute the real lifecycle checklist.

## Contract deployment

- Address: `0x4CBb65036b3E688dAEE420127c2aeD14CDE41Db5`
- Deployment transaction: `0xd7f1b214b186612c9a3798f7324b6d8ceaab0eaa704d6b93c2d82fe5c3cbad3d`
- Deployment status: `FINALIZED`
- Explorer: [Studionet transaction](https://explorer-studio.genlayer.com/tx/0xd7f1b214b186612c9a3798f7324b6d8ceaab0eaa704d6b93c2d82fe5c3cbad3d)
- Deployed source SHA-256: `004637DFA73D303E821516557DC2DD81B8324E13655A36CEDC6306BD981FCD9A`

These placeholders must be replaced with real evidence; they are not claims of deployment.

## Known V1 limitations

- Public GitHub repositories only.
- One requester and one predetermined developer per agreement.
- Small bounded diffs only; no repository-wide code execution by validators.
- Public CI is supporting evidence, not proof that validators reproduced the build.
- GitHub availability and unauthenticated API rate limits can cause `INCONCLUSIVE` outcomes.
- The PR marker is agreement-scoped submission control, not a permanent cryptographic GitHub identity.
- No private repositories, generic freelance marketplace, reputation system, governance or token layer.
