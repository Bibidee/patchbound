"use client";

import Link from "next/link";
import {useEffect,useMemo,useState} from "react";
import {useWallet} from "@/components/WalletProvider";
import {WalletButton} from "@/components/WalletButton";
import {EmptyState} from "@/components/EmptyState";
import {StatusPill} from "@/components/StatusPill";
import {api} from "@/lib/genlayer";
import {isConfigured} from "@/lib/constants";
import type {Agreement} from "@/lib/types";
import {gen,when} from "@/lib/format";

const filters = ["ALL","PAID","CANCELLED","EXPIRED"] as const;

export default function Activity() {
  const wallet = useWallet();
  const [agreements,setAgreements] = useState<Agreement[]>([]);
  const [filter,setFilter] = useState<typeof filters[number]>("ALL");
  const [error,setError] = useState("");
  useEffect(() => {
    if (!wallet.address || !isConfigured()) {setAgreements([]);setError("");return}
    api.forWallet(wallet.address).then(items => setAgreements(items.filter(item => ["PAID","CANCELLED","EXPIRED"].includes(item.status)))).catch((caught: unknown) => setError(caught instanceof Error ? caught.message : String(caught)));
  }, [wallet.address]);
  const visible = useMemo(() => agreements.filter(item => filter === "ALL" || item.status === filter), [agreements,filter]);
  return <div className="page narrow">
    <header className="ledger-header"><div><span className="eyebrow">ACTIVITY / PROTOCOL LEDGER</span><h1>Settlement history.</h1><p>Completed agreements and settlement history associated with this wallet. Every entry is reconstructed from contract state.</p></div><span className="micro-label">{agreements.length} CLOSED RECORD{agreements.length === 1 ? "" : "S"}</span></header>
    {!wallet.connected ? <EmptyState eyebrow="WALLET DISCONNECTED" title="Connect to read your activity." description="Patchbound does not keep an application-side history. The connected wallet is the query boundary." action={<WalletButton />} /> : error ? <EmptyState eyebrow="CONTRACT READ FAILED" title="Activity could not be loaded." description={error} /> : <>
      <div className="ledger-toolbar"><div className="filter-group" aria-label="Activity filters">{filters.map(item => <button className={`filter-button ${filter === item ? "active" : ""}`} key={item} type="button" onClick={() => setFilter(item)}>{item}</button>)}</div><span className="micro-label">CANONICAL / READ ONLY</span></div>
      {visible.length === 0 ? <EmptyState eyebrow="NO COMPLETED AGREEMENTS YET" title="Nothing is settled here yet." description="Settled, cancelled and expired agreements will appear in this ledger." action={<Link className="primary" href="/new">Create agreement →</Link>} /> : <div className="ledger-table" role="table" aria-label="Agreement activity"><div className="ledger-row ledger-columns" role="row"><span>AGREEMENT</span><span>REPOSITORY</span><span>OUTCOME</span><span>REWARD</span><span /></div>{visible.map(item => <Link className="ledger-row" role="row" href={`/work/${item.id}`} key={item.id}><strong>#{item.id}</strong><div className="ledger-repo"><strong>{item.repo}</strong><small>{item.closed_at ? `Closed ${when(item.closed_at)}` : "Closed state"}</small></div><StatusPill status={item.status} /><span className="ledger-reward">{gen(item.reward)} GEN</span><span className="ledger-arrow" aria-hidden="true">↗</span></Link>)}</div>}
    </>}
  </div>;
}
