// Chaves de metadata (namespace para evitar colisão com outras extensões)
const NS = {
  PLAYER: "com.crespo.ficha5.player",
  ROOM: "com.crespo.ficha5.room"
};
// Canal do chat/rolagens
const CHANNEL = "com.crespo.ficha5.chat";

OBR.onReady(async () => {
  if (!OBR.isAvailable) {
    console.warn("Abra esta ficha dentro do Owlbear Rodeo.");
    return;
  }

  // Elementos
  const $for = get("#forca");
  const $des = get("#destreza");
  const $von = get("#vontade");
  const $salvar = get("#salvar");
  const $atk = get("#rollAtaque");
  const $tst = get("#rollTeste");
  const $expr = get("#expr");
  const $rlv = get("#rollLivre");
  const $log = get("#chatLog");
  const $msg = get("#msg");
  const $send = get("#enviar");
  const $clear = get("#limpar");

  // Carrega dados do jogador (atributos)
  await loadPlayerAttributes($for, $des, $von);

  // Carrega log do room (últimas mensagens)
  await loadRoomLog($log);

  // Eventos de UI
  $salvar.addEventListener("click", async () => {
    await savePlayerAttributes({
      forca: num($for.value), destreza: num($des.value), vontade: num($von.value)
    });
    toast($log, "Atributos salvos.");
  });

  const myName = await OBR.player.getName();
  const myId = await OBR.player.getId();

  $atk.addEventListener("click", () => {
    const bonus = num($for.value);
    const d = d20() + bonus;
    const text = `${myName} rola ATAQUE: 1d20 + ${bonus} = **${d}**`;
    appendLine($log, text);
    broadcast({ type: "roll", text });
    saveToRoomLog({ author: myName, text });
  });

  $tst.addEventListener("click", () => {
    const bonus = num($des.value);
    const d = d20() + bonus;
    const text = `${myName} TESTE de Destreza: 1d20 + ${bonus} = **${d}**`;
    appendLine($log, text);
    broadcast({ type: "roll", text });
    saveToRoomLog({ author: myName, text });
  });

  $rlv.addEventListener("click", () => {
    const expr = ($expr.value || "1d20").trim();
    try {
      const value = evalDice(expr);
      const text = `${myName} rola ${expr} = **${value.total}** ${value.breakdown}`;
      appendLine($log, text);
      broadcast({ type: "roll", text });
      saveToRoomLog({ author: myName, text });
    } catch (e) {
      appendLine($log, `Erro na expressão: ${expr}`);
    }
  });

  $send.addEventListener("click", () => {
    const txt = ($msg.value || "").trim();
    if (!txt) return;
    const line = `${myName}: ${txt}`;
    appendLine($log, line);
    broadcast({ type: "chat", text: line });
    saveToRoomLog({ author: myName, text: line });
    $msg.value = "";
  });

  $clear.addEventListener("click", async () => {
    // limpa apenas local
    $log.innerHTML = "";
    toast($log, "Log local limpo. (O histórico compartilhado permanece)");
  });

  // Receber mensagens de outros jogadores
  OBR.broadcast.onMessage(CHANNEL, (event) => {
    // Se vier de outro connectionId do mesmo usuário, também exibimos
    if (event.player.id === myId && event.player.connectionId === (OBR.player.connectionId || "")) return;
    const payload = event.data;
    if (!payload || !payload.text) return;
    appendLine($log, payload.text);
  });
});

/* --------- Helpers --------- */
function get(sel) { return document.querySelector(sel); }
function num(v) { return Number(v) || 0; }
function d20() { return Math.floor(Math.random() * 20) + 1; }

function appendLine(container, text) {
  const p = document.createElement("p");
  p.className = "chat-line";
  const time = new Date().toLocaleTimeString();
  p.innerHTML = `<span class="meta">[${time}]</span> ${text}`;
  container.appendChild(p);
  container.scrollTop = container.scrollHeight;
}
function toast(container, text) { appendLine(container, `<em>${text}</em>`); }

function broadcast(data) {
  try {
    OBR.broadcast.sendMessage(CHANNEL, data, { destination: "ROOM" });
  } catch (e) {
    console.warn("Falha no broadcast:", e);
  }
}

/* ---- Dice parser simples:  NdS(+|-)N  ex.: 2d8+3 ---- */
function evalDice(expr) {
  const cleaned = expr.replace(/\s+/g, "").toLowerCase();
  // suporta "NdS", "+/- N" e múltiplas partes: ex "2d6+1d4+2"
  const parts = cleaned.split(/(?=[+-])/);
  let total = 0;
  let bd = [];
  for (let part of parts) {
    if (!part) continue;
    let sign = 1;
    if (part[0] === "+") { part = part.slice(1); }
    else if (part[0] === "-") { sign = -1; part = part.slice(1); }

    const m = part.match(/^(\d*)d(\d+)$/);
    if (m) {
      const n = Number(m[1] || 1), s = Number(m[2]);
      const rolls = [];
      for (let i = 0; i < n; i++) rolls.push(Math.floor(Math.random() * s) + 1);
      const subtotal = rolls.reduce((a,b)=>a+b,0) * sign;
      total += subtotal;
      bd.push(`${sign<0?"-":""}[${rolls.join(",")}]d${s}`);
    } else {
      const flat = Number(part);
      if (isNaN(flat)) throw new Error("expr inválida");
      total += sign * flat;
      bd.push(`${sign<0?"-":"+"}${flat}`);
    }
  }
  return { total, breakdown: bd.length ? `(${bd.join(" ")})` : "" };
}

/* ---- Metadata (player & room) ---- */
async function loadPlayerAttributes($for, $des, $von) {
  try {
    const meta = await OBR.player.getMetadata();
    const me = meta[NS.PLAYER] || {};
    if (typeof me.forca === "number") $for.value = me.forca;
    if (typeof me.destreza === "number") $des.value = me.destreza;
    if (typeof me.vontade === "number") $von.value = me.vontade;
  } catch (e) { console.warn("getMetadata(player) falhou:", e); }
}
async function savePlayerAttributes(values) {
  try {
    await OBR.player.setMetadata({ [NS.PLAYER]: values });
  } catch (e) { console.warn("setMetadata(player) falhou:", e); }
}

async function loadRoomLog($log) {
  try {
    const meta = await OBR.room.getMetadata();
    const arr = meta[NS.ROOM]?.log || [];
    for (const line of arr) {
      appendLine($log, line.text);
    }
    // Atualiza em tempo real se outro jogador salvar no room
    OBR.room.onMetadataChange((m) => {
      const latest = m[NS.ROOM]?.log || [];
      // simples: renderiza do zero (mantendo curto)
      // (poderia otimizar diff se quiser)
    });
  } catch (e) { console.warn("getMetadata(room) falhou:", e); }
}
async function saveToRoomLog(entry) {
  try {
    const meta = await OBR.room.getMetadata();
    const prev = meta[NS.ROOM]?.log || [];
    const next = [...prev, entry].slice(-20); // guarda só ~20 mensagens
    await OBR.room.setMetadata({ [NS.ROOM]: { log: next } });
  } catch (e) { console.warn("setMetadata(room) falhou:", e); }
}
