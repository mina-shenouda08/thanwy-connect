import { supabase } from "@/integrations/supabase/client";

const DB_NAME = "thanwy-offline";
const STORE = "scans";

type PendingScan = {
  id?: number;
  event_id: string;
  student_id: string;
  recorded_by: string;
  checked_in_at: string;
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id", autoIncrement: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>) {
  const db = await openDb();
  return new Promise<T>((resolve, reject) => {
    const request = fn(db.transaction(STORE, mode).objectStore(STORE));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function queueScan(scan: PendingScan) {
  await tx("readwrite", (store) => store.add(scan));
}

export async function pendingCount() {
  try {
    return await tx<number>("readonly", (store) => store.count());
  } catch {
    return 0;
  }
}

export async function syncQueuedScans() {
  if (typeof indexedDB === "undefined" || !navigator.onLine) return 0;
  let synced = 0;
  const rows = await tx<PendingScan[]>("readonly", (store) => store.getAll());
  for (const row of rows) {
    const { id, ...payload } = row;
    const { error } = await supabase
      .from("attendance")
      .upsert({ ...payload, present: true }, { onConflict: "event_id,student_id" });
    if (!error && id !== undefined) {
      await tx("readwrite", (store) => store.delete(id));
      synced += 1;
    }
  }
  return synced;
}

export async function recordScan(scan: PendingScan) {
  if (!navigator.onLine) {
    await queueScan(scan);
    return { queued: true as const };
  }
  const { error } = await supabase
    .from("attendance")
    .upsert({ ...scan, present: true }, { onConflict: "event_id,student_id" });
  if (error) {
    await queueScan(scan);
    return { queued: true as const };
  }
  return { queued: false as const };
}