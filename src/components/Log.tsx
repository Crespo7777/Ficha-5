import { useEffect, useRef } from "react";
import type { LogEntry } from "../storage";

export function Log({ log }: { log: LogEntry[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight });
  }, [log]);
  return (
    <div
      ref={ref}
      style={{
        height: 160,
        overflow: "auto",
        border: "1px solid #ddd",
        borderRadius: 12,
        padding: 8,
        fontSize: 14
      }}
    >
      {log.length === 0 && (
        <div style={{ opacity: 0.6 }}>Sem rolagens ainda…</div>
      )}
      {log.map((l) => (
        <div key={l.id}>
          <b>{new Date(l.ts).toLocaleTimeString()}</b>{" "}
          <i>{l.who}</i>: {l.what} — {l.detail}
        </div>
      ))}
    </div>
  );
}
