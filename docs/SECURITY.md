# Security model

PATCHBOUND has no administrator or off-chain adjudicator. The requester controls an offer only until the designated developer accepts it. After acceptance, settlement follows the contract state machine and validator consensus.

## Untrusted inputs

Repository code, patches, filenames, commit messages, issue text and pull-request prose are evidence. They are never instructions to validators. The contract constructs GitHub API endpoints from a validated `owner/name` repository identifier and numeric PR number; participants cannot supply arbitrary evidence URLs.

## Economic invariants

- reward must be funded at agreement creation;
- terms are immutable after creation;
- requester and developer must differ;
- only the designated developer can accept and submit;
- requester cannot cancel after acceptance;
- only `SATISFIED` creates developer entitlement;
- `NOT_SATISFIED` and `INCONCLUSIVE` do not move funds;
- exact `(agreement, PR, head SHA)` replay is rejected;
- evidence binds repository, PR number, head SHA, base SHA, bounded changed-file content, CI state and a canonical digest;
- the PR head and base are rechecked after file collection so a moving PR becomes `INCONCLUSIVE`;
- terminal states cannot re-enter the active lifecycle;
- withdrawal checks agreement-specific entitlement before emitting value;
- claim accounting is debited and the agreement entitlement is consumed before the single external transfer is emitted;
- `PAYOUT_DISPATCHED` and `REFUND_DISPATCHED` are honest dispatch states, not claims that the recipient's later child receipt was proven by the contract;
- there is no public retry or confirmation method, because the contract cannot independently prove that an asynchronous child failed or credited its recipient;
- aggregate `claimable` is derived from undispatched agreement entitlements and cannot authorize a second emission for an already dispatched agreement.

The deployed CI-required path was exercised against a real public PR with the exact Patchbound combined status context. A pending status produced `INCONCLUSIVE`, a failed status produced `NOT_SATISFIED`, and a successful status produced `SATISFIED`; the agreement stayed active until the successful attempt and payout.

The release record is machine-checked by `npm run release:verify`. It validates the deployed contract source bytes, immutable source commit, Studionet chain, hardened address, and Git ancestry without embedding credentials or private keys.

## External evidence

GitHub is an external authority and can be unavailable, rate-limited or inconsistent. The safe response is `INCONCLUSIVE` when reliable evidence cannot be obtained. Consensus compares outcome, head/base SHA, CI state and evidence digest; the free-form explanation is informational and not consensus-critical. Consensus decentralizes interpretation of the evidence; it does not decentralize GitHub itself.

## Settlement architecture

The historical settlement revision allowed a pending entitlement to emit another external transfer through retry and allowed a recipient assertion to mark the agreement settled. The remediation uses single-emission settlement: `claim_funds(agreement_id)` is the only value-emitting settlement method, it is agreement-specific and one-shot, and it records dispatch before emitting `on="finalized"`. The contract has no `confirm_transfer` or `retry_pending_transfer` entry point. GenLayer's external child receipt remains observable to clients through triggered transaction IDs, but it is not an authority boundary for contract accounting.
