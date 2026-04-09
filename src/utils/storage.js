// ── HeroDex Storage — IndexedDB with localStorage fallback ──
const DB_NAME = "herodex";
const STORE = "state";
const KEY = "hdx2";
const LS_KEY = "hdx2";

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

const storage = {
  async load() {
    try {
      // One-time migration from localStorage → IndexedDB
      const ls = localStorage.getItem(LS_KEY);
      if (ls) {
        const data = JSON.parse(ls);
        await this.save(data);
        localStorage.removeItem(LS_KEY);
        return data;
      }
      const db = await openDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE, "readonly");
        const req = tx.objectStore(STORE).get(KEY);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      });
    } catch {
      // Fallback to localStorage if IndexedDB unavailable
      try {
        const v = localStorage.getItem(LS_KEY);
        return v ? JSON.parse(v) : null;
      } catch { return null; }
    }
  },
  async save(state) {
    try {
      const db = await openDB();
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(state, KEY);
    } catch {
      try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch {}
    }
  },
  async clear() {
    try {
      const db = await openDB();
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).delete(KEY);
    } catch {}
    try { localStorage.removeItem(LS_KEY); } catch {}
  },
};

export default storage;
