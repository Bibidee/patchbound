# Production browser evidence

This file records only observations made through Computer Use against the live production URL. Direct GenLayerJS transactions, local tests, and static inspection are not browser evidence.

## Test context

- Date: 2026-10-01.
- Method: COMPUTER USE in Brave Browser.
- Production URL: `https://patchbound.vercel.app/`.
- Network shown by the production UI: GenLayer Studionet, chain `61999`.
- Injected wallet: available.
- Wallet software: Brave-injected EIP-1193 provider; the UI exposed account `0x4a7d76b8c4668a3426d6d54ec24b41fa87b532f5`.

## Observed results

| Check | Result | Observation |
| --- | --- | --- |
| Production home loads | PASS | Home rendered with the PATCHBOUND navigation, Studionet/61999 badge, work desk, and disconnected wallet state. |
| Connect-wallet control | PASS | After the app-level disconnect, clicking the production control reconnected the Brave-injected account and returned the UI to `STUDIONET`. |
| Disconnected state | PASS | The app-level Disconnect action returned the UI to `Connect wallet` and the safe disconnected work-desk state. |
| `/work/1` direct navigation | PASS | The production route loaded canonical agreement 1 after the page settled. |
| Refresh recovery | PASS | After navigation/reload observation, agreement 1 showed `SATISFIED`, `PAYOUT_DISPATCHED`, PR #3, and bound head SHA `558256931c66d85cae9a3dcf3d26095d1c85d4ab`. |
| Wallet connection/signature | PARTIAL | Genuine EIP-1193 connection and account display were observed. A financial signature was not requested in this pass. |
| Account changes/disconnect | PARTIAL | App-level disconnect/reconnect was observed. A second-account `accountsChanged` event was not induced in Brave. |
| Wrong-network detection/switch | NOT TESTED | The Brave wallet was already on Studionet 61999; no safe wrong-network transition was induced. |
| Create/accept/evaluate/settle/claim/refund writes | PENDING CONFIRMATION | The injected wallet is available, but each real funded write requires action-time confirmation before the wallet signature. |
| Finality and transfer-child observation | NOT TESTED in browser | Verified with live direct transaction receipts, not through a browser wallet session. |
| Mobile viewport | NOT TESTED in this Computer Use session | Prior local narrow-width checks covered 1440, 1024, 768, and 390px; that is not a production wallet-browser pass. |

## Limitation

The wallet availability blocker is cleared in Brave, but real transaction rows remain pending action-time confirmation for each funded signature. No wallet behavior is simulated. The wrong-network branch also remains unobserved because the available wallet was already configured for Studionet chain `61999`.
