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
| Browser accept | PASS | The designated developer `0x4a7d76b8c4668a3426d6d54ec24b41fa87b532f5` accepted browser-created Agreement 5 with `0x053ba35848ff89b6d6c116a122849d56815c58fad272a1294d695fc52f46d18b`; the receipt finalized successfully and production refreshed to `ACTIVE`. |
| Browser evaluate and finality | PASS | The same developer submitted public PR #5 with `0x97de13f15ff6f89de009f1615166d8d3b7bb779e070adc4f15f4be8d7ce0d0e3`. It finalized `MAJORITY_AGREE` / `SATISFIED`, bound commit `3d64b2b83475ed4e36d984c784406785a4dfa039`, and production refreshed to `PAYABLE`. |
| Browser payout and child finality | PASS | The developer dispatched the real 0.001 GEN reward with `0x8f72bb704ec530dd628a5cbbe621745a21df86fd218a1c5568360ee1f5bf858a`. Its transfer child `0xe3048132410be4c99209748c94f219906c1ae009c6d7ea3b9af8b82d8d58d729` finalized with `value_credited=true` to the developer wallet. The refreshed UI displayed `Reward transfer dispatched.` and `PAYOUT_DISPATCHED`. |
| Receipt normalization | PASS AFTER FIX | Live GenLayer receipts used snake_case result fields and `SUCCESS`/`ERROR` execution values. The frontend normalized both receipt shapes, was redeployed, and then showed the browser refund as dispatched rather than `FINAL STATE UNKNOWN`. |
| Mobile viewport | PASS | The live production work page was observed at `390×844`. Navigation, wallet badge, status/reward row, agreement overview, and acceptance criteria remained readable without horizontal clipping. The temporary viewport override was then reset. |
| Agreement 5 browser creation | PASS | The connected requester `0xFf203Bb65942F50CB81A8AF98c5F5bd9d8a79b54` signed the production create action for developer `0x4a7d76b8c4668a3426d6d54ec24b41fa87b532f5` with `0xc1501f3b5fbab25a6c9bad26bf3a8b400572522003bc969711db5fd79c6c9986`. |

## Limitation

No wallet behavior is simulated. Browser create, cancellation, refund, finality, child-transfer evidence, refresh recovery, mobile layout, real account switching, wrong-network recovery, developer acceptance, evaluation, and settlement are all observed against production.

## Agreement 5 public evidence

Agreement `5` was browser-created by requester `0xFf203Bb65942F50CB81A8AF98c5F5bd9d8a79b54` for developer `0x4a7d76b8c4668a3426d6d54ec24b41fa87b532f5`, with reward `0.001 GEN` and public CI not required.

- Public evidence PR: [#5](https://github.com/Bibidee/patchbound/pull/5); bound head SHA `3d64b2b83475ed4e36d984c784406785a4dfa039`.
- Required marker: `PATCHBOUND / agreement 5 / developer 0x4a7d76b8c4668a3426d6d54ec24b41fa87b532f5`.
- Create: `0xc1501f3b5fbab25a6c9bad26bf3a8b400572522003bc969711db5fd79c6c9986` (`FINALIZED`).
- Accept: `0x053ba35848ff89b6d6c116a122849d56815c58fad272a1294d695fc52f46d18b` (`FINALIZED`).
- Evaluate: `0x97de13f15ff6f89de009f1615166d8d3b7bb779e070adc4f15f4be8d7ce0d0e3` (`FINALIZED`, `MAJORITY_AGREE`, `SATISFIED`).
- Payout dispatch: `0x8f72bb704ec530dd628a5cbbe621745a21df86fd218a1c5568360ee1f5bf858a` (`FINALIZED`).
- Transfer child: `0xe3048132410be4c99209748c94f219906c1ae009c6d7ea3b9af8b82d8d58d729` (`FINALIZED`, `value_credited=true`).
