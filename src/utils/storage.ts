// ── HeroDex Storage — IndexedDB with localStorage fallback ──
import type { GameState } from '../types';

const DB_NAME = "herodex";
const STORE = "state";
const KEY = "hdx2";
const LS_KEY = "hdx2";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

const storage = {
  async load(): Promise<GameState | null> {
    try {
      // One-time migration from localStorage → IndexedDB
      const ls = localStorage.getItem(LS_KEY);
      if (ls) {
        const data = JSON.parse(ls) as GameState;
        await this.save(data);
        localStorage.removeItem(LS_KEY);
        return data;
      }
      const db = await openDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE, "readonly");
        const req = tx.objectStore(STORE).get(KEY);
        req.onsuccess = () => resolve((req.result as GameState) || null);
        req.onerror = () => resolve(null);
      });
    } catch {
      // Fallback to localStorage if IndexedDB unavailable
      try {
        const v = localStorage.getItem(LS_KEY);
        return v ? (JSON.parse(v) as GameState) : null;
      } catch { return null; }
    }
  },
  async save(state: GameState): Promise<void> {
    try {
      const db = await openDB();
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(state, KEY);
    } catch {
      try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch { /* storage full */ }
    }
  },
  async clear(): Promise<void> {
    try {
      const db = await openDB();
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).delete(KEY);
    } catch { /* ignore */ }
    try { localStorage.removeItem(LS_KEY); } catch { /* ignore */ }
  },
};

export default storage;
