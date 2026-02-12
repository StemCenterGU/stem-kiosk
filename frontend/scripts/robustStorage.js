// Robust Multi-Layer Storage System
// Uses IndexedDB (primary), localStorage (backup), and server sync

const DB_NAME = 'STEMKioskDB';
const DB_VERSION = 1;
const STORE_NAME = 'gameData';
const SERVER_BACKUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
const AUTO_EXPORT_INTERVAL = 30 * 60 * 1000; // 30 minutes

class RobustStorage {
  constructor() {
    this.db = null;
    this.initialized = false;
    this.syncTimer = null;
    this.exportTimer = null;
  }

  // Initialize IndexedDB
  async init() {
    if (this.initialized) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('IndexedDB failed to open, falling back to localStorage only');
        this.initialized = true;
        resolve();
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        this.initialized = true;
        console.log('✅ IndexedDB initialized successfully');

        // Start automatic backups
        this.startAutoBackup();
        this.startAutoExport();

        // Sync from IndexedDB to localStorage on startup
        this.syncToLocalStorage();

        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'key' });
          objectStore.createIndex('timestamp', 'timestamp', { unique: false });
          console.log('📦 IndexedDB object store created');
        }
      };
    });
  }

  // Save to all storage locations
  async save(key, data) {
    await this.init();

    const record = {
      key,
      value: JSON.stringify(data),
      timestamp: Date.now(),
      lastModified: new Date().toISOString()
    };

    // 1. Save to IndexedDB (primary)
    if (this.db) {
      try {
        const transaction = this.db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        await store.put(record);
        console.log(`💾 Saved to IndexedDB: ${key}`);
      } catch (error) {
        console.error('IndexedDB save failed:', error);
      }
    }

    // 2. Save to localStorage (backup)
    try {
      localStorage.setItem(key, JSON.stringify(data));
      console.log(`💾 Saved to localStorage: ${key}`);
    } catch (error) {
      console.error('localStorage save failed:', error);
    }

    // 3. Trigger server backup (async, non-blocking)
    this.scheduleServerBackup(key, data);

    return data;
  }

  // Load from storage (tries IndexedDB first, falls back to localStorage)
  async load(key) {
    await this.init();

    // Try IndexedDB first
    if (this.db) {
      try {
        const data = await this.getFromIndexedDB(key);
        if (data !== null) {
          console.log(`✅ Loaded from IndexedDB: ${key}`);
          return data;
        }
      } catch (error) {
        console.error('IndexedDB load failed:', error);
      }
    }

    // Fallback to localStorage
    try {
      const item = localStorage.getItem(key);
      if (item) {
        console.log(`✅ Loaded from localStorage: ${key}`);
        return JSON.parse(item);
      }
    } catch (error) {
      console.error('localStorage load failed:', error);
    }

    return null;
  }

  // Get data from IndexedDB
  getFromIndexedDB(key) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onsuccess = () => {
        if (request.result && request.result.value) {
          resolve(JSON.parse(request.result.value));
        } else {
          resolve(null);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  // Sync all data from IndexedDB to localStorage
  async syncToLocalStorage() {
    if (!this.db) return;

    try {
      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const records = request.result;
        records.forEach(record => {
          try {
            localStorage.setItem(record.key, record.value);
          } catch (e) {
            console.error('Sync to localStorage failed for:', record.key);
          }
        });
        console.log(`🔄 Synced ${records.length} records to localStorage`);
      };
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }

  // Schedule server backup (debounced)
  scheduleServerBackup(key, data) {
    // Clear existing timer
    if (this.syncTimer) {
      clearTimeout(this.syncTimer);
    }

    // Schedule backup in 5 seconds (debounced)
    this.syncTimer = setTimeout(() => {
      this.backupToServer();
    }, 5000);
  }

  // Backup all data to server
  async backupToServer() {
    try {
      const allData = await this.getAllData();

      const response = await fetch('/__backup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          data: allData
        })
      });

      if (response.ok) {
        console.log('☁️ Data backed up to server successfully');
      } else {
        console.warn('Server backup failed (non-critical)');
      }
    } catch (error) {
      // Server backup is optional, don't fail if it's not available
      console.log('Server backup unavailable (running offline)');
    }
  }

  // Get all data from storage
  async getAllData() {
    await this.init();

    const allData = {};

    // Get from IndexedDB
    if (this.db) {
      try {
        const transaction = this.db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        await new Promise((resolve) => {
          request.onsuccess = () => {
            request.result.forEach(record => {
              allData[record.key] = JSON.parse(record.value);
            });
            resolve();
          };
        });
      } catch (error) {
        console.error('Failed to get IndexedDB data:', error);
      }
    }

    // Merge with localStorage (in case IndexedDB missed anything)
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!allData[key]) {
        try {
          allData[key] = JSON.parse(localStorage.getItem(key));
        } catch (e) {
          // Skip non-JSON data
        }
      }
    }

    return allData;
  }

  // Export all data to file (download)
  async exportToFile() {
    const allData = await this.getAllData();
    const dataStr = JSON.stringify(allData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stem-kiosk-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    console.log('📥 Data exported to file');
  }

  // Start automatic backup to server
  startAutoBackup() {
    // Backup to server every 5 minutes
    setInterval(() => {
      this.backupToServer();
    }, SERVER_BACKUP_INTERVAL);
  }

  // Start automatic export to file
  startAutoExport() {
    // Auto-export to file every 30 minutes
    setInterval(() => {
      this.exportToFile();
    }, AUTO_EXPORT_INTERVAL);
  }

  // Import data from backup
  async importData(data) {
    await this.init();

    for (const [key, value] of Object.entries(data)) {
      await this.save(key, value);
    }

    console.log('📤 Data imported successfully');
  }

  // Restore from server
  async restoreFromServer() {
    try {
      const response = await fetch('/__restore');
      if (response.ok) {
        const backup = await response.json();
        await this.importData(backup.data);
        console.log('☁️ Data restored from server');
        return true;
      }
    } catch (error) {
      console.error('Failed to restore from server:', error);
    }
    return false;
  }
}

// Create singleton instance
const robustStorage = new RobustStorage();

// Initialize on load
robustStorage.init().catch(console.error);

export default robustStorage;
