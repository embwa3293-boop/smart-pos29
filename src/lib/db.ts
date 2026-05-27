// ============================================================
//  db.ts — IndexedDB لحفظ كل بيانات النظام
// ============================================================

const DB_NAME = 'haddali_pos';
const DB_VERSION = 1;

let _db: IDBDatabase | null = null;

// ── الـ stores الموجودة في قاعدة البيانات ──────────────────
const STORES = [
  'products',       // المنتجات
  'sales',          // الفواتير
  'saleItems',      // بنود الفواتير
  'customers',      // العملاء
  'codes',          // كودات الدخول
  'suppliers',      // الموردين
  'purchases',      // مشتريات
  'shifts',         // الشيفتات
  'stockMovements', // حركة المخزون
  'expenses',       // المصروفات
  'auditLog',       // سجل التغييرات
  'settings',       // إعدادات النظام
] as const;

export type StoreName = typeof STORES[number];

// ── فتح قاعدة البيانات ──────────────────────────────────────
export async function ensureDB(): Promise<IDBDatabase> {
  if (_db) return _db;

  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      STORES.forEach((storeName) => {
        if (!db.objectStoreNames.contains(storeName)) {
          const store = db.createObjectStore(storeName, {
            keyPath: 'id',
            autoIncrement: storeName !== 'settings' && storeName !== 'codes',
          });
          // إضافة indexes مهمة
          if (storeName === 'products') {
            store.createIndex('barcode', 'barcode', { unique: true });
            store.createIndex('category', 'category');
          }
          if (storeName === 'sales') {
            store.createIndex('date', 'date');
          }
          if (storeName === 'codes') {
            store.createIndex('type', 'type');
          }
        }
      });
    };

    req.onsuccess = (e) => {
      _db = (e.target as IDBOpenDBRequest).result;
      resolve(_db);
    };

    req.onerror = () => reject(req.error);
  });
}

// ── CRUD عام ────────────────────────────────────────────────
export async function getAll<T>(storeName: StoreName): Promise<T[]> {
  const db = await ensureDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const req = tx.objectStore(storeName).getAll();
    req.onsuccess = () => resolve(req.result as T[]);
    req.onerror = () => reject(req.error);
  });
}

export async function getById<T>(storeName: StoreName, id: string | number): Promise<T | undefined> {
  const db = await ensureDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const req = tx.objectStore(storeName).get(id);
    req.onsuccess = () => resolve(req.result as T);
    req.onerror = () => reject(req.error);
  });
}

export async function putItem<T extends { id?: string | number }>(
  storeName: StoreName,
  item: T
): Promise<T> {
  const db = await ensureDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const req = tx.objectStore(storeName).put(item);
    req.onsuccess = () => resolve({ ...item, id: req.result } as T);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteItem(storeName: StoreName, id: string | number): Promise<void> {
  const db = await ensureDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const req = tx.objectStore(storeName).delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getByIndex<T>(
  storeName: StoreName,
  indexName: string,
  value: string | number
): Promise<T[]> {
  const db = await ensureDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const index = tx.objectStore(storeName).index(indexName);
    const req = index.getAll(value);
    req.onsuccess = () => resolve(req.result as T[]);
    req.onerror = () => reject(req.error);
  });
}

// ── تحميل البيانات الأولية إذا كانت قاعدة البيانات فارغة ──
export async function seedIfEmpty(): Promise<void> {
  const db = await ensureDB();
  const existing = await getAll('products');
  if (existing.length > 0) return; // موجودة بالفعل

  const { products, customers } = await import('@/data/mockData');

  // حفظ المنتجات
  const tx1 = db.transaction('products', 'readwrite');
  const store1 = tx1.objectStore('products');
  for (const p of products) {
    store1.put(p);
  }

  // حفظ العملاء
  const tx2 = db.transaction('customers', 'readwrite');
  const store2 = tx2.objectStore('customers');
  for (const c of customers) {
    store2.put(c);
  }

  // الإعدادات الافتراضية
  const tx3 = db.transaction('settings', 'readwrite');
  tx3.objectStore('settings').put({
    id: 'storeInfo',
    name: 'حضّالي للمستلزمات الطبية',
    phone: '01001234567',
    address: 'القاهرة، مصر',
    taxNumber: '',
    footer: 'شكراً لزيارتكم',
    logo: '',
  });
}
