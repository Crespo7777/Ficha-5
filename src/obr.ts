// src/obr.ts
import OBR from "@owlbear-rodeo/sdk";

/** Retorna se o SDK do OBR está disponível (dentro do Owlbear Rodeo). */
export const isOwlbear = OBR.isAvailable;

/** Executa callback apenas quando o OBR estiver realmente pronto. */
export async function onObrReady(cb: () => void) {
  if (!isOwlbear) {
    console.log("[OBR] Executando fora do Owlbear (modo dev).");
    cb(); // executa direto para dev
    return;
  }
  OBR.onReady(cb);
}

export default OBR;
