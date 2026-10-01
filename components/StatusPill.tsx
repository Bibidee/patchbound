export function StatusPill({status}: {status: string}) {
  const normalized = status.toLowerCase();
  return <span className={`status-pill status-${normalized}`}><i aria-hidden="true" /><span>{status.replaceAll("_", " ")}</span></span>;
}
