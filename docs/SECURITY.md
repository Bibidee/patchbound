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
- claim accounting remains reserved until the recipient confirms the asynchronous transfer child.

## External evidence

GitHub is an external authority and can be unavailable, rate-limited or inconsistent. The safe response is `INCONCLUSIVE` when reliable evidence cannot be obtained. Consensus compares outcome, head/base SHA, CI state and evidence digest; the free-form explanation is informational and not consensus-critical. Consensus decentralizes interpretation of the evidence; it does not decentralize GitHub itself.
