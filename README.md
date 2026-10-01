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
- Next.js: `16.3.8`
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
8. `SATISFIED` changes the agreement to `PAYABLE`. The developer dispatches the reward exactly once. The contract consumes that agreement-specific entitlement before emitting one finalized external transfer and records `PAYOUT_DISPATCHED`; the child receipt is external evidence and cannot be confirmed or retried through the contract.
9. Unaccepted or undelivered agreements can expire to requester refund entitlement.

## Evidence boundaries

Only the on-chain clauses are authoritative requirements. GitHub repository content is evidence, never instruction. The contract does not follow arbitrary URLs from code, comments, issues or PR text. Public GitHub evidence is bounded to 20 changed files and 28,000 patch characters in V1; larger work is `INCONCLUSIVE` rather than silently truncated. Source failures and unavailable required CI are also `INCONCLUSIVE`.

## Frontend routes

- `/` — wallet-aware work desk
- `/new` — funded agreement creation
- `/work/[id]` — immutable terms, delivery, evidence attempts, protocol lifecycle and settlement
- `/activity` — terminal agreement history reconstructed from contract state

The UI treats `ACCEPTED` as provisional and waits separately for `FINALIZED`. A submitted hash is persisted in browser local storage as recovery metadata only; canonical state remains on GenLayer. Finalized status is not treated as execution success unless the receipt reports `FINISHED_WITH_RETURN`.

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

The contract address must be supplied for each deployment; the frontend fails closed when it is missing:

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

The suite covers funded creation, role authorization, post-acceptance cancellation protection, refunds, malformed inputs, satisfactory adjudication, missing submission marker, unavailable evidence, uncertainty, exact-commit replay protection, settlement isolation, hostile payout attempts, and bounded-sequence invariants for reward conservation and terminality. The current Direct Mode run has 37 passing tests.

## Deployment

Deployment evidence is recorded in `docs/DEPLOYMENT.md`. The historical deployments are retained for provenance only; production now points to the finalized hardened contract `0xF9C533e541d04bfcaac45A4cEc008154E9ed7471` on Studionet.

The current production contract address is configured through `NEXT_PUBLIC_PATCHBOUND_CONTRACT`. The machine-verifiable release record is [`release-manifest.json`](release-manifest.json), checked by `npm run release:verify`. Real user lifecycle evidence remains separate from deployment evidence and is recorded only after genuine wallet-signed transactions. Production Brave evidence now includes real requester-side creation, cancellation, refund dispatch, child finality, and refresh recovery; the remaining browser gaps are wrong-network switching, a second-account developer flow, and a production mobile viewport.

## Known V1 limitations

- Public GitHub repositories only.
- One requester and one predetermined developer per agreement.
- Small bounded diffs only; no repository-wide code execution by validators.
- GitHub combined commit status is supporting evidence, not proof that validators reproduced the build.
- GitHub availability and unauthenticated API rate limits can cause `INCONCLUSIVE` outcomes.
- The PR marker is agreement-scoped submission control, not a permanent cryptographic GitHub identity.
- External transfer children are asynchronous. The contract cannot inspect the later child receipt and therefore emits at most one transfer per agreement entitlement, records `PAYOUT_DISPATCHED` or `REFUND_DISPATCHED`, and does not offer a retry or user-confirmation method. A child failure is not automatically refunded by GenLayer.
- No private repositories, generic freelance marketplace, reputation system, governance or token layer.
