import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  writeBatch 
} from 'firebase/firestore';

// Helper retrieve config from localStorage or Vite ENV
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

  return null;
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

// ==========================================
// 1. WISHES / UCAPAN REALTIME LISTENERS
// ==========================================

export const subscribeToWishes = (onSuccess, onError) => {
  const db = getDb();
  if (!db) {
    // Fallback: Read from localStorage
    const saved = localStorage.getItem('wedding_wishes');
    if (saved) {
      try {
        onSuccess(JSON.parse(saved));
      } catch (e) {}
    }
    return () => {};
  }

  try {
    const q = query(collection(db, 'wishes'), orderBy('createdAtTimestamp', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const wishes = [];
        snapshot.forEach((docSnap) => {
          wishes.push({ id: docSnap.id, ...docSnap.data() });
        });

        // Also backup to localStorage
        localStorage.setItem('wedding_wishes', JSON.stringify(wishes));
        window.dispatchEvent(new Event('wedding_wishes_updated'));
        onSuccess(wishes);
      },
      (err) => {
        console.error('Realtime Wishes error:', err);
        if (onError) onError(err);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.error('Error subscribe to wishes:', err);
    return () => {};
  }
};

export const addWishCloud = async (wish) => {
  const db = getDb();
  const wishData = {
    ...wish,
    createdAtTimestamp: Date.now()
  };

  // Always save to localStorage immediately
  const saved = localStorage.getItem('wedding_wishes');
  let currentList = [];
  if (saved) {
    try { currentList = JSON.parse(saved); } catch (e) {}
  }
  const updatedList = [wishData, ...currentList.filter(w => w.id !== wish.id)];
  localStorage.setItem('wedding_wishes', JSON.stringify(updatedList));
  window.dispatchEvent(new Event('wedding_wishes_updated'));

  // Sync to Cloud
  if (db) {
    try {
      const docRef = doc(db, 'wishes', String(wish.id));
      await setDoc(docRef, wishData, { merge: true });
    } catch (err) {
      console.error('Gagal simpan ucapan ke cloud:', err);
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
      console.error('Gagal update ucapan di cloud:', err);
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
      console.error('Gagal hapus ucapan dari cloud:', err);
    }
  }
};

// ==========================================
// 2. GUESTS / DAFTAR TAMU REALTIME LISTENERS
// ==========================================

export const subscribeToGuests = (onSuccess, onError) => {
  const db = getDb();
  if (!db) {
    const saved = localStorage.getItem('admin_guest_list');
    if (saved) {
      try {
        onSuccess(JSON.parse(saved));
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
          guests.push({ id: docSnap.id, ...docSnap.data() });
        });

        // Backup to localStorage
        localStorage.setItem('admin_guest_list', JSON.stringify(guests));
        window.dispatchEvent(new Event('admin_guest_list_updated'));
        onSuccess(guests);
      },
      (err) => {
        console.error('Realtime Guests error:', err);
        if (onError) onError(err);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.error('Error subscribe to guests:', err);
    return () => {};
  }
};

export const saveGuestCloud = async (guest) => {
  const db = getDb();

  // Local update
  const saved = localStorage.getItem('admin_guest_list');
  let currentList = [];
  if (saved) {
    try { currentList = JSON.parse(saved); } catch (e) {}
  }
  const updatedList = [guest, ...currentList.filter(g => g.id !== guest.id)];
  localStorage.setItem('admin_guest_list', JSON.stringify(updatedList));
  window.dispatchEvent(new Event('admin_guest_list_updated'));

  // Cloud update
  if (db) {
    try {
      const docRef = doc(db, 'guests', String(guest.id));
      await setDoc(docRef, guest, { merge: true });
    } catch (err) {
      console.error('Gagal simpan tamu ke cloud:', err);
    }
  }
};

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
      await updateDoc(docRef, updates);
    } catch (err) {
      console.error('Gagal update tamu di cloud:', err);
    }
  }
};

export const syncAllGuestsCloud = async (guests) => {
  const db = getDb();

  // Local update
  localStorage.setItem('admin_guest_list', JSON.stringify(guests));
  localStorage.setItem('last_imported_excel_guests', JSON.stringify(guests));
  window.dispatchEvent(new Event('admin_guest_list_updated'));

  // Cloud Batch Write
  if (db && Array.isArray(guests)) {
    try {
      const batch = writeBatch(db);
      guests.forEach((guest) => {
        const docRef = doc(db, 'guests', String(guest.id));
        batch.set(docRef, guest, { merge: true });
      });
      await batch.commit();
      console.log(`Berhasil sinkronisasi ${guests.length} tamu ke cloud database.`);
    } catch (err) {
      console.error('Gagal batch sync tamu ke cloud:', err);
    }
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
      console.error('Gagal hapus tamu dari cloud:', err);
    }
  }
};
