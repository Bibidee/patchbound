"use client";

import {useState} from "react";
import {useWallet,onStudionet} from "./WalletProvider";
import {CHAIN_ID,EXPLORER_URL} from "@/lib/constants";
import {short} from "@/lib/format";

export function WalletButton() {
  const w = useWallet();
  const [open,setOpen] = useState(false);
  const [error,setError] = useState("");
  const connect = () => {
    setError("");
    w.connect().then(() => setOpen(true)).catch((e: unknown) => {setError(e instanceof Error ? e.message : String(e));setOpen(true)});
  };
  const switchNetwork = () => {
    setError("");
    w.switchNetwork().catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)));
  };
  if (!w.connected) return (
    <div className="wallet-control-wrap">
      <button className="wallet-control connect-control" type="button" onClick={connect} aria-expanded={Boolean(error)}>
        <span className="wallet-status-dot" aria-hidden="true" /><span>Connect wallet</span><span className="control-arrow" aria-hidden="true">↗</span>
      </button>
      {error && <div className="wallet-popover error-popover" role="alert">{error}</div>}
    </div>
  );
  const correctNetwork = onStudionet(w.chainId);
  return (
    <div className="wallet-control-wrap">
      <button className={`wallet-control ${correctNetwork ? "connected-control" : "warning-control"}`} type="button" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span className="wallet-status-dot" aria-hidden="true" />
        <span className="wallet-control-copy"><strong>{correctNetwork ? "STUDIONET" : "NETWORK CHANGE REQUIRED"}</strong><code>{correctNetwork ? short(w.address,5) : `CHAIN ${w.chainId ?? "UNKNOWN"}`}</code></span>
        <span className="control-arrow" aria-hidden="true">{open ? "⌃" : "⌄"}</span>
      </button>
      {open && <div className="wallet-popover" role="dialog" aria-label="Wallet details">
        {correctNetwork ? <>
          <div className="popover-heading"><span className="eyebrow">CONNECTED WALLET</span><span className="popover-live">LIVE</span></div>
          <code className="wallet-address">{w.address}</code>
          <dl className="wallet-details"><dt>Network</dt><dd>GenLayer Studionet</dd><dt>Chain ID</dt><dd>{CHAIN_ID}</dd></dl>
          <div className="popover-actions"><a href={`${EXPLORER_URL}/address/${w.address}`} target="_blank" rel="noreferrer">Open explorer ↗</a><button type="button" onClick={() => {w.disconnect();setOpen(false)}}>Disconnect</button></div>
        </> : <>
          <div className="popover-heading"><span className="eyebrow">NETWORK CHANGE REQUIRED</span><span className="warning-chip">WRONG NETWORK</span></div>
          <p className="wallet-message">Patchbound writes require GenLayer Studionet.</p>
          <button className="primary compact-button" type="button" onClick={switchNetwork}>Switch to Studionet</button>
          {error && <p className="wallet-error" role="alert">{error}</p>}
        </>}
      </div>}
    </div>
  );
}
