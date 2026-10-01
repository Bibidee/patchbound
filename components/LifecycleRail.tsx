import type {Agreement,TxStage} from "@/lib/types";

export function LifecycleRail({agreement, txStage}: {agreement: Agreement; txStage: TxStage}) {
  const accepted = agreement.status !== "OFFERED";
  const submitted = agreement.attempt_count > 0;
  const consensus = txStage === "accepted";
  const acceptedTx = consensus || txStage === "finalized";
  const finalized = txStage === "finalized" || ["PAYABLE", "PAID", "CANCELLED", "EXPIRED"].includes(agreement.status);
  const items = [
    ["Agreement created", true, "Canonical record exists"],
    ["Terms accepted", accepted, accepted ? "Immutable lifecycle" : "Awaiting developer"],
    ["Delivery submitted", submitted, submitted ? `${agreement.attempt_count} evaluation attempt${agreement.attempt_count === 1 ? "" : "s"}` : "No patch submitted"],
    ["Consensus processing", consensus, consensus ? "Accepted provisionally" : "Validator decision follows submission"],
    ["Accepted", acceptedTx, agreement.status === "PAYABLE" || agreement.status === "PAID" ? "Outcome is payable" : "Not yet payable"],
    ["Finalized", finalized, finalized ? "Canonical state reached" : "Awaiting final state"],
  ] as const;
  return (
    <ol className="lifecycle-rail">
      {items.map(([label, done, detail]) => (
        <li className={done ? "done" : ""} key={label}>
          <span className="rail-node" aria-hidden="true" />
          <div><strong>{label}</strong><small>{detail}</small></div>
        </li>
      ))}
    </ol>
  );
}
