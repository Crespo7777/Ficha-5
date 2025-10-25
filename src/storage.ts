import OBR from "./obr";

const META_KEY = "com.crespo7777.ficha5";
export type LogEntry = {
  id: string;
  who: string;
  what: string;
  detail: string;
  ts: number;
};

export type RoomMetadata = { log?: LogEntry[] };

export async function readRoomLog(): Promise<LogEntry[]> {
  try {
    const meta = await OBR.room.getMetadata();
    const data = (meta[META_KEY] as RoomMetadata | undefined) ?? {};
    return data.log ?? [];
  } catch {
    return [];
  }
}

export async function writeRoomLog(next: LogEntry[]) {
  const trimmed = next.slice(-50);
  await OBR.room.setMetadata({ [META_KEY]: { log: trimmed } as RoomMetadata });
}
