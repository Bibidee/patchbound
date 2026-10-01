import type {Agreement,TxStage} from "@/lib/types";

export function LifecycleRail({agreement}: {agreement: Agreement; txStage: TxStage}) {
  const accepted = agreement.accepted_at > 0;
  const submitted = agreement.attempt_count > 0;
  const hasOutcome = ["SATISFIED", "NOT_SATISFIED", "INCONCLUSIVE"].includes(agreement.outcome);
  const payable = ["PAYABLE", "PAID"].includes(agreement.status);
  const terminal = ["PAID", "CANCELLED", "EXPIRED"].includes(agreement.status);
  const closedLabel = agreement.status === "CANCELLED" ? "Offer cancelled" : agreement.status === "EXPIRED" ? "Agreement expired" : "Settlement complete";
  const currentLabel = agreement.status === "OFFERED" ? "Terms accepted" : agreement.status === "ACTIVE" ? (!submitted ? "Delivery submitted" : "Consensus result") : agreement.status === "PAYABLE" ? "Settlement payable" : closedLabel;
  const items = [
    ["Agreement created", true, "Canonical record exists"],
    ["Terms accepted", accepted, accepted ? "Immutable lifecycle" : agreement.status === "CANCELLED" || agreement.status === "EXPIRED" ? "Not accepted before closure" : "Awaiting developer"],
    ["Delivery submitted", submitted, submitted ? `${agreement.attempt_count} evaluation attempt${agreement.attempt_count === 1 ? "" : "s"}` : "No patch submitted"],
    ["Consensus result", hasOutcome, hasOutcome ? `${agreement.outcome} · explanations are evidence only` : "Validator decision follows submission"],
    ["Settlement payable", payable, payable ? "Satisfied outcome is payable or paid" : agreement.status === "ACTIVE" ? "Only SATISFIED can become payable" : "No payable settlement"],
    [closedLabel, terminal, terminal ? (agreement.settlement_state || "Canonical terminal state") : "Agreement remains active"],
  ] as const;
  return <ol className="lifecycle-rail">
    {items.map(([label,done,detail]) => <li className={`${done ? "done" : ""} ${currentLabel === label ? "current" : ""}`} key={label}>
      <span className="rail-node" aria-hidden="true" />
      <div><strong>{label}</strong><small>{detail}</small></div>
    </li>)}
  </ol>;
}
