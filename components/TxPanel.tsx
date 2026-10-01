"use client";

import {EXPLORER_URL} from "@/lib/constants";
import type {TxStage} from "@/lib/types";

const stages: Array<{key: Exclude<TxStage,"idle"|"failed">; label: string; detail: string}> = [
  {key: "wallet", label: "Wallet signature", detail: "Approval requested from your wallet."},
  {key: "submitted", label: "Submitted", detail: "Transaction sent to GenLayer."},
  {key: "accepted", label: "Accepted", detail: "Consensus accepted the result provisionally."},
  {key: "finalized", label: "Finalized", detail: "Canonical finality reached."},
];

export function TxPanel({stage,hash,error}: {stage: TxStage; hash?: string; error?: string}) {
  if (stage === "idle") return null;
  const current = stage === "failed" ? -1 : stages.findIndex(item => item.key === stage);
  return <section className={`tx-panel tx-stage-${stage}`} aria-live="polite">
    <div className="tx-panel-heading"><span className="eyebrow">TRANSACTION</span><span className="tx-stage-label">{stage === "failed" ? "ACTION FAILED" : stage.toUpperCase()}</span></div>
    {stage === "failed" ? <div className="tx-failure"><strong>Transaction could not complete.</strong><p>{error || "The wallet or network rejected this action."}</p></div> : <ol className="tx-steps">
      {stages.map((item,index) => {const complete = index < current;const active = index === current;return <li className={`${complete ? "complete" : ""} ${active ? "active" : ""}`} key={item.key}><span className="tx-node" aria-hidden="true">{complete ? "✓" : active ? "•" : ""}</span><div><strong>{item.label}{item.key === "accepted" && <small> · provisional</small>}</strong>{active && <p>{item.detail}</p>}</div></li>})}
    </ol>}
    {hash && <div className="tx-reference"><code>{hash}</code><a href={`${EXPLORER_URL}/tx/${hash}`} target="_blank" rel="noreferrer">Explorer ↗</a></div>}
  </section>;
}
