import OBR from "./obr";
import type { LogEntry } from "./storage";

const CHANNEL = "com.crespo7777.ficha5/log";

export type BusEvent =
  | { type: "append-log"; entry: LogEntry }
  | { type: "replace-log"; entries: LogEntry[] };

export function sendAppend(entry: LogEntry) {
  OBR.broadcast.sendMessage(
    CHANNEL,
    { type: "append-log", entry } as BusEvent,
    { destination: "ALL" }
  );
}

export function onBus(cb: (e: BusEvent) => void) {
  return OBR.broadcast.onMessage(CHANNEL, (ev) => {
    cb(ev.data as BusEvent);
  });
}
