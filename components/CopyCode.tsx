"use client";

import {useState} from "react";

export function CopyCode({value, label = "Copy"}: {value: string; label?: string}) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };
  return (
    <div className="copy-code">
      <code>{value}</code>
      <button type="button" onClick={copy}>{copied ? "Copied" : label}</button>
    </div>
  );
}
