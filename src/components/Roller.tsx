import { useMemo, useState } from "react";
import { ATTR_LABEL, type AttrKey, rollUnder } from "../symbaroum";

type Props = {
  onRoll: (attr: AttrKey, mod: number, result: { d: number; target: number; success: boolean }) => void;
};

export function Roller({ onRoll }: Props) {
  const attrs = useMemo(() => Object.keys(ATTR_LABEL) as AttrKey[], []);
  const [attr, setAttr] = useState<AttrKey>("accurate");
  const [base, setBase] = useState<number>(10);
  const [mod, setMod] = useState<number>(0);

  const inputStyle: React.CSSProperties = { border: "1px solid #ccc", borderRadius: 8, padding: 6, width: 80 };

  return (
    <div>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>Rolagem (d20 ≤ Atributo)</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        <select style={inputStyle} value={attr} onChange={(e) => setAttr(e.target.value as AttrKey)}>
          {attrs.map((k) => (
            <option key={k} value={k}>{ATTR_LABEL[k]}</option>
          ))}
        </select>
        <input style={inputStyle} type="number" value={base} onChange={(e) => setBase(parseInt(e.target.value || "0"))} placeholder="Atributo" />
        <input style={inputStyle} type="number" value={mod} onChange={(e) => setMod(parseInt(e.target.value || "0"))} placeholder="Mod" />
      </div>
      <button
        style={{ marginTop: 8, border: "1px solid #ccc", borderRadius: 10, padding: "8px 12px", fontWeight: 600, cursor: "pointer" }}
        onClick={() => onRoll(attr, mod, rollUnder(base, mod))}
      >
        Rolar
      </button>
    </div>
  );
}
