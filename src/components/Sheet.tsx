import { useEffect, useState } from "react";
import OBR, { isOwlbear } from "../obr";
import { ATTR_LABEL, type AttrKey } from "../symbaroum";
import { Log } from "./Log";
import { Roller } from "./Roller";
import type { LogEntry } from "../storage";
import { onBus, sendAppend } from "../bus";
import { readRoomLog, writeRoomLog } from "../storage";

const TITLE = "Ficha 5 — Symbaroum";

export default function Sheet() {
  const [playerName, setPlayerName] = useState<string>("Jogador");
  const [log, setLog] = useState<LogEntry[]>([]);

  useEffect(() => {
    if (!isOwlbear) {
      // Ambiente local (fora do Owlbear)
      console.log("[DEV] Rodando fora do Owlbear — modo desenvolvimento.");
      setPlayerName("Jogador (local)");
      return;
    }

    // Dentro do Owlbear: pode usar o SDK com segurança
    OBR.player.getName().then((n) => setPlayerName(n || "Jogador"));
    readRoomLog().then((entries) => setLog(entries));

    // Escuta mensagens de broadcast (compartilha log)
    const off = onBus(async (msg) => {
      if (msg.type === "append-log") {
        setLog((old) => {
          const next = [...old, msg.entry];
          writeRoomLog(next).catch(() => {});
          return next;
        });
      } else if (msg.type === "replace-log") {
        setLog(msg.entries);
      }
    });

    return off;
  }, []);

  const card: React.CSSProperties = {
    border: "1px solid #ddd",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    background: "#fafafa"
  };

  return (
    <div style={{ padding: 12, fontFamily: "Inter, system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>{TITLE}</h1>

      <section style={card}>
        <div style={{ fontWeight: 600, marginBottom: 6 }}>Nome do Jogador</div>
        <input
          style={{
            border: "1px solid #ccc",
            borderRadius: 8,
            padding: 6,
            width: "100%"
          }}
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          onBlur={() => {
            if (isOwlbear) OBR.player.setName(playerName);
          }}
        />
      </section>

      <section style={card}>
        <div style={{ fontWeight: 600, marginBottom: 6 }}>Atributos (manuais)</div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "auto auto",
            gap: 8
          }}
        >
          {(Object.keys(ATTR_LABEL) as AttrKey[]).map((k) => (
            <label
              key={k}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8
              }}
            >
              <span style={{ width: 110 }}>{ATTR_LABEL[k]}</span>
              <input
                style={{
                  border: "1px solid #ccc",
                  borderRadius: 8,
                  padding: 6,
                  width: 80
                }}
                type="number"
                placeholder="10"
              />
            </label>
          ))}
        </div>
      </section>

      <section style={card}>
        <Roller
          onRoll={(attr, mod, r) => {
            const entry: LogEntry = {
              id: crypto.randomUUID(),
              who: playerName,
              what: ATTR_LABEL[attr],
              detail: `d20=${r.d} vs ${r.target} ${
                mod ? `(mod ${mod >= 0 ? "+" : ""}${mod})` : ""
              } → ${r.success ? "SUCESSO" : "FALHA"}`,
              ts: Date.now(),
            };

            if (isOwlbear) {
              sendAppend(entry);
            } else {
              // modo local: adiciona direto ao log
              setLog((old) => [...old, entry]);
            }
          }}
        />
      </section>

      <section style={card}>
        <div style={{ fontWeight: 600, marginBottom: 6 }}>
          Log de Rolagens (compartilhado)
        </div>
        <Log log={log} />
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button
            style={{
              border: "1px solid #ccc",
              borderRadius: 10,
              padding: "6px 10px",
              cursor: "pointer"
            }}
            onClick={async () => {
              if (isOwlbear) {
                await writeRoomLog([]);
                sendAppend({
                  id: crypto.randomUUID(),
                  who: "Sistema",
                  what: "Log",
                  detail: "Log limpo.",
                  ts: Date.now(),
                });
              } else {
                setLog([]);
              }
            }}
          >
            Limpar
          </button>
        </div>
      </section>
    </div>
  );
}
