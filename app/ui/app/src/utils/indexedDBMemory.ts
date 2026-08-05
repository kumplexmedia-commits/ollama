export interface MemoryConfig {
  shortTermEnabled: boolean;
  shortTermMaxItems: number;
  shortTermTTLMinutes: number;
  longTermEnabled: boolean;
  longTermMaxItems: number;
  longTermAutoSummarize: boolean;
}

export const DEFAULT_MEMORY_CONFIG: MemoryConfig = {
  shortTermEnabled: true,
  shortTermMaxItems: 50,
  shortTermTTLMinutes: 120,
  longTermEnabled: true,
  longTermMaxItems: 1000,
  longTermAutoSummarize: true,
};

const CONFIG_STORAGE_KEY = "qhysync_memory_config";
const SHORT_TERM_DB_NAME = "QhySync_ShortTermMemory_DB";
const LONG_TERM_DB_NAME = "QhySync_LongTermMemory_DB";
const STORE_NAME = "memory_store";

// Load configuration from localStorage
export function getMemoryConfig(): MemoryConfig {
  try {
    const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (saved) return { ...DEFAULT_MEMORY_CONFIG, ...JSON.parse(saved) };
  } catch {
    // fallback
  }
  return DEFAULT_MEMORY_CONFIG;
}

// Save configuration to localStorage
export function saveMemoryConfig(config: Partial<MemoryConfig>): MemoryConfig {
  const current = getMemoryConfig();
  const updated = { ...current, ...config };
  localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

// Open IndexedDB database helper
function openDB(dbName: string): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB is not supported in this environment."));
      return;
    }
    const request = window.indexedDB.open(dbName, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Get DB stats (item count, approximate size in bytes)
export async function getDBStats(dbName: string): Promise<{ count: number; sizeBytes: number }> {
  try {
    const db = await openDB(dbName);
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const items = req.result || [];
        const sizeBytes = new Blob([JSON.stringify(items)]).size;
        resolve({ count: items.length, sizeBytes });
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return { count: 0, sizeBytes: 0 };
  }
}

// Clear all items in IndexedDB database
export async function clearDB(dbName: string): Promise<void> {
  const db = await openDB(dbName);
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// Public API for Short Term Memory
export async function getShortTermStats() {
  return getDBStats(SHORT_TERM_DB_NAME);
}

export async function clearShortTermMemory() {
  return clearDB(SHORT_TERM_DB_NAME);
}

// Public API for Long Term Memory
export async function getLongTermStats() {
  return getDBStats(LONG_TERM_DB_NAME);
}

export async function clearLongTermMemory() {
  return clearDB(LONG_TERM_DB_NAME);
}
