"use client";

import Link from "next/link";
import {usePathname} from "next/navigation";
import {WalletButton} from "./WalletButton";
import {ProtocolMark} from "./ProtocolMark";

export function Shell({children}: {children: React.ReactNode}) {
  const path = usePathname();
  const workActive = path === "/" || path.startsWith("/work");
  const newActive = path.startsWith("/new");
  const activityActive = path.startsWith("/activity");
  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <Link href="/" className="brand" aria-label="Patchbound home">
            <span className="brand-mark"><ProtocolMark /></span>
            <span className="brand-name">PATCHBOUND</span>
            <span className="brand-type">PROTOCOL</span>
          </Link>
          <nav className="main-nav" aria-label="Primary navigation">
            <Link className={workActive ? "active" : ""} href="/">Work <span>01</span></Link>
            <Link className={newActive ? "active" : ""} href="/new">New agreement <span>02</span></Link>
            <Link className={activityActive ? "active" : ""} href="/activity">Activity <span>03</span></Link>
          </nav>
          <div className="topbar-actions">
            <div className="network-indicator" title="GenLayer Studionet · chain 61999">
              <i aria-hidden="true" />
              <span>STUDIONET</span>
              <code>61999</code>
            </div>
            <WalletButton />
          </div>
        </div>
      </header>
      <main>{children}</main>
      <footer className="site-footer">
        <span><b>PATCHBOUND</b> / Public fix acceptance settled by GenLayer consensus.</span>
        <span><i /> STUDIONET · 61999 <em>·</em> No operator signer</span>
      </footer>
    </>
  );
}
