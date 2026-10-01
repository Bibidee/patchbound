"use client";

import Link from "next/link";
import {use,useCallback,useEffect,useState} from "react";
import {useWallet,onStudionet} from "@/components/WalletProvider";
import {api,write} from "@/lib/genlayer";
import type {Agreement,Attempt,TxStage} from "@/lib/types";
import {StatusPill} from "@/components/StatusPill";
import {TxPanel} from "@/components/TxPanel";
import {LifecycleRail} from "@/components/LifecycleRail";
import {CopyCode} from "@/components/CopyCode";
import {EmptyState} from "@/components/EmptyState";
import {gen,short,when} from "@/lib/format";
import {EXPLORER_URL} from "@/lib/constants";

export default function Work({params}: {params: Promise<{id: string}>}) {
  const {id} = use(params);
  const wallet = useWallet();
  const [agreement,setAgreement] = useState<Agreement | null>(null);
  const [attempts,setAttempts] = useState<Attempt[]>([]);
  const [claimable,setClaimable] = useState("0");
  const [pr,setPr] = useState("");
  const [stage,setStage] = useState<TxStage>("idle");
  const [hash,setHash] = useState("");
  const [error,setError] = useState("");
  const load = useCallback(async () => {
    try {
      const current = await api.agreement(id);setAgreement(current);setAttempts(await api.attempts(id));if (wallet.address) setClaimable(await api.claimable(wallet.address));
    } catch (caught) {setError(caught instanceof Error ? caught.message : String(caught));}
  }, [id,wallet.address]);
  useEffect(() => {void load()}, [load]);
  const act = async (name: string,args: unknown[] = []) => {
    try {
      setError("");
      if (!wallet.address || !wallet.provider) throw new Error("Connect your injected wallet first.");
      if (!onStudionet(wallet.chainId)) throw new Error("Switch to Studionet 61999 first.");
      setStage("wallet");
      const out = await write(wallet.address as `0x${string}`,wallet.provider as never,name,args,0n,progress => {setHash(progress.hash);setStage(progress.status.includes("ACCEPT") ? "accepted" : "submitted")});
      setHash(out.hash);setStage("finalized");await load();
    } catch (caught) {setStage("failed");setError(caught instanceof Error ? caught.message : String(caught));}
  };
  if (!agreement && !error) return <div className="workspace-shell"><Link className="back-link" href="/">← Work desk</Link><div className="loading-card"><div className="skeleton large" /><div className="skeleton" /><div className="skeleton" /><div className="skeleton" /></div></div>;
  if (!agreement) return <div className="workspace-shell"><Link className="back-link" href="/">← Work desk</Link><EmptyState eyebrow="AGREEMENT UNAVAILABLE" title={`Agreement #${id} could not be read.`} description={error} /></div>;
  const me = wallet.address.toLowerCase();
  const requester = me === agreement.requester.toLowerCase();
  const developer = me === agreement.developer.toLowerCase();
  const marker = `PATCHBOUND / agreement ${agreement.id} / developer ${agreement.developer}`;
  return <div className="workspace-shell">
    <div className="workspace-top"><div><Link className="back-link" href="/">← Work desk</Link><span className="eyebrow">AGREEMENT #{agreement.id}</span><h1>{agreement.repo}</h1><p>Immutable terms · Public GitHub evidence · GenLayer validator judgment</p></div><div className="workspace-top-meta"><StatusPill status={agreement.status} /><div className="workspace-stat"><span>REWARD</span><strong>{gen(agreement.reward)} GEN</strong></div><div className="workspace-stat"><span>ATTEMPTS</span><strong>{agreement.attempt_count}</strong></div></div></div>
    <div className="workspace-grid">
      <aside className="work-panel terms-panel"><span className="eyebrow">LOCKED TERMS</span><h2>Agreement overview</h2><dl className="terms-list"><div><dt>Requester</dt><dd>{short(agreement.requester,7)}</dd></div><div><dt>Developer</dt><dd>{short(agreement.developer,7)}</dd></div><div><dt>Reward</dt><dd>{gen(agreement.reward)} GEN</dd></div><div><dt>Offer deadline</dt><dd>{when(agreement.offer_deadline)}</dd></div><div><dt>Delivery deadline</dt><dd>{when(agreement.delivery_deadline)}</dd></div><div><dt>Public CI</dt><dd>{agreement.ci_required ? "Required" : "Not required"}</dd></div></dl><div className="criteria-heading"><h3>ACCEPTANCE CRITERIA</h3><span className="micro-label">{agreement.clauses.length} RULES</span></div><ol className="criteria-list">{agreement.clauses.map((clause,index) => <li key={index}><span>{String(index + 1).padStart(2,"0")}</span><div>{clause}</div></li>)}</ol>{agreement.issue > 0 && <a className="context-link" href={`https://github.com/${agreement.repo}/issues/${agreement.issue}`} target="_blank" rel="noreferrer">Context issue #{agreement.issue} ↗</a>}</aside>

      <section className={`work-panel action-panel action-panel-${agreement.status.toLowerCase()}`}><div className="panel-heading"><div><span className="eyebrow">CURRENT ACTION</span><h2>{agreement.status === "OFFERED" ? "Terms awaiting acceptance" : agreement.status === "ACTIVE" ? "Ready for delivery" : agreement.status === "PAYABLE" ? "Settlement is payable" : "Agreement is closed"}</h2></div><span className="micro-label">{requester ? "REQUESTER VIEW" : developer ? "DEVELOPER VIEW" : "OBSERVER VIEW"}</span></div>
        {agreement.status === "OFFERED" && <div className="action-box action-offered"><span className="micro-label">OFFERED / IMMUTABLE ON ACCEPTANCE</span><h2>Review the rules before accepting.</h2><p>Accepting locks the agreement lifecycle. After acceptance, the requester can no longer cancel the offer.</p>{developer && <button className="primary" type="button" onClick={() => act("accept_terms",[id])}>Accept immutable terms <span aria-hidden="true">→</span></button>}{requester && <button className="secondary" type="button" onClick={() => act("cancel_offer",[id])}>Cancel unaccepted offer</button>}</div>}
        {agreement.status === "ACTIVE" && <div className="action-box action-active"><span className="micro-label">ACTIVE / DELIVERY WINDOW OPEN</span><h2>Submit the public patch for evaluation.</h2><p>Put this agreement-scoped marker in the PR description. Validators fetch the repository themselves and bind the exact PR head commit.</p><CopyCode value={marker} /><div className="inline-form"><label className="sr-only" htmlFor="pr-number">Pull request number</label><input id="pr-number" value={pr} onChange={e => setPr(e.target.value)} inputMode="numeric" placeholder="PR number" /><button className="primary" type="button" onClick={() => act("evaluate_delivery",[id,Number(pr)])} disabled={!developer || !pr}>Evaluate patch <span aria-hidden="true">→</span></button></div><p className="hint">Outcomes remain recoverable while the agreement is active. A submitted PR/head SHA cannot be replayed.</p></div>}
        {agreement.status === "PAYABLE" && <div className="result-box satisfied"><span className="micro-label">FINAL OUTCOME / SATISFIED</span><h2>Validators found the patch payable.</h2><p>{agreement.explanation}</p>{agreement.winning_sha && <div className="result-callout"><span>BOUND COMMIT · PR #{agreement.winning_pr}</span><code>{agreement.winning_sha}</code></div>}{developer && BigInt(claimable) > 0n && <button className="primary" type="button" onClick={() => act("claim_funds")}>Claim {gen(claimable)} GEN <span aria-hidden="true">→</span></button>}</div>}
        {["PAID","CANCELLED","EXPIRED"].includes(agreement.status) && <div className={`result-box result-${agreement.status.toLowerCase()}`}><span className="micro-label">TERMINAL STATE / {agreement.status}</span><h2>{agreement.status === "PAID" ? "Reward claimed." : agreement.status === "EXPIRED" ? "Agreement expired." : "Agreement cancelled."}</h2><p>{agreement.explanation || "This agreement has reached a closed state."}</p>{agreement.winning_sha && <div className="result-callout"><span>BOUND COMMIT · PR #{agreement.winning_pr}</span><code>{agreement.winning_sha}</code></div>}</div>}
        <div className="attempts"><h3>EVALUATION HISTORY</h3>{attempts.length === 0 ? <p className="muted">No patch submitted yet. Evaluation history will appear here after the designated developer submits a pull request.</p> : attempts.map((attempt,index) => <article className="attempt-card" key={`${attempt.sha}-${index}`}><div className="attempt-top"><StatusPill status={attempt.outcome} /><span>PR #{attempt.pr}</span><code>{short(attempt.sha,8)}</code></div><p>{attempt.explanation}</p><small>{attempt.ci_state} · {when(attempt.at)}</small></article>)}</div>
        <TxPanel stage={stage} hash={hash} error={stage === "failed" ? error : undefined} />
      </section>

      <aside className="work-panel lifecycle-panel"><span className="eyebrow">PROTOCOL STATE</span><h2>Lifecycle</h2><LifecycleRail agreement={agreement} txStage={stage} />{hash && <a className="context-link" href={`${EXPLORER_URL}/tx/${hash}`} target="_blank" rel="noreferrer">Open transaction ↗</a>}<div className="authority-note"><strong>AUTHORITY BOUNDARY</strong><p>No requester override. No platform administrator. No browser-generated verdict. Canonical state remains on GenLayer.</p></div></aside>
    </div>
  </div>;
}
