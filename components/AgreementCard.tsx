import Link from "next/link";
import type {Agreement} from "@/lib/types";
import {gen,short,when} from "@/lib/format";
import {StatusPill} from "@/components/StatusPill";

export function AgreementCard({agreement}: {agreement: Agreement}) {
  return (
    <Link href={`/work/${agreement.id}`} className={`agreement-card agreement-${agreement.status.toLowerCase()}`}>
      <div className="agreement-card-main">
        <div className="agreement-card-heading">
          <span className="agreement-id">#{agreement.id}</span>
          <StatusPill status={agreement.status} />
        </div>
        <h3>{agreement.repo}</h3>
        <p>{agreement.clauses.length} acceptance {agreement.clauses.length === 1 ? "rule" : "rules"} · {agreement.attempt_count} {agreement.attempt_count === 1 ? "attempt" : "attempts"}</p>
      </div>
      <div className="agreement-card-meta">
        <div><span>REWARD</span><strong>{gen(agreement.reward)} <em>GEN</em></strong></div>
        <div><span>DEVELOPER</span><code>{short(agreement.developer, 6)}</code></div>
        <div><span>DEADLINE</span><code>{when(agreement.delivery_deadline)}</code></div>
      </div>
      <span className="card-arrow" aria-hidden="true">↗</span>
    </Link>
  );
}
