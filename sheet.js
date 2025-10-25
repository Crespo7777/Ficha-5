// Espera o SDK carregar
OBR.onReady(async () => {
  const me = await OBR.player.getId();
  const myName = await OBR.player.getName();
  const channel = "symbaroum-ficha-chat";

  // Lógica da UI
  document.getElementById("rollAtaque").addEventListener("click", () => {
    const forca = Number(document.getElementById("forca").value) || 0;
    const result = rollDice(1, 20) + forca;
    const msg = `${myName} rola ATAQUE: 1d20 + ${forca} = **${result}**`;
    logMessage(msg);
    sendBroadcast(msg);
  });

  document.getElementById("rollTeste").addEventListener("click", () => {
    const des = Number(document.getElementById("destreza").value) || 0;
    const result = rollDice(1, 20) + des;
    const msg = `${myName} faz TESTE de Destreza: 1d20 + ${des} = **${result}**`;
    logMessage(msg);
    sendBroadcast(msg);
  });

  // Recebe mensagens de outros jogadores
  OBR.broadcast.onMessage(channel, (event) => {
    if (event.player.id !== me) {
      logMessage(event.data);
    }
  });

  function rollDice(qty, sides) {
    let total = 0;
    for (let i = 0; i < qty; i++) total += Math.floor(Math.random() * sides) + 1;
    return total;
  }

  function logMessage(text) {
    const chat = document.getElementById("chatLog");
    const p = document.createElement("p");
    p.innerHTML = `[${new Date().toLocaleTimeString()}] ${text}`;
    chat.appendChild(p);
    chat.scrollTop = chat.scrollHeight;
  }

  function sendBroadcast(message) {
    OBR.broadcast.sendMessage(channel, message, { destination: "ROOM" });
  }
});
