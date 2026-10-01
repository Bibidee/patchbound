"use client";

import {FormEvent,useMemo,useState} from "react";
import {useRouter} from "next/navigation";
import {parseEther} from "viem";
import {useWallet,onStudionet} from "@/components/WalletProvider";
import {write} from "@/lib/genlayer";
import {TxPanel} from "@/components/TxPanel";
import type {TxStage} from "@/lib/types";

export default function NewAgreement() {
  const wallet = useWallet();
  const router = useRouter();
  const [repo,setRepo] = useState("");
  const [developer,setDeveloper] = useState("");
  const [issue,setIssue] = useState("");
  const [reward,setReward] = useState("0.1");
  const [ci,setCi] = useState(true);
  const [clauses,setClauses] = useState(["","",""]);
  const [offerDays,setOfferDays] = useState("3");
  const [deliveryDays,setDeliveryDays] = useState("14");
  const [stage,setStage] = useState<TxStage>("idle");
  const [hash,setHash] = useState("");
  const [error,setError] = useState("");
  const cleanClauses = useMemo(() => clauses.map(value => value.trim()).filter(Boolean), [clauses]);
  const setClause = (index: number,value: string) => setClauses(current => current.map((item,itemIndex) => itemIndex === index ? value : item));
  const submit = async (event: FormEvent) => {
    event.preventDefault();setError("");
    try {
      if (!wallet.address || !wallet.provider) throw new Error("Connect your injected wallet first.");
      if (!onStudionet(wallet.chainId)) throw new Error("Switch the wallet to Studionet 61999 first.");
      if (cleanClauses.length < 1 || cleanClauses.length > 5) throw new Error("Use 1 to 5 acceptance clauses.");
      if (!/^[-\w.]+\/[-\w.]+$/.test(repo)) throw new Error("Repository must be owner/name for a public GitHub repository.");
      const now = Math.floor(Date.now() / 1000);
      setStage("wallet");
      const out = await write(wallet.address as `0x${string}`,wallet.provider as never,"open_agreement",[developer,repo,Number(issue || 0),cleanClauses,ci,now + Number(offerDays) * 86400,now + Number(deliveryDays) * 86400],parseEther(reward),progress => {setHash(progress.hash);setStage(progress.status.includes("ACCEPT") ? "accepted" : "submitted")});
      setHash(out.hash);setStage("finalized");window.setTimeout(() => router.push("/"),1200);
    } catch (caught) {setStage("failed");setError(caught instanceof Error ? caught.message : String(caught));}
  };
  return <div className="page">
    <div className="page-intro"><span className="eyebrow">NEW AGREEMENT / BUILDER</span><h1>Lock the terms before the work begins.</h1><p>The agreement becomes immutable after creation. The designated developer accepts the terms, submits public evidence, and validators decide against the rules you define here.</p></div>
    <div className="builder-layout">
      <form className="builder-form" onSubmit={submit}>
        <section className="builder-stage"><div className="stage-heading"><span className="stage-number">01</span><div><h2>Parties & repository</h2><p>Who is authorized to deliver the public fix?</p></div></div><div className="field-grid">
          <div className="field full"><label htmlFor="developer">DESIGNATED DEVELOPER WALLET</label><input id="developer" value={developer} onChange={e => setDeveloper(e.target.value)} required placeholder="0x7A4C…"/><small>The wallet authorized to accept the agreement and submit delivery evidence.</small></div>
          <div className="field"><label htmlFor="repo">PUBLIC GITHUB REPOSITORY</label><input id="repo" value={repo} onChange={e => setRepo(e.target.value)} required placeholder="acme-labs/parser-core"/><small>Use the owner/repository format.</small></div>
          <div className="field"><label htmlFor="issue">ISSUE NUMBER <span className="muted">/ OPTIONAL</span></label><input id="issue" value={issue} onChange={e => setIssue(e.target.value)} inputMode="numeric" placeholder="142"/><small>Context only. Clauses remain authoritative.</small></div>
        </div></section>

        <section className="builder-stage"><div className="stage-heading"><span className="stage-number">02</span><div><h2>Acceptance rules</h2><p>Write observable requirements validators can verify against the exact patch.</p></div></div><div className="rule-list">
          {clauses.map((value,index) => <div className="rule-card" key={index}><span className="rule-index">{String(index + 1).padStart(2,"0")}</span><div className="field"><label htmlFor={`clause-${index}`}>ACCEPTANCE RULE {String(index + 1).padStart(2,"0")}</label><textarea id={`clause-${index}`} value={value} onChange={e => setClause(index,e.target.value)} placeholder={index === 0 ? "Reject malformed configuration with a clear validation error." : index === 1 ? "Existing valid configuration must continue to pass all current tests." : "Add another observable requirement…"} /></div>{clauses.length > 1 && <button className="remove-rule" type="button" onClick={() => setClauses(current => current.filter((_,itemIndex) => itemIndex !== index))} aria-label={`Remove acceptance rule ${index + 1}`}>×</button>}</div>)}
        </div>{clauses.length < 5 && <button className="add-rule" type="button" onClick={() => setClauses(current => [...current,""])}>+ Add acceptance rule</button>}
          <div className="choice-grid"><label className="choice-card"><input type="radio" name="ci" checked={ci} onChange={() => setCi(true)} /><em>PUBLIC CI VERIFICATION</em><strong>Required</strong><span>Validators must confirm the public CI result succeeds.</span></label><label className="choice-card"><input type="radio" name="ci" checked={!ci} onChange={() => setCi(false)} /><em>PUBLIC CI VERIFICATION</em><strong>Not required</strong><span>Evaluation does not require a successful public CI result.</span></label></div>
        </section>

        <section className="builder-stage"><div className="stage-heading"><span className="stage-number">03</span><div><h2>Funding & deadlines</h2><p>Set the reward and the two windows that govern delivery.</p></div></div><div className="field-grid"><div className="field"><label htmlFor="reward">REWARD / GEN</label><input id="reward" value={reward} onChange={e => setReward(e.target.value)} required inputMode="decimal" placeholder="5.00"/><small>Transferred only after a payable outcome.</small></div><div className="field"><label htmlFor="offer-days">OFFER VALID / DAYS</label><input id="offer-days" value={offerDays} onChange={e => setOfferDays(e.target.value)} required inputMode="numeric" placeholder="3"/><small>Acceptance window for the developer.</small></div><div className="field"><label htmlFor="delivery-days">DELIVERY / DAYS</label><input id="delivery-days" value={deliveryDays} onChange={e => setDeliveryDays(e.target.value)} required inputMode="numeric" placeholder="14"/><small>Window for the public patch and evaluation.</small></div></div><div className="timeline"><div><span>NOW</span><strong>Agreement created</strong></div><div><span>+ {offerDays || "—"} DAYS</span><strong>Developer acceptance deadline</strong></div><div><span>+ {deliveryDays || "—"} DAYS</span><strong>Delivery deadline</strong></div></div></section>

        <section className="builder-stage"><div className="stage-heading"><span className="stage-number">04</span><div><h2>Review before signing</h2><p>Read the complete agreement summary before your wallet is asked to sign.</p></div></div><div className="review-list"><div className="review-row"><span>REPOSITORY</span><strong>{repo || "owner/repository"}</strong></div><div className="review-row"><span>DEVELOPER</span><code>{developer || "0x7A4C…"}</code></div><div className="review-row"><span>REWARD</span><strong>{reward || "—"} GEN</strong></div><div className="review-row"><span>ACCEPTANCE RULES</span><strong>{cleanClauses.length} / 5</strong></div><div className="review-row"><span>PUBLIC CI</span><strong>{ci ? "Required" : "Not required"}</strong></div><div className="review-row"><span>WINDOWS</span><strong>{offerDays || "—"} days offer · {deliveryDays || "—"} days delivery</strong></div></div></section>

        <div className="builder-submit"><p><b>Your wallet signs directly.</b><br />Patchbound cannot rewrite the agreement after creation. Writes are blocked unless the wallet is on Studionet.</p><button className="primary" disabled={stage !== "idle" && stage !== "failed"}>Fund & create agreement <span aria-hidden="true">→</span></button></div>
        <TxPanel stage={stage} hash={hash} error={error} />
      </form>
      <aside className="preview-sticky"><span className="eyebrow">AGREEMENT PREVIEW</span><h2>YOU ARE ABOUT TO LOCK</h2><div className="preview-summary"><div><span>REPOSITORY</span><strong>{repo || "acme-labs/parser-core"}</strong></div><div><span>DEVELOPER</span><code>{developer || "0x7A4C…901B"}</code></div><div><span>REWARD</span><strong>{reward || "5.00"} GEN</strong></div><div><span>ACCEPTANCE RULES</span><strong>{cleanClauses.length} rule{cleanClauses.length === 1 ? "" : "s"}</strong></div><div><span>PUBLIC CI</span><strong>{ci ? "Required" : "Not required"}</strong></div><div><span>OFFER / DELIVERY</span><strong>{offerDays || "—"} days / {deliveryDays || "—"} days</strong></div></div><p className="review-note">The wallet signature creates the canonical agreement. No server or administrator can modify these terms later.</p></aside>
    </div>
  </div>;
}
