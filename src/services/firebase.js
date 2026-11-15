import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs,
  getDoc,
  onSnapshot, 
  query, 
  orderBy, 
  writeBatch,
  serverTimestamp 
} from 'firebase/firestore';

// Konfigurasi Default Firebase Resmi Proyek
export const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyDYRVySz99SAQhzTKt9WTWQLhHy1uEuXjw",
  authDomain: "undangan-digital-ridwan.firebaseapp.com",
  projectId: "undangan-digital-ridwan",
  storageBucket: "undangan-digital-ridwan.firebasestorage.app",
  messagingSenderId: "53929332418",
  appId: "1:53929332418:web:e8b01af7cf674e3c94355b",
  measurementId: "G-51M5BQC6XT"
};

// Helper retrieve config from localStorage or Vite ENV or Default Config
export const getActiveFirebaseConfig = () => {
  const localSaved = localStorage.getItem('wedding_firebase_config');
  if (localSaved) {
    try {
      const parsed = JSON.parse(localSaved);
      if (parsed.projectId && parsed.apiKey) {
        return parsed;
      }
    } catch (e) {}
  }

  if (import.meta.env.VITE_FIREBASE_PROJECT_ID && import.meta.env.VITE_FIREBASE_API_KEY) {
    return {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
    };
  }

  return DEFAULT_FIREBASE_CONFIG;
};

// Singleton instances
let firebaseApp = null;
let firestoreDb = null;

export const initFirebase = (customConfig = null) => {
  try {
    const config = customConfig || getActiveFirebaseConfig();
    if (!config || !config.projectId) {
      return null;
    }

    if (getApps().length === 0) {
      firebaseApp = initializeApp(config);
    } else {
      firebaseApp = getApp();
    }

    firestoreDb = getFirestore(firebaseApp);
    return firestoreDb;
  } catch (error) {
    console.warn('Gagal inisialisasi Firebase:', error);
    return null;
  }
};

export const getDb = () => {
  if (!firestoreDb) {
    return initFirebase();
  }
  return firestoreDb;
};

export const isCloudConnected = () => {
  return Boolean(getDb());
};

// Safe Formatter: Memastikan nilai waktu selalu bertipe string aman untuk render React
export const formatWishTime = (val, localFallback = 'Baru saja') => {
  if (!val) return localFallback;
  if (typeof val === 'string') return val;
  if (typeof val?.toDate === 'function') {
    try {
      return val.toDate().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
    } catch (e) {
      return localFallback;
    }
  }
  if (val?.seconds) {
    try {
      return new Date(val.seconds * 1000).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
    } catch (e) {
      return localFallback;
    }
  }
  return localFallback;
};

// ===============================================================
// 1. UCAPAN & DOA REALTIME (GLOBAL COLLECTION: 'wishes')
// Struktur Field: nama, kehadiran, ucapan, createdAt, isPinned, replyMessage
// Realtime Listener: onSnapshot dengan orderBy('createdAt', 'desc')
// ===============================================================

export const subscribeToWishes = (onSuccess, onError) => {
  const db = getDb();
  if (!db) {
    // Fallback: baca dari localStorage jika belum terkoneksi Firebase
    const saved = localStorage.getItem('wedding_wishes');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          onSuccess(parsed.map(w => ({
            ...w,
            createdAt: formatWishTime(w.createdAt, w.createdAtLocal || 'Baru saja')
          })));
        }
      } catch (e) {}
    }
    return () => {};
  }

  try {
    // Query realtime terurut waktu terbaru
    const q = query(collection(db, 'wishes'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const wishes = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const sender = data.nama || data.senderName || 'Tamu Undangan';
          const badge = data.kehadiran || data.attendanceBadge || 'Hadir';
          const msg = data.ucapan || data.message || '';
          const timeFormatted = formatWishTime(data.createdAt, data.createdAtLocal || 'Baru saja');

          wishes.push({
            ...data,
            id: docSnap.id,
            nama: sender,
            kehadiran: badge,
            ucapan: msg,
            senderName: sender,
            attendanceBadge: badge,
            message: msg,
            replyMessage: data.replyMessage || null,
            isPinned: Boolean(data.isPinned),
            createdAt: String(timeFormatted), // WAJIB STRING agar React tidak crash
            createdAtLocal: String(timeFormatted)
          });
        });

        // Backup lokal
        localStorage.setItem('wedding_wishes', JSON.stringify(wishes));
        window.dispatchEvent(new Event('wedding_wishes_updated'));
        onSuccess(wishes);
      },
      (err) => {
        console.error('Realtime Wishes error (onSnapshot):', err);
        if (onError) onError(err);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.error('Error subscribeToWishes:', err);
    return () => {};
  }
};

export const addWishCloud = async (wish) => {
  const db = getDb();
  const nama = wish.nama || wish.senderName || '';
  const kehadiran = wish.kehadiran || wish.attendanceBadge || 'Hadir';
  const ucapan = wish.ucapan || wish.message || '';
  const docId = wish.id || ('wish-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6));

  const currentTimeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';

  // 1. Simpan ke local storage dengan createdAt bertipe string (TIDAK BOLEH objek serverTimestamp di lokal!)
  const localWishItem = {
    id: docId,
    nama: nama,
    kehadiran: kehadiran,
    ucapan: ucapan,
    senderName: nama,
    attendanceBadge: kehadiran,
    message: ucapan,
    replyMessage: wish.replyMessage || null,
    isPinned: Boolean(wish.isPinned),
    createdAt: currentTimeStr, // STRING!
    createdAtLocal: currentTimeStr
  };

  const saved = localStorage.getItem('wedding_wishes');
  let currentList = [];
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        currentList = parsed.map(w => ({
          ...w,
          createdAt: typeof w.createdAt === 'string' ? w.createdAt : currentTimeStr
        }));
      }
    } catch (e) {}
  }
  const updatedList = [localWishItem, ...currentList.filter(w => w.id !== docId)];
  localStorage.setItem('wedding_wishes', JSON.stringify(updatedList));
  window.dispatchEvent(new Event('wedding_wishes_updated'));

  // 2. Sinkronkan ke Firebase Firestore Global Path 'wishes' dengan serverTimestamp()
  if (db) {
    try {
      const docRef = doc(db, 'wishes', String(docId));
      await setDoc(docRef, {
        nama: nama,
        kehadiran: kehadiran,
        ucapan: ucapan,
        senderName: nama,
        attendanceBadge: kehadiran,
        message: ucapan,
        replyMessage: wish.replyMessage || null,
        isPinned: Boolean(wish.isPinned),
        createdAt: serverTimestamp(),
        createdAtLocal: currentTimeStr
      }, { merge: true });
    } catch (err) {
      console.error('Gagal kirim ucapan ke Firebase Firestore:', err);
    }
  }
};

export const updateWishCloud = async (wishId, updates) => {
  const db = getDb();

  // Update local
  const saved = localStorage.getItem('wedding_wishes');
  if (saved) {
    try {
      const list = JSON.parse(saved);
      const updated = list.map(w => w.id === wishId ? { ...w, ...updates } : w);
      localStorage.setItem('wedding_wishes', JSON.stringify(updated));
      window.dispatchEvent(new Event('wedding_wishes_updated'));
    } catch (e) {}
  }

  // Update cloud
  if (db) {
    try {
      const docRef = doc(db, 'wishes', String(wishId));
      await updateDoc(docRef, updates);
    } catch (err) {
      console.error('Gagal update ucapan di Firebase:', err);
    }
  }
};

export const deleteWishCloud = async (wishId) => {
  const db = getDb();

  // Delete local
  const saved = localStorage.getItem('wedding_wishes');
  if (saved) {
    try {
      const list = JSON.parse(saved);
      const updated = list.filter(w => w.id !== wishId);
      localStorage.setItem('wedding_wishes', JSON.stringify(updated));
      window.dispatchEvent(new Event('wedding_wishes_updated'));
    } catch (e) {}
  }

  // Delete cloud
  if (db) {
    try {
      const docRef = doc(db, 'wishes', String(wishId));
      await deleteDoc(docRef);
    } catch (err) {
      console.error('Gagal hapus ucapan dari Firebase:', err);
    }
  }
};

// ===============================================================
// 2. DAFTAR TAMU & IMPORT EXCEL REALTIME (GLOBAL COLLECTION: 'guests')
// Tersinkronisasi lintas akun Google tanpa reload
// Mekanisme Batch Overwrite saat import Excel baru
// ===============================================================

// Helper konversi format nomor HP ke format standar WhatsApp Internasional (628xxxx)
export const formatPhoneNumber = (val) => {
  if (!val) return '';
  let str = String(val).trim().replace(/[^0-9]/g, '');
  if (!str) return '';
  // Hapus awalan 620 jika user tidak sengaja mengetik 6208...
  if (str.startsWith('620')) {
    str = '62' + str.substring(3);
  } else if (str.startsWith('0')) {
    // 0813... -> 62813...
    str = '62' + str.substring(1);
  } else if (str.startsWith('8')) {
    // 813... -> 62813...
    str = '62' + str;
  } else if (!str.startsWith('62') && str.length >= 9) {
    str = '62' + str;
  }
  return str;
};

export const subscribeToGuests = (onSuccess, onError) => {
  const db = getDb();
  if (!db) {
    const saved = localStorage.getItem('admin_guest_list');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const validList = parsed
            .filter(g => g && g.name && typeof g.name === 'string' && !g.pin && !String(g.id).includes('pin'))
            .map(g => ({ ...g, name: String(g.name).trim(), phone: formatPhoneNumber(g?.phone) }));
          onSuccess(validList);
        }
      } catch (e) {}
    }
    return () => {};
  }

  try {
    const q = query(collection(db, 'guests'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const guests = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          // Filter ketat: Pastikan HANYA dokumen tamu asli dengan nama yang valid
          if (
            !data || 
            !data.name || 
            typeof data.name !== 'string' || 
            data.name.trim() === '' || 
            data.name === '__SYSTEM_PIN__' || 
            data.pin || 
            docSnap.id === 'system_pin' || 
            docSnap.id.includes('pin') || 
            docSnap.id.startsWith('__')
          ) {
            return;
          }

          guests.push({
            id: docSnap.id,
            ...data,
            name: String(data.name).trim(),
            phone: formatPhoneNumber(data?.phone)
          });
        });

        // Backup ke localStorage
        localStorage.setItem('admin_guest_list', JSON.stringify(guests));
        window.dispatchEvent(new Event('admin_guest_list_updated'));
        onSuccess(guests);
      },
      (err) => {
        console.error('Realtime Guests error (onSnapshot):', err);
        if (onError) onError(err);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.error('Error subscribeToGuests:', err);
    return () => {};
  }
};

// Simpan/tambah single guest
export const saveGuestCloud = async (guest) => {
  const db = getDb();
  const sanitizedGuest = {
    ...guest,
    phone: formatPhoneNumber(guest?.phone)
  };

  // Update local
  const saved = localStorage.getItem('admin_guest_list');
  let currentList = [];
  if (saved) {
    try { currentList = JSON.parse(saved); } catch (e) {}
  }
  const updatedList = [sanitizedGuest, ...currentList.filter(g => g.id !== sanitizedGuest.id)];
  localStorage.setItem('admin_guest_list', JSON.stringify(updatedList));
  window.dispatchEvent(new Event('admin_guest_list_updated'));

  // Update cloud
  if (db) {
    try {
      const docRef = doc(db, 'guests', String(sanitizedGuest.id));
      await setDoc(docRef, { ...sanitizedGuest, updatedAt: serverTimestamp() }, { merge: true });
    } catch (err) {
      console.error('Gagal simpan tamu ke Firebase:', err);
    }
  }
};

// Update status tamu (misal: isSent WhatsApp atau RSVP)
export const updateGuestCloud = async (guestId, updates) => {
  const db = getDb();

  // Local update
  const saved = localStorage.getItem('admin_guest_list');
  if (saved) {
    try {
      const list = JSON.parse(saved);
      const updated = list.map(g => g.id === guestId ? { ...g, ...updates } : g);
      localStorage.setItem('admin_guest_list', JSON.stringify(updated));
      window.dispatchEvent(new Event('admin_guest_list_updated'));
    } catch (e) {}
  }

  // Cloud update
  if (db) {
    try {
      const docRef = doc(db, 'guests', String(guestId));
      await updateDoc(docRef, { ...updates, updatedAt: serverTimestamp() });
    } catch (err) {
      console.error('Gagal update status tamu di Firebase:', err);
    }
  }
};

// MEKANISME REPLACE / BATCH OVERWRITE FILE EXCEL:
// Menghapus data tamu lama di Firebase dan menulis seluruh data tamu baru dari file Excel
export const replaceAllGuestsCloud = async (newGuests) => {
  const db = getDb();
  const sanitizedGuests = (newGuests || []).map(g => ({
    ...g,
    phone: formatPhoneNumber(g?.phone)
  }));

  // Update local storage
  localStorage.setItem('admin_guest_list', JSON.stringify(sanitizedGuests));
  localStorage.setItem('last_imported_excel_guests', JSON.stringify(sanitizedGuests));
  window.dispatchEvent(new Event('admin_guest_list_updated'));

  if (!db || !Array.isArray(sanitizedGuests)) return;

  try {
    // 1. Ambil seluruh data tamu lama di collection 'guests'
    const snapshot = await getDocs(collection(db, 'guests'));
    
    // 2. Batch Delete seluruh tamu lama (per batch maksimal 450 item)
    const BATCH_LIMIT = 450;
    let batch = writeBatch(db);
    let operationCount = 0;

    for (const docSnap of snapshot.docs) {
      if (docSnap.id === 'system_pin' || docSnap.id.startsWith('__system_')) continue;
      batch.delete(docSnap.ref);
      operationCount++;
      if (operationCount >= BATCH_LIMIT) {
        await batch.commit();
        batch = writeBatch(db);
        operationCount = 0;
      }
    }
    if (operationCount > 0) {
      await batch.commit();
      batch = writeBatch(db);
      operationCount = 0;
    }

    // 3. Batch Set seluruh tamu baru dari file Excel
    for (const guest of sanitizedGuests) {
      const guestRef = doc(db, 'guests', String(guest.id));
      batch.set(guestRef, {
        ...guest,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      operationCount++;
      if (operationCount >= BATCH_LIMIT) {
        await batch.commit();
        batch = writeBatch(db);
        operationCount = 0;
      }
    }
    if (operationCount > 0) {
      await batch.commit();
    }

    console.log(`Berhasil overwrite & sinkronisasi ${sanitizedGuests.length} tamu Excel ke Firebase Firestore.`);
  } catch (err) {
    console.error('Gagal batch overwrite tamu ke Firebase:', err);
    throw err;
  }
};

export const deleteGuestCloud = async (guestId) => {
  const db = getDb();

  // Local delete
  const saved = localStorage.getItem('admin_guest_list');
  if (saved) {
    try {
      const list = JSON.parse(saved);
      const updated = list.filter(g => g.id !== guestId);
      localStorage.setItem('admin_guest_list', JSON.stringify(updated));
      window.dispatchEvent(new Event('admin_guest_list_updated'));
    } catch (e) {}
  }

  // Cloud delete
  if (db) {
    try {
      const docRef = doc(db, 'guests', String(guestId));
      await deleteDoc(docRef);
    } catch (err) {
      console.error('Gagal hapus tamu dari Firebase:', err);
    }
  }
};

// ===============================================================
// 3. PIN KEAMANAN ADMIN REALTIME (GLOBAL DOC: 'guests/system_pin')
// Menggunakan collection 'guests' yang sudah diizinkan di Security Rules
// ===============================================================

export const getAdminPinCloud = async () => {
  const db = getDb();
  if (!db) {
    return localStorage.getItem('wedding_admin_pin') || '0202';
  }

  try {
    const docRef = doc(db, 'guests', 'system_pin');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data && data.pin) {
        const pinStr = String(data.pin).trim();
        localStorage.setItem('wedding_admin_pin', pinStr);
        window.dispatchEvent(new Event('wedding_admin_pin_updated'));
        return pinStr;
      }
    }
  } catch (err) {
    console.error('Error getAdminPinCloud:', err);
  }

  return localStorage.getItem('wedding_admin_pin') || '0202';
};

export const subscribeToAdminPin = (onSuccess, onError) => {
  const db = getDb();
  if (!db) {
    const savedPin = localStorage.getItem('wedding_admin_pin') || '0202';
    onSuccess(savedPin);
    return () => {};
  }

  try {
    const docRef = doc(db, 'guests', 'system_pin');
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data && data.pin) {
            const pinStr = String(data.pin).trim();
            localStorage.setItem('wedding_admin_pin', pinStr);
            window.dispatchEvent(new Event('wedding_admin_pin_updated'));
            onSuccess(pinStr);
          }
        }
      },
      (err) => {
        console.error('Realtime PIN error (onSnapshot):', err);
        if (onError) onError(err);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.error('Error subscribeToAdminPin:', err);
    return () => {};
  }
};

export const saveAdminPinCloud = async (newPin) => {
  const pinStr = String(newPin).trim();
  localStorage.setItem('wedding_admin_pin', pinStr);
  window.dispatchEvent(new Event('wedding_admin_pin_updated'));

  const db = getDb();
  if (!db) {
    throw new Error('Koneksi Firebase Database belum terhubung');
  }

  try {
    const docRef = doc(db, 'guests', 'system_pin');
    await setDoc(docRef, {
      id: 'system_pin',
      pin: pinStr,
      updatedAt: serverTimestamp()
    }, { merge: true });
    console.log('PIN Admin berhasil disinkronkan ke Cloud Firestore:', pinStr);
    return true;
  } catch (err) {
    console.error('Gagal menyimpan PIN Admin ke Cloud:', err);
    throw err;
  }
};
