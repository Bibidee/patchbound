export function ProtocolMark({className = ""}: {className?: string}) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <path d="M12 5H7.5A2.5 2.5 0 0 0 5 7.5v4.2M20 5h4.5A2.5 2.5 0 0 1 27 7.5v4.2M12 27H7.5A2.5 2.5 0 0 1 5 24.5v-4.2M20 27h4.5a2.5 2.5 0 0 0 2.5-2.5v-4.2" />
      <path d="M10 14.2h12M10 17.8h8" />
      <circle cx="22" cy="17.8" r="1.4" />
    </svg>
  );
}
