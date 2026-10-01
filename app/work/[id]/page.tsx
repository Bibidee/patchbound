"use client";

import Link from "next/link";
import {use,useCallback,useEffect,useState} from "react";
import {useWallet,onStudionet} from "@/components/WalletProvider";
import {ExecutionFailedError,SubmittedTransactionError,api,resumeTransaction,triggeredTransactions,waitForExistingTransaction,write} from "@/lib/genlayer";
import type {Agreement,Attempt,TxStage} from "@/lib/types";
import {StatusPill} from "@/components/StatusPill";
import {TxPanel} from "@/components/TxPanel";
import {LifecycleRail} from "@/components/LifecycleRail";
import {CopyCode} from "@/components/CopyCode";
import {EmptyState} from "@/components/EmptyState";
import {gen,short,when} from "@/lib/format";
import {EXPLORER_URL} from "@/lib/constants";
import {findPendingTransaction,removePendingTransaction,savePendingTransaction} from "@/lib/tx-tracking";

export default function Work({params}: {params: Promise<{id: string}>}) {
  const {id} = use(params);
  const wallet = useWallet();
  const [agreement,setAgreement] = useState<Agreement | null>(null);
  const [attempts,setAttempts] = useState<Attempt[]>([]);
  const [pr,setPr] = useState("");
  const [stage,setStage] = useState<TxStage>("idle");
  const [hash,setHash] = useState("");
  const [error,setError] = useState("");
  const [now,setNow] = useState(() => Math.floor(Date.now() / 1000));
  const load = useCallback(async () => {
    try {
      const current = await api.agreement(id);setAgreement(current);setAttempts(await api.attempts(id));
    } catch (caught) {setError(caught instanceof Error ? caught.message : String(caught));}
  }, [id]);
  useEffect(() => {void load()}, [load]);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const applyProgress = useCallback((progress: {hash:string;status:string;error?:string}, action: string, keepPending = false) => {
    setHash(progress.hash);
    setStage(progress.status === "FAILED" ? "failed" : progress.status === "TRACKING" ? "tracking" : progress.status === "UNKNOWN" ? "unknown" : progress.status.toLowerCase() as TxStage);
    if (progress.status === "SUBMITTED") savePendingTransaction({hash: progress.hash, action, agreementId: id, wallet: wallet.address, network: wallet.chainId || 0, submittedAt: Date.now(), route: `/work/${id}`});
    if ((progress.status === "FINALIZED" || progress.status === "FAILED") && !keepPending) removePendingTransaction(progress.hash);
    if (progress.error) setError(progress.error);
  }, [id,wallet.address,wallet.chainId]);
  useEffect(() => {
    if (!wallet.address) return;
    const pending = findPendingTransaction({action: "agreement-write", wallet: wallet.address, agreementId: id});
    if (!pending) return;
    setHash(pending.hash);setStage("tracking");setError("A transaction for this agreement was already submitted. Resume tracking before submitting another one.");
    void resumeTransaction(pending.hash, progress => applyProgress(progress, "agreement-write")).then(result => {
      if (result.status === "FINALIZED") removePendingTransaction(pending.hash);
    }).catch(caught => {
      if (caught instanceof ExecutionFailedError) { removePendingTransaction(pending.hash);setStage("failed");setError(caught.message); }
    });
  }, [wallet.address,id,applyProgress]);
  const waitForTransferChild = async (parentHash: string) => {
    for (let attempt = 0; attempt < 12; attempt += 1) {
      const children = await triggeredTransactions(parentHash);
      if (children.length > 0) {
        const childHash = children[0];
        setHash(childHash);setError("Transfer child transaction found. Waiting for its finalized execution result.");
        try {
          await waitForExistingTransaction(childHash, progress => applyProgress(progress, "agreement-write", true));
          return;
        } catch (caught) {
          throw new Error(caught instanceof Error ? `External transfer failed: ${caught.message}` : "External transfer failed.");
        }
      }
      await new Promise(resolve => window.setTimeout(resolve, 2000));
    }
    throw new SubmittedTransactionError(parentHash, "The claim transaction finalized, but its external transfer child is not confirmed yet.", "UNKNOWN");
  };
  const act = async (name: string,args: unknown[] = [], transfer = false) => {
    try {
      setError("");
      if (!wallet.address || !wallet.provider) throw new Error("Connect your injected wallet first.");
      if (!onStudionet(wallet.chainId)) throw new Error("Switch to Studionet 61999 first.");
      setStage("wallet");
      const out = await write(wallet.address as `0x${string}`,wallet.provider as never,name,args,0n,progress => applyProgress(progress, "agreement-write", transfer));
      if (transfer) {
        await waitForTransferChild(out.hash);
        const confirmation = await write(wallet.address as `0x${string}`,wallet.provider as never,"confirm_transfer",[id],0n,progress => applyProgress(progress, "agreement-write"));
        removePendingTransaction(out.hash);removePendingTransaction(confirmation.hash);setHash(confirmation.hash);setStage("finalized");await load();
      } else {
        removePendingTransaction(out.hash);setHash(out.hash);setStage("finalized");await load();
      }
    } catch (caught) {
      if (caught instanceof SubmittedTransactionError) {setHash(caught.hash);setStage(caught.status === "UNKNOWN" ? "unknown" : "tracking");setError(caught.message);if (transfer) await load();}
      else if (transfer && caught instanceof Error && caught.message.startsWith("External transfer failed:")) {setStage("unknown");setError(`${caught.message} The agreement remains pending; verify the child transaction before retrying.`);await load();}
      else {setStage("failed");setError(caught instanceof Error ? caught.message : String(caught));}
    }
  };
  if (!agreement && !error) return <div className="workspace-shell"><Link className="back-link" href="/">← Work desk</Link><div className="loading-card"><div className="skeleton large" /><div className="skeleton" /><div className="skeleton" /><div className="skeleton" /></div></div>;
  if (!agreement) return <div className="workspace-shell"><Link className="back-link" href="/">← Work desk</Link><EmptyState eyebrow="AGREEMENT UNAVAILABLE" title={`Agreement #${id} could not be read.`} description={error} /></div>;
  const me = wallet.address.toLowerCase();
  const requester = me === agreement.requester.toLowerCase();
  const developer = me === agreement.developer.toLowerCase();
  const marker = `PATCHBOUND / agreement ${agreement.id} / developer ${agreement.developer}`;
  const deadlinePassed = agreement.status === "OFFERED" ? now > agreement.offer_deadline : agreement.status === "ACTIVE" && now > agreement.delivery_deadline;
  return <div className="workspace-shell">
    <div className="workspace-top"><div><Link className="back-link" href="/">← Work desk</Link><span className="eyebrow">AGREEMENT #{agreement.id}</span><h1>{agreement.repo}</h1><p>Immutable terms · Public GitHub evidence · GenLayer validator judgment</p></div><div className="workspace-top-meta"><StatusPill status={agreement.status} /><div className="workspace-stat"><span>REWARD</span><strong>{gen(agreement.reward)} GEN</strong></div><div className="workspace-stat"><span>ATTEMPTS</span><strong>{agreement.attempt_count}</strong></div></div></div>
    <div className="workspace-grid">
      <aside className="work-panel terms-panel"><span className="eyebrow">LOCKED TERMS</span><h2>Agreement overview</h2><dl className="terms-list"><div><dt>Requester</dt><dd>{short(agreement.requester,7)}</dd></div><div><dt>Developer</dt><dd>{short(agreement.developer,7)}</dd></div><div><dt>Reward</dt><dd>{gen(agreement.reward)} GEN</dd></div><div><dt>Offer deadline</dt><dd>{when(agreement.offer_deadline)}</dd></div><div><dt>Delivery deadline</dt><dd>{when(agreement.delivery_deadline)}</dd></div><div><dt>Public CI</dt><dd>{agreement.ci_required ? "Required" : "Not required"}</dd></div></dl><div className="criteria-heading"><h3>ACCEPTANCE CRITERIA</h3><span className="micro-label">{agreement.clauses.length} RULES</span></div><ol className="criteria-list">{agreement.clauses.map((clause,index) => <li key={index}><span>{String(index + 1).padStart(2,"0")}</span><div>{clause}</div></li>)}</ol>{agreement.issue > 0 && <a className="context-link" href={`https://github.com/${agreement.repo}/issues/${agreement.issue}`} target="_blank" rel="noreferrer">Context issue #{agreement.issue} ↗</a>}</aside>

      <section className={`work-panel action-panel action-panel-${agreement.status.toLowerCase()}`}><div className="panel-heading"><div><span className="eyebrow">CURRENT ACTION</span><h2>{agreement.status === "OFFERED" ? "Terms awaiting acceptance" : agreement.status === "ACTIVE" ? "Ready for delivery" : agreement.status === "PAYABLE" ? "Settlement is payable" : "Agreement is closed"}</h2></div><span className="micro-label">{requester ? "REQUESTER VIEW" : developer ? "DEVELOPER VIEW" : "OBSERVER VIEW"}</span></div>
        {agreement.status === "OFFERED" && <div className="action-box action-offered"><span className="micro-label">{deadlinePassed ? "OFFER EXPIRED / REFUNDABLE" : "OFFERED / IMMUTABLE ON ACCEPTANCE"}</span><h2>{deadlinePassed ? "Close the expired offer." : "Review the rules before accepting."}</h2><p>{deadlinePassed ? "The acceptance window has passed. Materialize the expiry before claiming the requester refund." : "Accepting locks the agreement lifecycle. After acceptance, the requester can no longer cancel the offer."}</p>{!deadlinePassed && developer && <button className="primary" type="button" onClick={() => act("accept_terms",[id])}>Accept immutable terms <span aria-hidden="true">→</span></button>}{!deadlinePassed && requester && <button className="secondary" type="button" onClick={() => act("cancel_offer",[id])}>Cancel unaccepted offer</button>}{deadlinePassed && <button className="primary" type="button" onClick={() => act("close_expired",[id])}>Close expired agreement <span aria-hidden="true">→</span></button>}</div>}
        {agreement.status === "ACTIVE" && !deadlinePassed && <div className="action-box action-active"><span className="micro-label">ACTIVE / DELIVERY WINDOW OPEN</span><h2>Submit the public patch for evaluation.</h2><p>Put this agreement-scoped marker in the PR description. Validators fetch the repository themselves and bind the exact PR head commit.</p><CopyCode value={marker} /><div className="inline-form"><label className="sr-only" htmlFor="pr-number">Pull request number</label><input id="pr-number" value={pr} onChange={e => setPr(e.target.value)} inputMode="numeric" placeholder="PR number" /><button className="primary" type="button" onClick={() => act("evaluate_delivery",[id,Number(pr)])} disabled={!developer || !pr}>Evaluate patch <span aria-hidden="true">→</span></button></div><p className="hint">Outcomes remain recoverable while the agreement is active. A submitted PR/head SHA cannot be replayed.</p></div>}
        {agreement.status === "ACTIVE" && deadlinePassed && <div className="action-box action-offered"><span className="micro-label">DELIVERY EXPIRED / REFUNDABLE</span><h2>Close the expired agreement.</h2><p>The delivery deadline has passed, so new evaluations are no longer accepted.</p>{requester && <button className="primary" type="button" onClick={() => act("close_expired",[id])}>Close expired agreement <span aria-hidden="true">→</span></button>}</div>}
        {agreement.status === "PAYABLE" && <div className="result-box satisfied"><span className="micro-label">FINAL OUTCOME / SATISFIED</span><h2>{agreement.settlement_state === "PAYOUT_PENDING" ? "Reward transfer is pending confirmation." : "Validators found the patch payable."}</h2><p>{agreement.settlement_state === "PAYOUT_PENDING" ? "The parent claim finalized, but the external transfer must be proven before this agreement becomes PAID." : agreement.explanation}</p>{agreement.winning_sha && <div className="result-callout"><span>BOUND COMMIT · PR #{agreement.winning_pr}</span><code>{agreement.winning_sha}</code></div>}{developer && agreement.settlement_state === "PAYABLE" && <button className="primary" type="button" onClick={() => act("claim_funds",[id],true)}>Claim {gen(agreement.reward)} GEN <span aria-hidden="true">→</span></button>}{developer && agreement.settlement_state === "PAYOUT_PENDING" && <button className="secondary" type="button" onClick={() => act("retry_pending_transfer",[id],true)}>Retry transfer after verifying failure</button>}</div>}
        {["PAID","CANCELLED","EXPIRED"].includes(agreement.status) && <div className={`result-box result-${agreement.status.toLowerCase()}`}><span className="micro-label">TERMINAL STATE / {agreement.status}</span><h2>{agreement.status === "PAID" ? "Reward transfer confirmed." : agreement.status === "EXPIRED" ? "Agreement expired." : "Agreement cancelled."}</h2><p>{agreement.explanation || "This agreement has reached a closed state."}</p>{agreement.winning_sha && <div className="result-callout"><span>BOUND COMMIT · PR #{agreement.winning_pr}</span><code>{agreement.winning_sha}</code></div>}{requester && ["CANCELLED","EXPIRED"].includes(agreement.status) && !agreement.refund_claimed && agreement.settlement_state === "REFUNDABLE" && <button className="primary" type="button" onClick={() => act("claim_funds",[id],true)}>Claim refund {gen(agreement.reward)} GEN <span aria-hidden="true">→</span></button>}{requester && ["CANCELLED","EXPIRED"].includes(agreement.status) && agreement.settlement_state === "REFUND_PENDING" && <button className="secondary" type="button" onClick={() => act("retry_pending_transfer",[id],true)}>Retry refund after verifying failure</button>}</div>}
        <div className="attempts"><h3>EVALUATION HISTORY</h3>{attempts.length === 0 ? <p className="muted">No patch submitted yet. Evaluation history will appear here after the designated developer submits a pull request.</p> : attempts.map((attempt,index) => <article className="attempt-card" key={`${attempt.sha}-${index}`}><div className="attempt-top"><StatusPill status={attempt.outcome} /><span>PR #{attempt.pr}</span><code>{short(attempt.sha,8)}</code></div><p>{attempt.explanation}</p><small>{attempt.ci_state} · {when(attempt.at)}</small></article>)}</div>
        <TxPanel stage={stage} hash={hash} error={error} onResume={hash ? () => {setStage("tracking");void resumeTransaction(hash,progress => applyProgress(progress,"agreement-write"))} : undefined} />
      </section>

      <aside className="work-panel lifecycle-panel"><span className="eyebrow">PROTOCOL STATE</span><h2>Lifecycle</h2><LifecycleRail agreement={agreement} txStage={stage} />{hash && <a className="context-link" href={`${EXPLORER_URL}/tx/${hash}`} target="_blank" rel="noreferrer">Open transaction ↗</a>}<div className="authority-note"><strong>AUTHORITY BOUNDARY</strong><p>No requester override. No platform administrator. No browser-generated verdict. Canonical state remains on GenLayer.</p></div></aside>
    </div>
  </div>;
}
