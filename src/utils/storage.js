const STORAGE_KEY = "hdx2";

const storage = {
  load() {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      return v ? JSON.parse(v) : null;
    } catch (e) {
      return null;
    }
  },
  save(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) { /* silent fail */ }
  },
  clear() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) { /* silent fail */ }
  },
};

export default storage;
