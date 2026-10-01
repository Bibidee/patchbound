import {StatusPill} from "@/components/StatusPill";

const steps = [
  ["Terms locked", "complete"],
  ["Developer accepted", "complete"],
  ["Patch submitted", "current"],
  ["Validator review", "pending"],
  ["Settlement", "pending"],
] as const;

export function ProtocolPreview() {
  return (
    <div className="protocol-preview" aria-label="Non-authoritative visual protocol preview">
      <div className="preview-orbit orbit-one" />
      <div className="preview-orbit orbit-two" />
      <div className="preview-header">
        <span className="eyebrow">LIVE PROTOCOL PREVIEW</span>
        <span className="demo-tag">DEMO / NON-AUTHORITATIVE</span>
      </div>
      <div className="preview-card">
        <div className="preview-card-top">
          <div>
            <span className="micro-label">AGREEMENT</span>
            <strong>#024</strong>
          </div>
          <StatusPill status="ACTIVE" />
        </div>
        <div className="preview-repo">
          <span className="micro-label">REPOSITORY</span>
          <code>github.com/example/project</code>
        </div>
        <div className="preview-facts">
          <div><span>Reward</span><strong>8.50 GEN</strong></div>
          <div><span>Developer</span><code>0x73B4…A901</code></div>
        </div>
        <div className="preview-divider" />
        <ol className="preview-steps">
          {steps.map(([label, state], index) => (
            <li className={`preview-step ${state}`} key={label}>
              <span className="preview-step-index">0{index + 1}</span>
              <span>{label}</span>
              <i aria-hidden="true" />
            </li>
          ))}
        </ol>
      </div>
      <p className="preview-footnote"><span /> VISUAL SAMPLE · CANONICAL DATA LIVES ON GENLAYER</p>
    </div>
  );
}
