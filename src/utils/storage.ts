// ── Ronki Storage — IndexedDB local + Supabase cloud sync ──
//
// EXPERIMENT BRANCH NOTE (drachennest): the storage names are namespaced
// with "_drachennest" so this branch's saves stay isolated from main/dev
// when both are served from the same origin (e.g. iamyaws.github.io/Ronki/dev/
// vs /Ronki/experiment/). The Drachennest reframe can be tested in parallel
// without clobbering Louis's existing dev state. When the experiment
// merges back to main the suffix gets removed in the same commit.
import type { GameState } from '../types';
import { supabase } from '../lib/supabase';

const DB_NAME = "herodex_drachennest";
const STORE = "state";
const KEY = "hdx2_drachennest";
const LS_KEY = "hdx2_drachennest";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

const storage = {
  // ── Local (IndexedDB with localStorage fallback) ──
  async load(): Promise<GameState | null> {
    try {
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

  // ── Cloud (Supabase) ──
  async cloudLoad(userId: string): Promise<GameState | null> {
    try {
      const { data, error } = await supabase
        .from('game_state')
        .select('state')
        .eq('user_id', userId)
        .single();
      if (error || !data) return null;
      return data.state as GameState;
    } catch {
      return null;
    }
  },

  async cloudSave(userId: string, state: GameState): Promise<void> {
    try {
      await supabase
        .from('game_state')
        .upsert({
          user_id: userId,
          state,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });
    } catch {
      // Silent fail — local IndexedDB is the fallback
    }
  },

  // ── Sync: resolve local vs cloud, return best state ──
  async syncLoad(userId: string): Promise<GameState | null> {
    const [local, cloud] = await Promise.all([
      this.load(),
      this.cloudLoad(userId),
    ]);

    if (cloud && local) {
      // Pick whichever has the more recent date, fallback to cloud
      const cloudDate = (cloud as any).lastDate || '';
      const localDate = (local as any).lastDate || '';
      if (localDate > cloudDate) {
        // Local is newer — push to cloud
        this.cloudSave(userId, local);
        return local;
      }
      // Cloud wins — cache locally
      this.save(cloud);
      return cloud;
    }

    if (local && !cloud) {
      // First login with existing local data — migrate to cloud
      this.cloudSave(userId, local);
      return local;
    }

    if (cloud && !local) {
      // New device — cache cloud data locally
      this.save(cloud);
      return cloud;
    }

    return null; // Fresh user, no data anywhere
  },
};

export default storage;
