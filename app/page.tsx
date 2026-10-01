"use client";

import Link from "next/link";
import {useEffect,useMemo,useState} from "react";
import {useWallet} from "@/components/WalletProvider";
import {WalletButton} from "@/components/WalletButton";
import {AgreementCard} from "@/components/AgreementCard";
import {EmptyState} from "@/components/EmptyState";
import {ProtocolPreview} from "@/components/ProtocolPreview";
import {api} from "@/lib/genlayer";
import type {Agreement,AgreementStatus} from "@/lib/types";
import {isConfigured} from "@/lib/constants";

const filters: Array<"ALL" | AgreementStatus | "CLOSED"> = ["ALL","OFFERED","ACTIVE","PAYABLE","CLOSED"];

export default function Home() {
  const wallet = useWallet();
  const [agreements,setAgreements] = useState<Agreement[]>([]);
  const [error,setError] = useState("");
  const [filter,setFilter] = useState<typeof filters[number]>("ALL");
  const [search,setSearch] = useState("");
  useEffect(() => {
    if (!wallet.address || !isConfigured()) {setAgreements([]);setError("");return}
    api.forWallet(wallet.address).then(setAgreements).catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)));
  }, [wallet.address]);
  const visible = useMemo(() => agreements.filter(item => {
    const filterMatch = filter === "ALL" || (filter === "CLOSED" ? ["PAYOUT_DISPATCHED","REFUND_DISPATCHED"].includes(item.settlement_state) || ["CANCELLED","EXPIRED"].includes(item.status) : item.status === filter);
    return filterMatch && item.repo.toLowerCase().includes(search.toLowerCase().trim());
  }), [agreements,filter,search]);

  return <div className="page">
    <section className="hero">
      <div className="hero-copy">
        <span className="eyebrow">PATCHBOUND / GENLAYER SETTLEMENT</span>
        <h1>Fund the fix.<br /><em>Lock the rules.</em><br />Let validators decide.</h1>
        <p className="hero-description">Create funded software agreements with immutable acceptance criteria. Developers submit commit-bound evidence and GenLayer validators independently determine whether the patch satisfies the terms.</p>
        <div className="hero-actions"><Link className="primary" href="/new">Create agreement <span aria-hidden="true">→</span></Link><Link className="secondary" href="/activity">View activity <span aria-hidden="true">↗</span></Link></div>
        <div className="trust-indicators"><div><span>01</span><strong>IMMUTABLE TERMS</strong></div><div><span>02</span><strong>COMMIT-BOUND EVIDENCE</strong></div><div><span>03</span><strong>FINALITY-AWARE SETTLEMENT</strong></div></div>
      </div>
      <ProtocolPreview />
    </section>
    <section className="desk-section" aria-labelledby="work-desk-heading">
      <div className="section-heading"><div><span className="eyebrow">YOUR WORK DESK</span><h2 id="work-desk-heading">Funded agreements associated with your wallet.</h2></div><p>Canonical state is read from the Patchbound contract. No local account data or operator ledger.</p></div>
      {!wallet.connected ? <EmptyState eyebrow="WALLET DISCONNECTED" title="Your work desk starts here." description="Connect the wallet you use to request or deliver software work." action={<WalletButton />} /> : !isConfigured() ? <EmptyState eyebrow="CONFIGURATION UNAVAILABLE" title="Contract address is not configured." description="The frontend is ready for Studionet, but a deployed Patchbound address is required before contract reads can begin." /> : <>
        <div className="desk-toolbar"><div className="filter-group" aria-label="Agreement filters">{filters.map(item => <button className={`filter-button ${filter === item ? "active" : ""}`} type="button" key={item} onClick={() => setFilter(item)}>{item.replace("_"," ")}</button>)}</div><label><span className="sr-only">Search repositories</span><input className="repo-search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search repository…" /></label></div>
        {error ? <EmptyState eyebrow="CONTRACT READ FAILED" title="The work desk could not be read." description={error} /> : visible.length === 0 ? <EmptyState eyebrow={agreements.length === 0 ? "NOTHING IS BOUND YET" : "NO MATCHES"} title={agreements.length === 0 ? "Create your first funded agreement." : "No agreements match this view."} description={agreements.length === 0 ? "Lock the acceptance criteria before development begins." : "Try another status filter or repository search."} action={agreements.length === 0 ? <Link className="primary" href="/new">Create agreement →</Link> : undefined} /> : <div className="agreement-list">{visible.map(item => <AgreementCard agreement={item} key={item.id} />)}</div>}
      </>}
    </section>
  </div>;
}
