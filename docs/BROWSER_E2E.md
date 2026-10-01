# Production browser evidence

This file records only observations made through Computer Use against the live production URL. Direct GenLayerJS transactions, local tests, and static inspection are not browser evidence.

## Test context

- Date: 2026-10-01.
- Method: COMPUTER USE in Brave Browser.
- Production URL: `https://patchbound.vercel.app/`.
- Network shown by the production UI: GenLayer Studionet, chain `61999`.
- Injected wallet: available.
- Wallet software: Brave-injected EIP-1193 provider; the UI exposed account `0x4a7d76b8c4668a3426d6d54ec24b41fa87b532f5`.
- Browser-created agreement 4 designated the distinct developer address `0xFf203Bb65942F50CB81A8AF98c5F5bd9d8a79b54`.

## Observed results

| Check | Result | Observation |
| --- | --- | --- |
| Production home loads | PASS | Home rendered with the PATCHBOUND navigation, Studionet/61999 badge, work desk, and disconnected wallet state. |
| Connect-wallet control | PASS | After the app-level disconnect, clicking the production control reconnected the Brave-injected account and returned the UI to `STUDIONET`. |
| Disconnected state | PASS | The app-level Disconnect action returned the UI to `Connect wallet` and the safe disconnected work-desk state. |
| `/work/1` direct navigation | PASS | The production route loaded canonical agreement 1 after the page settled. |
| Refresh recovery | PASS | After navigation/reload observation, agreement 4 showed canonical `CANCELLED` / `REFUND_DISPATCHED`, dispatched amount `0.001 GEN`, and requester claimable balance `0`; agreement 1 also showed `SATISFIED` / `PAYOUT_DISPATCHED`. |
| Wallet connection/signature | PASS | The Brave-injected wallet connected and produced the genuine Agreement 4 create, cancel, and refund signatures below. |
| Account changes/disconnect | PASS | After app-level disconnect/reconnect, Rabby was switched from requester `0x4a7d76b8c4668a3426d6d54ec24b41fa87b532f5` to developer `0xFf203Bb65942F50CB81A8AF98c5F5bd9d8a79b54`; production updated to `DEVELOPER VIEW` and displayed the active address. |
| Wrong-network detection/switch | PASS | On chain `84532`, production displayed `NETWORK CHANGE REQUIRED`, blocked writes, and exposed `Switch to Studionet`. The control restored GenLayer Studionet `61999` and displayed the developer wallet. |
| Browser create | PASS | Agreement 4 was created from `/new` with transaction `0x723b64c59ce7463042b19d8d3f0f3d2a026a4a13c887945c0282f41ea1ce68b5`; an independent receipt read showed `FINALIZED`, `MAJORITY_AGREE`, and leader execution `SUCCESS`. |
| Browser cancel | PASS | The requester cancelled Agreement 4 from the production work page with transaction `0xb08a7c6eb3391622a326972e5ac1fe8362c79362553f8d2b289744ca88aeb8d9`; the finalized canonical state became `CANCELLED` / `REFUNDABLE`. |
| Browser refund and child finality | PASS | The production refund action produced `0x097fe749097aeaa33e47f8764cf8823f848fc5fcb10870e4c2710427951bad73`; its child `0x6d1d6aa9fcfebcfe8367459e8285d060afd7f529cb6c6d7a06c2a0edee02d5b8` finalized with `value_credited=true`. The refreshed UI displayed `Refund transfer dispatched.` and `REFUND_DISPATCHED`. |
| Browser accept/evaluate/payout | PENDING | Agreement 5 is now browser-created and its designated developer wallet is active in Brave. Developer signatures have not yet been requested. The same lifecycle is independently proven with direct signed transactions for Agreement 3. |
| Receipt normalization | PASS AFTER FIX | Live GenLayer receipts used snake_case result fields and `SUCCESS`/`ERROR` execution values. The frontend normalized both receipt shapes, was redeployed, and then showed the browser refund as dispatched rather than `FINAL STATE UNKNOWN`. |
| Mobile viewport | PASS | The live production work page was observed at `390×844`. Navigation, wallet badge, status/reward row, agreement overview, and acceptance criteria remained readable without horizontal clipping. The temporary viewport override was then reset. |
| Agreement 5 browser creation | PASS | The connected requester `0xFf203Bb65942F50CB81A8AF98c5F5bd9d8a79b54` signed the production create action for developer `0x4a7d76b8c4668a3426d6d54ec24b41fa87b532f5`. The UI displayed accepted/provisional transaction `0xc1501f3b5fbab25a6c9bad26bf3a8b400572522003bc969711db5fd79c6c9986`. |

## Limitation

No wallet behavior is simulated. Browser create, cancellation, refund, finality, child-transfer evidence, refresh recovery, mobile layout, a real account change, and wrong-network switching are now observed. Agreement 5 is ready for the remaining developer-side accept, evaluate, and payout actions.

## Agreement 5 public evidence

This public PR is the evidence artifact for browser-created Agreement `5`. It targets `Bibidee/patchbound` and contains the required marker:

`PATCHBOUND / agreement 5 / developer 0x4a7d76b8c4668a3426d6d54ec24b41fa87b532f5`

Agreement `5` requires a public PR with a non-empty head commit, this marker, and an update to this document. Public CI is explicitly not required for this agreement.
