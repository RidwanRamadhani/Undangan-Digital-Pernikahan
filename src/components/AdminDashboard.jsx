import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { 
  BarChart3, Users, Send, Copy, Check, ShieldCheck, X, Plus, ExternalLink, Lock, 
  KeyRound, LogOut, Search, CheckCircle, FileText, Upload, RefreshCw, MessageSquare,
  FileSpreadsheet, Download, Pin, Heart, CornerDownRight, Trash2, Cloud, Wifi, WifiOff, Database
} from 'lucide-react';
import { INITIAL_EXCEL_GUESTS } from '../data/weddingData';
import { 
  subscribeToGuests, 
  syncAllGuestsCloud, 
  saveGuestCloud, 
  updateGuestCloud, 
  deleteGuestCloud, 
  subscribeToWishes, 
  addWishCloud,
  updateWishCloud, 
  deleteWishCloud,
  getActiveFirebaseConfig,
  initFirebase,
  isCloudConnected
} from '../services/firebase';

export default function AdminDashboard({ isOpen, onClose, onToast }) {
  const [activeTab, setActiveTab] = useState('blast'); // default to 'blast'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSent, setFilterSent] = useState('all'); // all | unsent | sent
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [bulkInput, setBulkInput] = useState('');
  const [importMode, setImportMode] = useState('file'); // 'file' | 'paste'
  const fileInputRef = useRef(null);

  // PIN Protection State
  const DEFAULT_PIN = '0202'; // Tanggal pernikahan: 02 Februari
  const [storedPin, setStoredPin] = useState(() => {
    const existing = localStorage.getItem('wedding_admin_pin');
    if (!existing || existing === '1411') {
      localStorage.setItem('wedding_admin_pin', DEFAULT_PIN);
      return DEFAULT_PIN;
    }
    return existing;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('wedding_admin_authed') === 'true';
  });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [newPinInput, setNewPinInput] = useState('');
  
  // Guest List State
  const [guests, setGuests] = useState([]);

  // Wishes Wall State in Admin Dashboard
  const [wishes, setWishes] = useState(() => {
    const saved = localStorage.getItem('wedding_wishes');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });
  const [wishSearchTerm, setWishSearchTerm] = useState('');
  const [wishFilter, setWishFilter] = useState('all'); // all | pinned | replied | unreplied
  const [adminReplyingId, setAdminReplyingId] = useState(null);
  const [adminReplyText, setAdminReplyText] = useState('');

  const [isCloudSyncActive, setIsCloudSyncActive] = useState(isCloudConnected());
  const [firebaseConfigInput, setFirebaseConfigInput] = useState(() => {
    const active = getActiveFirebaseConfig();
    return active ? JSON.stringify(active, null, 2) : '';
  });

  // Subscribe to Realtime Guests & Realtime Wishes from Firebase Cloud
  useEffect(() => {
    if (!isOpen) return;
    setIsCloudSyncActive(isCloudConnected());

    // 1. Subscribe to Cloud Guests
    const unsubGuests = subscribeToGuests((cloudGuests) => {
      if (Array.isArray(cloudGuests) && cloudGuests.length > 0) {
        setGuests(cloudGuests);
        setIsCloudSyncActive(true);
      }
    });

    // 2. Subscribe to Cloud Wishes
    const unsubWishes = subscribeToWishes((cloudWishes) => {
      if (Array.isArray(cloudWishes) && cloudWishes.length > 0) {
        setWishes(cloudWishes);
        setIsCloudSyncActive(true);
      }
    });

    // 3. Fallback Local Storage Sync
    const syncWishes = () => {
      const saved = localStorage.getItem('wedding_wishes');
      if (saved) {
        try {
          setWishes(JSON.parse(saved));
        } catch (e) {}
      }
    };
    window.addEventListener('wedding_wishes_updated', syncWishes);
    window.addEventListener('storage', syncWishes);

    return () => {
      unsubGuests();
      unsubWishes();
      window.removeEventListener('wedding_wishes_updated', syncWishes);
      window.removeEventListener('storage', syncWishes);
    };
  }, [isOpen]);

  // Form New Single Guest
  const [newGuest, setNewGuest] = useState({
    name: '',
    phone: '',
    pax: 2
  });

  // Helper clean phone number to international WhatsApp format (628xxxx)
  const formatPhoneNumber = (val) => {
    if (!val) return '';
    let str = String(val).trim().replace(/[^0-9]/g, '');
    if (str.startsWith('08')) {
      str = '62' + str.substring(1);
    } else if (str.startsWith('8')) {
      str = '62' + str;
    } else if (!str.startsWith('62') && str.length >= 9) {
      str = '62' + str;
    }
    return str;
  };

  // Merge and Load Guests from initial list, Admin storage, and RSVP submissions
  const mergeAndLoadGuests = () => {
    let adminList = [];
    const savedAdmin = localStorage.getItem('admin_guest_list');
    if (savedAdmin) {
      try {
        adminList = JSON.parse(savedAdmin) || [];
      } catch (e) {
        adminList = [];
      }
    }

    // Jika adminList kosong, cek file Excel master yang pernah di-import user
    if (adminList.length === 0) {
      const savedMaster = localStorage.getItem('last_imported_excel_guests');
      if (savedMaster) {
        try {
          adminList = JSON.parse(savedMaster) || [];
        } catch (e) {}
      }
      if (adminList.length === 0) {
        adminList = INITIAL_EXCEL_GUESTS.map(g => ({ ...g }));
      }
    }

    // Read wedding_guests (filled from RSVP section)
    let rsvpList = [];
    const savedRsvp = localStorage.getItem('wedding_guests');
    if (savedRsvp) {
      try {
        rsvpList = JSON.parse(savedRsvp) || [];
      } catch (e) {
        rsvpList = [];
      }
    }

    // Merge RSVP submissions
    let merged = [...adminList];
    let isModified = false;

    rsvpList.forEach((rsvp) => {
      if (!rsvp || !rsvp.name) return;
      const targetName = rsvp.name.trim().toLowerCase();
      const existingIdx = merged.findIndex(
        (g) => g.name && g.name.trim().toLowerCase() === targetName
      );

      const rsvpStatus =
        rsvp.attendance === 'attending' || rsvp.rsvp === 'Hadir'
          ? 'Hadir'
          : rsvp.attendance === 'not_attending' || rsvp.rsvp === 'Berhalangan'
          ? 'Berhalangan'
          : 'Ragu-ragu';

      if (existingIdx !== -1) {
        const current = merged[existingIdx];
        if (
          current.rsvp !== rsvpStatus ||
          current.pax !== (Number(rsvp.pax) || current.pax) ||
          current.note !== (rsvp.note || current.note) ||
          current.session !== (rsvp.session || current.session)
        ) {
          merged[existingIdx] = {
            ...current,
            rsvp: rsvpStatus,
            pax: Number(rsvp.pax) || current.pax || 1,
            session: rsvp.session || current.session || 'resepsi-1',
            note: rsvp.note || current.note || '',
            phone: rsvp.whatsapp || rsvp.phone || current.phone || '',
            updatedAt: rsvp.submittedAt || new Date().toISOString(),
          };
          isModified = true;
        }
      } else {
        merged.unshift({
          id: rsvp.id || rsvp.slug || 'g-' + Date.now() + Math.random().toString(36).substring(2, 6),
          name: rsvp.name.trim(),
          phone: rsvp.whatsapp || rsvp.phone || '',
          pax: Number(rsvp.pax) || 1,
          rsvp: rsvpStatus,
          session: rsvp.session || 'resepsi-1',
          note: rsvp.note || '',
          slug: rsvp.slug || 'RSVP-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
          submittedAt: rsvp.submittedAt || new Date().toISOString(),
          isSent: true
        });
        isModified = true;
      }
    });

    localStorage.setItem('admin_guest_list', JSON.stringify(merged));
    setGuests(merged);
  };

  // Initial load and sync listeners
  useEffect(() => {
    mergeAndLoadGuests();
    const handleSync = () => mergeAndLoadGuests();
    window.addEventListener('wedding_guest_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('wedding_guest_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  // Re-sync when modal opens
  useEffect(() => {
    if (isOpen) {
      mergeAndLoadGuests();
    }
  }, [isOpen]);

  // Statistics Calculation
  const totalInvitations = guests.length;
  const attendingGuests = guests.filter(g => g.rsvp === 'Hadir');
  const notAttendingGuests = guests.filter(g => g.rsvp === 'Berhalangan');
  const pendingGuests = guests.filter(g => g.rsvp !== 'Hadir' && g.rsvp !== 'Berhalangan');
  const totalHeadcount = attendingGuests.reduce((acc, curr) => acc + (Number(curr.pax) || 1), 0);
  const sentCount = guests.filter(g => g.isSent).length;
  const unsentCount = totalInvitations - sentCount;

  // PIN verification
  const handleKeypadPress = (val) => {
    if (pinInput.length < 4) {
      const next = pinInput + val;
      setPinInput(next);
      if (next.length === 4) {
        if (next === storedPin) {
          setIsAuthenticated(true);
          sessionStorage.setItem('wedding_admin_authed', 'true');
          window.dispatchEvent(new Event('wedding_admin_auth_changed'));
          setPinError(false);
          setPinInput('');
          if (onToast) onToast({ title: 'Akses Diberikan', message: 'Selamat datang di Panel Manajemen Undangan.' });
        } else {
          setPinError(true);
          if (onToast) onToast({ type: 'error', title: 'PIN Salah', message: 'PIN tidak cocok! Akses ditolak.' });
          setTimeout(() => {
            setPinError(false);
            setPinInput('');
          }, 600);
        }
      }
    }
  };

  const handleBackspace = () => {
    setPinInput((prev) => prev.slice(0, -1));
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('wedding_admin_authed');
    window.dispatchEvent(new Event('wedding_admin_auth_changed'));
    setPinInput('');
    if (onToast) onToast({ title: 'Terkunci Kembali', message: 'Panel Admin berhasil dikunci.' });
  };

  const handleSaveNewPin = (e) => {
    e.preventDefault();
    if (newPinInput.length !== 4 || isNaN(newPinInput)) {
      if (onToast) onToast({ type: 'error', title: 'Format Tidak Valid', message: 'PIN baru harus 4 digit angka.' });
      return;
    }
    setStoredPin(newPinInput);
    localStorage.setItem('wedding_admin_pin', newPinInput);
    setNewPinInput('');
    if (onToast) onToast({ title: 'PIN Diperbarui', message: 'PIN keamanan baru berhasil disimpan!' });
  };

  // ADMIN ACTION: Toggle Pin/Sematkan Komentar
  const handleTogglePinWish = async (id) => {
    const target = wishes.find((w) => w.id === id);
    if (!target) return;
    const newPinned = !target.isPinned;

    await updateWishCloud(id, { isPinned: newPinned });

    if (onToast) {
      onToast({
        title: newPinned ? 'Ucapan Disematkan' : 'Sematan Dilepas',
        message: newPinned
          ? `Ucapan dari ${target.senderName} kini disematkan di posisi teratas.`
          : `Sematan ucapan ${target.senderName} telah dilepas.`
      });
    }
  };

  // ADMIN ACTION: Save/Edit Reply
  const handleSaveReplyWish = async (id) => {
    if (!adminReplyText.trim()) {
      if (onToast) onToast({ type: 'error', title: 'Perhatian', message: 'Teks balasan doa tidak boleh kosong.' });
      return;
    }
    await updateWishCloud(id, { replyMessage: adminReplyText.trim() });
    setAdminReplyingId(null);
    setAdminReplyText('');
    if (onToast) {
      onToast({
        title: 'Balasan Terkirim',
        message: 'Balasan Ridwan & Xaviera berhasil dipublikasikan secara real-time.'
      });
    }
  };

  // ADMIN ACTION: Delete Reply
  const handleDeleteReplyWish = async (id) => {
    await updateWishCloud(id, { replyMessage: null });
    setAdminReplyingId(null);
    setAdminReplyText('');
    if (onToast) {
      onToast({
        title: 'Balasan Dihapus',
        message: 'Balasan mempelai untuk ucapan ini berhasil dihapus.'
      });
    }
  };

  // ADMIN ACTION: Delete Wish (in case of spam)
  const handleDeleteWish = async (id, name) => {
    if (!window.confirm(`Hapus ucapan doa dari "${name}"?`)) return;
    await deleteWishCloud(id);
    if (onToast) {
      onToast({
        title: 'Ucapan Dihapus',
        message: `Ucapan dari ${name} berhasil dihapus dari sistem.`
      });
    }
  };

  // Add Single Guest
  const handleAddGuest = async (e) => {
    e.preventDefault();
    if (!newGuest.name.trim()) return;

    const guestItem = {
      id: 'g-' + Date.now(),
      name: newGuest.name.trim(),
      phone: formatPhoneNumber(newGuest.phone),
      pax: Number(newGuest.pax) || 2,
      rsvp: 'Belum Konfirmasi',
      isSent: false,
      slug: 'RSVP-' + Math.random().toString(36).substring(2, 7).toUpperCase()
    };

    const updated = [guestItem, ...guests];
    setGuests(updated);
    setNewGuest({ name: '', phone: '', pax: 2 });
    await saveGuestCloud(guestItem);

    if (onToast) onToast({ title: 'Tamu Ditambahkan', message: `Link undangan untuk ${guestItem.name} berhasil dibuat & disinkronkan ke Cloud.` });
  };

  // Simpan Konfigurasi Cloud Firebase
  const handleSaveCloudConfig = async (e) => {
    e.preventDefault();
    try {
      let raw = firebaseConfigInput.trim();
      if (raw.includes('const firebaseConfig') || raw.includes('var firebaseConfig')) {
        raw = raw.replace(/^[^{]*/, '').replace(/[^}]*$/, '');
      }

      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch (jsonErr) {
        const looseJson = raw
          .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2": ')
          .replace(/'/g, '"');
        parsed = JSON.parse(looseJson);
      }

      if (!parsed || !parsed.projectId || !parsed.apiKey) {
        if (onToast) onToast({ type: 'error', title: 'Config Belum Lengkap', message: 'Pastikan konfigurasi memuat "apiKey" dan "projectId".' });
        return;
      }

      localStorage.setItem('wedding_firebase_config', JSON.stringify(parsed));
      const db = initFirebase(parsed);
      if (db) {
        setIsCloudSyncActive(true);
        if (onToast) onToast({ title: 'Koneksi Berhasil!', message: 'Google Firebase aktif! Sinkronisasi real-time ke semua perangkat kini berjalan.' });
        
        if (guests.length > 0) {
          await syncAllGuestsCloud(guests);
        }
        if (wishes.length > 0) {
          for (const w of wishes) {
            await addWishCloud(w);
          }
        }
      } else {
        if (onToast) onToast({ type: 'error', title: 'Gagal Menghubungkan', message: 'Periksa kembali projectId dan apiKey Anda.' });
      }
    } catch (err) {
      console.error(err);
      if (onToast) onToast({ type: 'error', title: 'Format Error', message: 'Format konfigurasi Firebase tidak valid. Tempelkan objek konfigurasi dari Firebase Console.' });
    }
  };

  // ==========================================
  // PARSER FILE EXCEL (.xlsx, .xls, .csv)
  // ==========================================
  const parseExcelRows = (rows) => {
    let nameColIdx = -1;
    let phoneColIdx = -1;
    let paxColIdx = -1;
    let dataStartRow = 0;

    // Cari baris header
    for (let r = 0; r < Math.min(10, rows.length); r++) {
      const row = rows[r];
      if (!Array.isArray(row)) continue;
      
      row.forEach((cell, cIdx) => {
        const str = String(cell || '').toLowerCase().trim();
        if (['nama tamu', 'nama', 'name', 'tamu', 'kepada yth', 'undangan'].some(k => str.includes(k))) {
          nameColIdx = cIdx;
          dataStartRow = r + 1;
        }
        if (['wa', 'whatsapp', 'nomor wa', 'no wa', 'no. wa', 'phone', 'hp', 'telepon', 'telp', 'kontak', 'mobile'].some(k => str.includes(k))) {
          phoneColIdx = cIdx;
          dataStartRow = r + 1;
        }
        if (['pax', 'kuota', 'jumlah', 'porsi'].some(k => str.includes(k))) {
          paxColIdx = cIdx;
          dataStartRow = r + 1;
        }
      });

      if (nameColIdx !== -1) break;
    }

    // Jika tidak ada kata kunci header, deteksi kolom nama otomatis
    if (nameColIdx === -1) {
      for (let r = 0; r < rows.length; r++) {
        const row = rows[r];
        if (!Array.isArray(row)) continue;
        for (let c = 0; c < row.length; c++) {
          const val = String(row[c] || '').trim();
          if (/[a-zA-Z]/.test(val) && val.length > 2 && !val.toLowerCase().includes('wedding') && !val.toLowerCase().includes('daftar')) {
            nameColIdx = c;
            dataStartRow = r;
            break;
          }
        }
        if (nameColIdx !== -1) break;
      }
    }

    // Deteksi kolom No WA jika belum terdeteksi
    if (phoneColIdx === -1 && rows.length > dataStartRow) {
      const sampleRow = rows[dataStartRow] || [];
      sampleRow.forEach((cell, cIdx) => {
        if (cIdx === nameColIdx) return;
        const cleanDigits = String(cell || '').trim().replace(/[^0-9]/g, '');
        if (cleanDigits.startsWith('08') || cleanDigits.startsWith('628') || cleanDigits.startsWith('8')) {
          phoneColIdx = cIdx;
        }
      });
    }

    const parsed = [];
    for (let r = dataStartRow; r < rows.length; r++) {
      const row = rows[r];
      if (!Array.isArray(row) || row.length === 0) continue;

      let rawName = nameColIdx !== -1 ? row[nameColIdx] : '';
      if (!rawName) continue;

      let nameStr = String(rawName).trim();
      nameStr = nameStr.replace(/^\d+[\.,\s]+/, '').replace(/^"(.*)"$/, '$1').trim();

      const lower = nameStr.toLowerCase();
      if (
        lower === 'nama' ||
        lower === 'nama tamu' ||
        lower === 'no' ||
        lower.includes('daftar nama') ||
        lower.includes('the wedding of') ||
        nameStr.length < 2
      ) {
        continue;
      }

      let rawPhone = phoneColIdx !== -1 ? row[phoneColIdx] : '';
      // Jika di kolom phoneColIdx tidak ada, coba scan kolom lain pada baris yang sama
      if (!rawPhone) {
        for (let c = 0; c < row.length; c++) {
          if (c === nameColIdx) continue;
          const dig = String(row[c] || '').trim().replace(/[^0-9]/g, '');
          if (dig.startsWith('08') || dig.startsWith('628') || (dig.length >= 10 && dig.length <= 15)) {
            rawPhone = row[c];
            break;
          }
        }
      }

      const phone = formatPhoneNumber(rawPhone);
      let pax = 2;
      if (paxColIdx !== -1 && row[paxColIdx]) {
        const parsedPax = parseInt(row[paxColIdx], 10);
        if (!isNaN(parsedPax) && parsedPax > 0 && parsedPax <= 10) {
          pax = parsedPax;
        }
      }

      parsed.push({
        id: 'g-excel-' + Date.now() + '-' + r,
        name: nameStr,
        phone: phone,
        pax: pax,
        rsvp: 'Belum Konfirmasi',
        isSent: false,
        slug: 'RSVP-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
        source: 'excel'
      });
    }

    return parsed;
  };

  // Handle Upload File Excel
  const handleExcelFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (!rows || rows.length === 0) {
          if (onToast) onToast({ type: 'error', title: 'File Kosong', message: 'Tidak ada data baris pada file Excel ini.' });
          return;
        }

        const newGuests = parseExcelRows(rows);
        if (newGuests.length === 0) {
          if (onToast) onToast({ type: 'error', title: 'Data Tidak Terbaca', message: 'Pastikan file Excel memiliki kolom Nama Tamu.' });
          return;
        }

        // Gantikan seluruh daftar tamu lama dengan data file Excel yang baru diimport!
        localStorage.setItem('last_imported_excel_guests', JSON.stringify(newGuests));
        localStorage.setItem('admin_guest_list', JSON.stringify(newGuests));
        setGuests(newGuests);
        setShowBulkImport(false);
        syncAllGuestsCloud(newGuests);

        if (onToast) {
          onToast({
            title: 'File Excel Berhasil Dimuat!',
            message: `${newGuests.length} tamu dari file ${file.name} berhasil dimuat & disinkronkan ke Cloud.`
          });
        }
      } catch (err) {
        console.error('Error membaca Excel:', err);
        if (onToast) {
          onToast({
            type: 'error',
            title: 'Gagal Membaca File',
            message: 'Pastikan file Anda berformat .xlsx, .xls, atau .csv.'
          });
        }
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = ''; // Reset input
  };

  // Unduh Contoh Template Excel
  const handleDownloadExcelTemplate = () => {
    try {
      const templateData = [
        { 'No': 1, 'Nama Tamu': 'Suparjo', 'Nomor WhatsApp': '081234567890', 'Kuota (Pax)': 2 },
        { 'No': 2, 'Nama Tamu': 'Budi Santoso', 'Nomor WhatsApp': '081987654321', 'Kuota (Pax)': 2 },
        { 'No': 3, 'Nama Tamu': 'Dr. Hendra Kusuma, Sp.A', 'Nomor WhatsApp': '085712345678', 'Kuota (Pax)': 2 },
        { 'No': 4, 'Nama Tamu': 'Siti Aminah, S.Pd.', 'Nomor WhatsApp': '087812345678', 'Kuota (Pax)': 2 },
        { 'No': 5, 'Nama Tamu': 'Rina Wulandari', 'Nomor WhatsApp': '081398765432', 'Kuota (Pax)': 1 },
      ];

      const ws = XLSX.utils.json_to_sheet(templateData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Daftar Tamu');
      XLSX.writeFile(wb, 'Format_Import_Tamu_Undangan.xlsx');

      if (onToast) {
        onToast({
          title: 'Template Excel Diunduh',
          message: 'File Format_Import_Tamu_Undangan.xlsx berhasil disimpan.'
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Bulk Import Guest Names via Paste Text
  const handleBulkImportPaste = () => {
    if (!bulkInput.trim()) return;
    const lines = bulkInput.split('\n').map(l => l.trim()).filter(Boolean);
    const newItems = [];

    lines.forEach((line, idx) => {
      let cleanName = line.replace(/^\d+[\.,\s]+/, '').replace(/^"(.*)"$/, '$1').trim();
      let phone = '';

      if (cleanName.includes(',') || cleanName.includes('\t')) {
        const separator = cleanName.includes('\t') ? '\t' : ',';
        const parts = cleanName.split(separator);
        cleanName = parts[0].trim();
        if (parts[1]) {
          phone = formatPhoneNumber(parts[1]);
        }
      }

      if (cleanName && cleanName.length > 1) {
        const existingIdx = guests.findIndex(g => g.name.toLowerCase() === cleanName.toLowerCase());
        if (existingIdx !== -1) {
          if (phone) {
            guests[existingIdx].phone = phone;
          }
        } else {
          newItems.push({
            id: 'g-bulk-' + Date.now() + '-' + idx,
            name: cleanName,
            phone: phone,
            pax: 2,
            rsvp: 'Belum Konfirmasi',
            isSent: false,
            slug: 'RSVP-' + Math.random().toString(36).substring(2, 7).toUpperCase()
          });
        }
      }
    });

    if (newItems.length > 0) {
      localStorage.setItem('last_imported_excel_guests', JSON.stringify(newItems));
      localStorage.setItem('admin_guest_list', JSON.stringify(newItems));
      setGuests(newItems);
      setBulkInput('');
      setShowBulkImport(false);
      syncAllGuestsCloud(newItems);
      if (onToast) onToast({ title: 'Import Berhasil', message: `${newItems.length} tamu berhasil dimuat dan disinkronkan ke Cloud.` });
    } else {
      setShowBulkImport(false);
      if (onToast) onToast({ title: 'Selesai', message: 'Data tamu berhasil diperbarui.' });
    }
  };

  // Delete Guest
  const handleDeleteGuest = async (id) => {
    const targetGuest = guests.find(g => g.id === id);
    const updated = guests.filter(g => g.id !== id);
    setGuests(updated);
    localStorage.setItem('admin_guest_list', JSON.stringify(updated));
    await deleteGuestCloud(id);

    if (targetGuest) {
      try {
        const savedRsvp = JSON.parse(localStorage.getItem('wedding_guests') || '[]');
        const filteredRsvp = savedRsvp.filter(
          r => r.name && r.name.trim().toLowerCase() !== targetGuest.name.trim().toLowerCase()
        );
        localStorage.setItem('wedding_guests', JSON.stringify(filteredRsvp));
      } catch (e) {}
    }

    if (onToast) onToast({ title: 'Tamu Dihapus', message: 'Data tamu berhasil dihapus dari daftar & Cloud.' });
  };

  // Toggle Sent Status
  const toggleSentStatus = async (id) => {
    let newStatus = false;
    const updated = guests.map(g => {
      if (g.id === id) {
        newStatus = !g.isSent;
        return { ...g, isSent: newStatus };
      }
      return g;
    });
    setGuests(updated);
    localStorage.setItem('admin_guest_list', JSON.stringify(updated));
    await updateGuestCloud(id, { isSent: newStatus });
  };

  // Reset daftar tamu kembali ke file Excel terbaru yang di-import
  const handleResetToExcel = async () => {
    let sourceList = [];
    const savedMaster = localStorage.getItem('last_imported_excel_guests');
    if (savedMaster) {
      try {
        sourceList = JSON.parse(savedMaster) || [];
      } catch (e) {}
    }

    if (sourceList.length === 0) {
      sourceList = INITIAL_EXCEL_GUESTS.map(g => ({ ...g }));
    }

    if (window.confirm(`Reset daftar tamu kembali ke file Excel terbaru (${sourceList.length} tamu)?`)) {
      const reloaded = sourceList.map(g => ({
        ...g,
        isSent: false,
        rsvp: 'Belum Konfirmasi'
      }));
      setGuests(reloaded);
      localStorage.setItem('admin_guest_list', JSON.stringify(reloaded));
      await syncAllGuestsCloud(reloaded);
      if (onToast) {
        onToast({
          title: 'Daftar Tamu Direset',
          message: `${reloaded.length} tamu dari file Excel terbaru berhasil dimuat ulang & disinkronkan ke Cloud.`
        });
      }
    }
  };

  // Generate Clean Personalized Invitation Link
  const getGuestLink = (guest) => {
    const origin = window.location.origin;
    return `${origin}/?to=${encodeURIComponent(guest.name)}`;
  };

  // Generate WhatsApp Message Text
  const getWhatsAppMessage = (guest) => {
    const link = getGuestLink(guest);
    return `Kepada Yth.
Bapak/Ibu/Saudara/i: ${guest.name}

Assalamu'alaikum Warahmatullahi Wabarakatuh

Tanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri hari bahagia pernikahan kami:

✨ The Wedding of Ridwan & Xaviera ✨
📅 Hari/Tanggal: Selasa, 2 Februari 2027
📍 Lokasi: Jl. KH. Mursan, RT.002/RW.001, Jurumudi Baru, Kec. Benda, Kota Tangerang, Banten 15124
🗺️ Google Maps: https://maps.app.goo.gl/vQv6ivHVWf2eFj1b9

Untuk melihat rincian acara, denah lokasi, serta konfirmasi kehadiran (RSVP), silakan klik tautan undangan digital khusus Anda berikut:
👉 ${link}

Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir serta memberikan doa restu.

Wassalamu'alaikum Warahmatullahi Wabarakatuh
Kami yang berbahagia,
Ridwan & Xaviera`;
  };

  // Get WhatsApp Direct URL
  const getWhatsAppUrl = (guest) => {
    const text = encodeURIComponent(getWhatsAppMessage(guest));
    if (guest.phone && guest.phone.trim()) {
      const cleanPhone = guest.phone.trim().replace(/[^0-9]/g, '');
      return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${text}`;
    }
    // Jika tidak ada nomor WA di Excel, membuka dialog pemilih kontak di WhatsApp
    return `https://api.whatsapp.com/send?text=${text}`;
  };

  // Filtered Guests based on Search and Filter tab
  const filteredGuests = guests.filter(g => {
    const matchSearch = 
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (g.phone && g.phone.includes(searchTerm));
    if (filterSent === 'sent') return matchSearch && g.isSent;
    if (filterSent === 'unsent') return matchSearch && !g.isSent;
    return matchSearch;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden">
      {/* 1. JIKA BELUM TERVERIFIKASI PIN -> TAMPILKAN PIN LOCK SCREEN */}
      {!isAuthenticated ? (
        <div className="w-full max-w-sm bg-botanical-bg rounded-3xl shadow-2xl border-2 border-botanical-gold/40 p-6 md:p-8 text-center animate-fade-in relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 rounded-full bg-botanical-emerald text-botanical-gold flex items-center justify-center mx-auto mb-4 border border-botanical-gold/50 shadow-md">
            <Lock className="w-7 h-7" />
          </div>

          <h3 className="font-serif text-2xl font-bold text-botanical-emerald">
            Akses Terkunci
          </h3>
          <p className="text-xs text-botanical-muted mt-1 mb-6 leading-relaxed">
            Halaman ini khusus untuk Pengantin. Masukkan 4 digit PIN keamanan Anda:
          </p>

          {/* PIN Indicator Dots */}
          <div className="flex justify-center gap-3 mb-6">
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full border-2 transition-all ${
                  pinInput.length > idx
                    ? 'bg-botanical-gold border-botanical-gold scale-110 shadow-sm'
                    : 'border-botanical-gold/40 bg-white'
                } ${pinError ? 'border-rose-500 bg-rose-200 animate-bounce' : ''}`}
              />
            ))}
          </div>

          {/* Numeric Keypad */}
          <div className="grid grid-cols-3 gap-2.5 max-w-xs mx-auto">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleKeypadPress(digit)}
                className="py-3.5 rounded-2xl bg-white hover:bg-botanical-champagne text-botanical-emerald font-serif text-xl font-bold border border-botanical-gold/25 shadow-sm active:scale-95 transition-all"
              >
                {digit}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPinInput('')}
              className="py-3.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold active:scale-95 transition-all"
            >
              C
            </button>
            <button
              type="button"
              onClick={() => handleKeypadPress('0')}
              className="py-3.5 rounded-2xl bg-white hover:bg-botanical-champagne text-botanical-emerald font-serif text-xl font-bold border border-botanical-gold/25 shadow-sm active:scale-95 transition-all"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              className="py-3.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold active:scale-95 transition-all flex items-center justify-center"
            >
              ⌫
            </button>
          </div>
        </div>
      ) : (
        /* 2. JIKA SUDAH TERVERIFIKASI -> TAMPILKAN PANEL ADMIN */
        <div className="w-full max-w-4xl bg-botanical-bg rounded-2xl sm:rounded-3xl shadow-2xl border border-botanical-gold/40 flex flex-col h-[94vh] max-h-[850px] overflow-hidden animate-fade-in">
          {/* Admin Header - FIXED AT TOP */}
          <div className="p-4 sm:p-5 bg-botanical-emerald text-white flex items-center justify-between border-b border-botanical-gold/30 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-botanical-gold/20 border border-botanical-gold text-botanical-gold flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-serif text-lg sm:text-xl md:text-2xl font-bold text-white leading-tight">
                    Panel Manajemen Undangan
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-[10px] font-mono">
                    TERVERIFIKASI
                  </span>
                  {isCloudSyncActive ? (
                    <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-400/20 border border-emerald-400 text-emerald-200 text-[10px] font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>CLOUD REALTIME</span>
                    </span>
                  ) : (
                    <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-400 text-amber-200 text-[10px] font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span>LOKAL BROWSER</span>
                    </span>
                  )}
                </div>
                <p className="text-[11px] sm:text-xs text-botanical-gold-light mt-0.5">
                  Import File Excel • Sebar Undangan WhatsApp • Ringkasan RSVP • Cloud Sync
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500 border border-rose-400/30 text-rose-200 hover:text-white text-xs font-medium transition-all"
                title="Kunci Kembali Dashboard"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Kunci</span>
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Tutup Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tab Navigation - FIXED UNDER HEADER */}
          <div className="flex border-b border-botanical-gold/20 bg-botanical-champagne/70 px-4 sm:px-6 gap-2 pt-2.5 shrink-0 overflow-x-auto">
            {[
              { id: 'blast', label: `Sebar Link WhatsApp (${guests.length})`, icon: Send },
              { id: 'wishes', label: `Kelola Ucapan (${wishes.length})`, icon: MessageSquare },
              { id: 'stats', label: 'Ringkasan Tamu & RSVP', icon: BarChart3 },
              { id: 'cloud', label: isCloudSyncActive ? 'Cloud Realtime (Aktif)' : 'Cloud Realtime', icon: Cloud },
              { id: 'pin', label: 'Ubah PIN', icon: KeyRound },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-2.5 px-4 text-xs font-semibold rounded-t-xl transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-botanical-bg text-botanical-emerald border-t-2 border-botanical-gold shadow-sm'
                      : 'text-botanical-muted hover:text-botanical-obsidian'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-botanical-gold' : ''}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Contents - SCROLLABLE BODY */}
          <div className="p-4 sm:p-5 md:p-6 overflow-y-auto flex-1 custom-scrollbar">
            
            {/* TAB 1 (UTAMA): SEBAR LINK WHATSAPP SATU PERSATU */}
            {activeTab === 'blast' && (
              <div className="space-y-4">
                {/* Banner Aksi Cepat & Tombol Import File Excel */}
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-emerald-900 shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                      <FileSpreadsheet className="w-4 h-4" />
                    </span>
                    <div>
                      <p className="font-semibold text-emerald-950">
                        Sebar Undangan WhatsApp Otomatis:
                      </p>
                      <p className="text-[11px] text-emerald-800 leading-snug">
                        Klik <strong>"Kirim WA"</strong> di setiap nama. Jika file Excel Anda memiliki kolom No WA, pesan langsung terbuka ke nomor tersebut!
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setShowBulkImport(!showBulkImport)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <Upload className="w-3.5 h-3.5 text-botanical-gold" />
                      <span>{showBulkImport ? 'Tutup Panel Import' : '+ Import File Excel'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleResetToExcel}
                      className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-emerald-100 text-emerald-900 font-semibold border border-emerald-300 text-xs flex items-center gap-1 shadow-xs transition-all"
                      title="Reset daftar tamu kembali ke file Excel terbaru yang di-import"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span className="hidden sm:inline">Reset Tamu Excel</span>
                    </button>
                  </div>
                </div>

                {/* ==================================================== */}
                {/* MODUL UPLOAD FILE EXCEL (.xlsx / .xls / .csv)        */}
                {/* ==================================================== */}
                {showBulkImport && (
                  <div className="p-5 rounded-2xl bg-white border-2 border-dashed border-emerald-400 space-y-4 animate-fade-in shadow-md">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                        <div>
                          <h4 className="text-sm font-bold text-botanical-emerald">
                            Import File Excel Tamu Undangan
                          </h4>
                          <p className="text-[11px] text-gray-500">
                            Mendukung file Microsoft Excel (.xlsx, .xls) dan CSV (.csv)
                          </p>
                        </div>
                      </div>

                      {/* Selector Mode: Upload File vs Paste Teks */}
                      <div className="flex bg-gray-100 p-0.5 rounded-lg text-[11px] font-semibold">
                        <button
                          type="button"
                          onClick={() => setImportMode('file')}
                          className={`px-3 py-1 rounded-md transition-all ${
                            importMode === 'file' ? 'bg-white text-emerald-800 shadow-xs' : 'text-gray-500'
                          }`}
                        >
                          Upload File
                        </button>
                        <button
                          type="button"
                          onClick={() => setImportMode('paste')}
                          className={`px-3 py-1 rounded-md transition-all ${
                            importMode === 'paste' ? 'bg-white text-emerald-800 shadow-xs' : 'text-gray-500'
                          }`}
                        >
                          Paste Teks
                        </button>
                      </div>
                    </div>

                    {importMode === 'file' ? (
                      /* OPSI 1: DROPZONE / PILIH FILE EXCEL */
                      <div className="space-y-3">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleExcelFileUpload}
                          accept=".xlsx, .xls, .csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                          className="hidden"
                        />

                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-botanical-gold/60 hover:border-emerald-500 bg-botanical-champagne/30 hover:bg-emerald-50/50 rounded-2xl p-6 text-center cursor-pointer transition-all group"
                        >
                          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                            <Upload className="w-6 h-6" />
                          </div>
                          <p className="text-xs font-bold text-botanical-obsidian">
                            Klik di Sini untuk Memilih File Excel Anda (.xlsx / .xls / .csv)
                          </p>
                          <p className="text-[11px] text-gray-500 mt-1 max-w-sm mx-auto">
                            Sistem otomatis mendeteksi kolom <strong>Nama Tamu</strong> dan <strong>Nomor WhatsApp</strong>. Semua nama dan nomor langsung muncul di daftar!
                          </p>
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1">
                          <button
                            type="button"
                            onClick={handleDownloadExcelTemplate}
                            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-botanical-gold-dark hover:text-botanical-emerald hover:underline"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Unduh Contoh Format Excel (.xlsx)</span>
                          </button>

                          <span className="text-[10px] text-gray-400">
                            Format nomor WA bisa 0812xxx atau 628xxx
                          </span>
                        </div>
                      </div>
                    ) : (
                      /* OPSI 2: SALIN & TEMPEL TEKS MANUAL */
                      <div className="space-y-3">
                        <textarea
                          rows={4}
                          value={bulkInput}
                          onChange={(e) => setBulkInput(e.target.value)}
                          placeholder="Contoh format:&#10;Suparjo, 08123456789&#10;Budi Santoso, 08198765432&#10;Dr. Hendra Kusuma, Sp.A, 08571234567"
                          className="w-full p-3 rounded-xl border border-botanical-gold/30 text-xs focus:ring-2 focus:ring-botanical-gold outline-none font-mono"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setShowBulkImport(false)}
                            className="px-3 py-1.5 rounded-xl text-xs text-gray-600 hover:bg-gray-100 font-medium"
                          >
                            Batal
                          </button>
                          <button
                            type="button"
                            onClick={handleBulkImportPaste}
                            className="px-4 py-1.5 rounded-xl bg-botanical-emerald hover:bg-botanical-emerald-light text-white text-xs font-semibold shadow"
                          >
                            Tambahkan Tamu
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Search Bar & Progress Filter */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Cari nama tamu atau nomor WhatsApp..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-botanical-gold/30 text-xs focus:ring-2 focus:ring-botanical-gold outline-none shadow-sm"
                    />
                  </div>

                  {/* Filter Status Pengiriman */}
                  <div className="flex items-center gap-1.5 bg-botanical-champagne/80 p-1 rounded-xl border border-botanical-gold/25 self-start sm:self-auto">
                    {[
                      { id: 'all', label: `Semua (${guests.length})` },
                      { id: 'unsent', label: `Belum (${unsentCount})` },
                      { id: 'sent', label: `Sudah (${sentCount})` },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setFilterSent(f.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          filterSent === f.id
                            ? 'bg-botanical-emerald text-white shadow-sm'
                            : 'text-botanical-muted hover:text-botanical-obsidian'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Form Tambah 1 Tamu Manual */}
                <form onSubmit={handleAddGuest} className="p-3.5 rounded-2xl bg-white/70 border border-botanical-gold/30 flex flex-wrap gap-2 items-center">
                  <input
                    type="text"
                    required
                    placeholder="Tambah 1 Nama Tamu Baru..."
                    value={newGuest.name}
                    onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })}
                    className="flex-1 min-w-[200px] px-3 py-2 rounded-xl border border-botanical-gold/30 text-xs focus:ring-2 focus:ring-botanical-gold outline-none bg-white"
                  />
                  <input
                    type="tel"
                    placeholder="No WA (Contoh: 0812xxxx)"
                    value={newGuest.phone}
                    onChange={(e) => setNewGuest({ ...newGuest, phone: e.target.value })}
                    className="w-44 px-3 py-2 rounded-xl border border-botanical-gold/30 text-xs focus:ring-2 focus:ring-botanical-gold outline-none bg-white"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-botanical-emerald hover:bg-botanical-emerald-light text-white text-xs font-semibold flex items-center gap-1.5 shadow"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah</span>
                  </button>
                </form>

                {/* List Tamu dengan Tombol Aksi Satu Persatu */}
                <div className="space-y-2.5">
                  {filteredGuests.length === 0 ? (
                    <div className="py-12 text-center text-botanical-muted text-xs bg-white/60 rounded-2xl border border-botanical-gold/20">
                      Tidak ada nama tamu yang cocok dengan pencarian "{searchTerm}".
                    </div>
                  ) : (
                    filteredGuests.map((g, idx) => {
                      const link = getGuestLink(g);
                      const waUrl = getWhatsAppUrl(g);

                      return (
                        <div
                          key={g.id || idx}
                          className={`p-3.5 md:p-4 rounded-2xl glass-card border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                            g.isSent 
                              ? 'border-emerald-300/80 bg-emerald-50/30' 
                              : 'border-botanical-gold/25 hover:border-botanical-gold/60'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {/* Tombol Checklist Terkirim */}
                            <button
                              type="button"
                              onClick={() => toggleSentStatus(g.id)}
                              className={`mt-0.5 p-1 rounded-lg border transition-all ${
                                g.isSent
                                  ? 'bg-emerald-600 border-emerald-600 text-white'
                                  : 'border-gray-300 text-gray-300 hover:border-emerald-500'
                              }`}
                              title={g.isSent ? 'Tandai belum dikirim' : 'Tandai sudah dikirim'}
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>

                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h5 className="text-xs font-bold text-botanical-obsidian">
                                  {g.name}
                                </h5>

                                {/* Badge Nomor WhatsApp dari Excel */}
                                {g.phone ? (
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-mono font-medium">
                                    WA: {g.phone}
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[9px]">
                                    (Pilih kontak di WA)
                                  </span>
                                )}

                                {g.isSent ? (
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-semibold">
                                    Terkirim
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[9px] font-semibold">
                                    Belum Dikirim
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] font-mono text-botanical-gold-dark truncate max-w-sm sm:max-w-md mt-0.5">
                                {link}
                              </p>
                            </div>
                          </div>

                          {/* Tombol Aksi Langsung */}
                          <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                            {/* 1. Tombol Kirim WhatsApp Langsung */}
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => {
                                if (!g.isSent) toggleSentStatus(g.id);
                                if (onToast) onToast({ title: 'Membuka WhatsApp', message: `Membuka pesan personal untuk ${g.name}.` });
                              }}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow hover:scale-102"
                              title={g.phone ? `Kirim langsung ke WA ${g.phone}` : "Buka WhatsApp & pilih kontak"}
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Kirim WA</span>
                            </a>

                            {/* 2. Salin Pesan Lengkap */}
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(getWhatsAppMessage(g));
                                if (!g.isSent) toggleSentStatus(g.id);
                                if (onToast) onToast({ title: 'Pesan Disalin', message: `Pesan undangan untuk ${g.name} siap di-paste di WhatsApp.` });
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-botanical-champagne hover:bg-botanical-gold/20 text-botanical-emerald text-xs font-medium border border-botanical-gold/40 flex items-center gap-1 transition-all"
                              title="Salin seluruh teks pesan undangan resmi"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-botanical-gold-dark" />
                              <span className="hidden sm:inline">Salin Pesan</span>
                            </button>

                            {/* 3. Salin Link Saja */}
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(link);
                                if (onToast) onToast({ title: 'Link Disalin', message: `Link undangan ${g.name} disalin.` });
                              }}
                              className="p-1.5 rounded-xl bg-white hover:bg-gray-100 text-gray-600 border border-gray-200 transition-all"
                              title="Salin tautan saja"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>

                            {/* 4. Preview Halaman Tamu */}
                            <a
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-xl bg-white hover:bg-gray-100 text-gray-600 border border-gray-200 transition-all"
                              title="Buka dan lihat tampilan undangan untuk nama ini"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>

                            {/* 5. Hapus */}
                            <button
                              type="button"
                              onClick={() => handleDeleteGuest(g.id)}
                              className="p-1.5 rounded-xl hover:bg-rose-50 text-rose-400 hover:text-rose-600 transition-colors"
                              title="Hapus dari daftar"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* TAB: KELOLA UCAPAN & BALASAN PENGANTIN */}
            {activeTab === 'wishes' && (
              <div className="space-y-5 animate-fade-in">
                {/* Ringkasan Metrik Ucapan */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-4 rounded-2xl bg-white border border-botanical-gold/30 shadow-xs">
                    <span className="text-[10px] sm:text-xs text-botanical-muted uppercase font-semibold">Total Ucapan</span>
                    <p className="text-2xl font-serif font-bold text-botanical-emerald mt-0.5">{wishes.length}</p>
                    <span className="text-[10px] text-gray-500">Dari Seluruh Tamu</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-botanical-gold/30 shadow-xs">
                    <span className="text-[10px] sm:text-xs text-botanical-muted uppercase font-semibold">Disematkan (Pin)</span>
                    <p className="text-2xl font-serif font-bold text-amber-600 mt-0.5">
                      {wishes.filter((w) => w.isPinned).length}
                    </p>
                    <span className="text-[10px] text-amber-700/80">Posisi Paling Atas</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-botanical-gold/30 shadow-xs">
                    <span className="text-[10px] sm:text-xs text-botanical-muted uppercase font-semibold">Dibalas Pengantin</span>
                    <p className="text-2xl font-serif font-bold text-emerald-600 mt-0.5">
                      {wishes.filter((w) => w.replyMessage).length}
                    </p>
                    <span className="text-[10px] text-emerald-700/80">Ridwan &amp; Xaviera</span>
                  </div>
                </div>

                {/* Filter & Pencarian */}
                <div className="p-4 rounded-2xl bg-white border border-botanical-gold/30 shadow-xs space-y-3">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Cari nama pengirim ucapan atau isi doa..."
                        value={wishSearchTerm}
                        onChange={(e) => setWishSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-botanical-gold bg-gray-50/50"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                      {[
                        { id: 'all', label: `Semua (${wishes.length})` },
                        { id: 'pinned', label: `Disematkan (${wishes.filter((w) => w.isPinned).length})` },
                        { id: 'unreplied', label: `Belum Dibalas (${wishes.filter((w) => !w.replyMessage).length})` },
                        { id: 'replied', label: `Sudah Dibalas (${wishes.filter((w) => w.replyMessage).length})` },
                      ].map((btn) => (
                        <button
                          key={btn.id}
                          type="button"
                          onClick={() => setWishFilter(btn.id)}
                          className={`px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-semibold whitespace-nowrap transition-all ${
                            wishFilter === btn.id
                              ? 'bg-botanical-emerald text-white shadow-xs'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {btn.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Daftar Ucapan */}
                <div className="space-y-3">
                  {wishes
                    .filter((w) => {
                      const matchSearch =
                        (w.senderName || '').toLowerCase().includes(wishSearchTerm.toLowerCase()) ||
                        (w.message || '').toLowerCase().includes(wishSearchTerm.toLowerCase());
                      if (!matchSearch) return false;
                      if (wishFilter === 'pinned') return w.isPinned;
                      if (wishFilter === 'unreplied') return !w.replyMessage;
                      if (wishFilter === 'replied') return Boolean(w.replyMessage);
                      return true;
                    })
                    .sort((a, b) => {
                      if (a.isPinned && !b.isPinned) return -1;
                      if (!a.isPinned && b.isPinned) return 1;
                      return 0;
                    })
                    .map((item) => (
                      <div
                        key={item.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          item.isPinned
                            ? 'bg-amber-50/60 border-amber-300 shadow-xs'
                            : 'bg-white border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-botanical-emerald">
                              {item.senderName}
                            </h4>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                item.attendanceBadge === 'Hadir'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {item.attendanceBadge}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                            {item.isPinned && (
                              <span className="inline-flex items-center gap-0.5 text-amber-700 font-bold bg-amber-100 px-2 py-0.5 rounded-full">
                                <Pin className="w-2.5 h-2.5 rotate-45" />
                                <span>Disematkan</span>
                              </span>
                            )}
                            <span>{item.createdAt}</span>
                          </div>
                        </div>

                        <p className="text-xs text-gray-800 leading-relaxed whitespace-pre-line mb-3">
                          {item.message}
                        </p>

                        {/* Balasan yang Sudah Tersimpan */}
                        {item.replyMessage && (
                          <div className="p-3 rounded-xl bg-botanical-champagne/70 border-l-2 border-botanical-gold mt-2 mb-2">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] font-bold text-botanical-emerald flex items-center gap-1">
                                <Heart className="w-2.5 h-2.5 fill-botanical-gold text-botanical-gold" />
                                <span>Balasan Ridwan &amp; Xaviera</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => handleDeleteReplyWish(item.id)}
                                className="text-[10px] text-red-500 hover:text-red-700 underline"
                              >
                                Hapus Balasan
                              </button>
                            </div>
                            <p className="text-[11px] text-botanical-muted italic leading-relaxed">
                              {item.replyMessage}
                            </p>
                          </div>
                        )}

                        {/* Input Form Balasan Inline (Jika Sedang Membalas) */}
                        {adminReplyingId === item.id && (
                          <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-300 mb-3 space-y-2 animate-fade-in">
                            <span className="text-[11px] font-bold text-emerald-950 flex items-center gap-1.5">
                              <Heart className="w-3.5 h-3.5 text-botanical-gold fill-botanical-gold" />
                              <span>Balas Doa atas nama Ridwan &amp; Xaviera:</span>
                            </span>
                            <textarea
                              rows={2}
                              maxLength={300}
                              value={adminReplyText}
                              onChange={(e) => setAdminReplyText(e.target.value)}
                              placeholder="Tuliskan ucapan terima kasih dan doa balik untuk tamu..."
                              className="w-full p-2.5 rounded-xl text-xs border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-gray-800 leading-relaxed"
                            />
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setAdminReplyingId(null);
                                  setAdminReplyText('');
                                }}
                                className="px-3 py-1 rounded-lg text-xs text-gray-600 hover:bg-gray-200"
                              >
                                Batal
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveReplyWish(item.id)}
                                className="px-3.5 py-1 rounded-lg text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs"
                              >
                                Publikasikan Balasan
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleTogglePinWish(item.id)}
                              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-semibold transition-all ${
                                item.isPinned
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                              }`}
                            >
                              <Pin className={`w-3 h-3 ${item.isPinned ? 'rotate-45 fill-amber-600 text-amber-600' : ''}`} />
                              <span>{item.isPinned ? 'Lepas Sematan' : 'Sematkan'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setAdminReplyingId(item.id);
                                setAdminReplyText(item.replyMessage || '');
                              }}
                              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-all"
                            >
                              <CornerDownRight className="w-3 h-3 text-emerald-600" />
                              <span>{item.replyMessage ? 'Edit Balasan' : 'Balas Ucapan'}</span>
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteWish(item.id, item.senderName)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Hapus ucapan spam ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}

                  {wishes.length === 0 && (
                    <div className="p-8 text-center bg-white rounded-2xl border border-gray-200">
                      <p className="text-xs text-gray-500">Belum ada ucapan doa yang masuk dari tamu.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: OVERVIEW STATISTIK & KONFIRMASI RSVP */}
            {activeTab === 'stats' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-5 rounded-2xl glass-card border border-botanical-gold/30">
                    <span className="text-xs text-botanical-muted uppercase font-medium">Total Undangan</span>
                    <p className="text-3xl font-serif font-bold text-botanical-emerald mt-1">{totalInvitations}</p>
                    <span className="text-[10px] text-botanical-gold-dark">Tamu Terdaftar</span>
                  </div>

                  <div className="p-5 rounded-2xl glass-card border border-botanical-gold/30">
                    <span className="text-xs text-botanical-muted uppercase font-medium">Konfirmasi Hadir</span>
                    <p className="text-3xl font-serif font-bold text-emerald-600 mt-1">{attendingGuests.length}</p>
                    <span className="text-[10px] text-gray-500">Undangan Siap Hadir</span>
                  </div>

                  <div className="p-5 rounded-2xl glass-card border border-botanical-gold/30">
                    <span className="text-xs text-botanical-muted uppercase font-medium">Berhalangan</span>
                    <p className="text-3xl font-serif font-bold text-rose-600 mt-1">{notAttendingGuests.length}</p>
                    <span className="text-[10px] text-gray-500">Izin Tidak Hadir</span>
                  </div>

                  <div className="p-5 rounded-2xl glass-card border border-botanical-gold/30">
                    <span className="text-xs text-botanical-muted uppercase font-medium">Total Hadir (Pax)</span>
                    <p className="text-3xl font-serif font-bold text-botanical-gold-dark mt-1">{totalHeadcount}</p>
                    <span className="text-[10px] text-gray-500">Estimasi Porsi Katering</span>
                  </div>
                </div>

                {/* Guest Overview Table */}
                <div className="p-5 rounded-2xl glass-card border border-botanical-gold/30">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-serif text-lg font-bold text-botanical-emerald">
                      Daftar Tamu &amp; Kehadiran
                    </h4>
                    <span className="text-xs text-botanical-muted">Total: {guests.length} Tamu</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-botanical-gold/20 text-botanical-muted">
                          <th className="py-2.5 font-semibold">Nama Tamu</th>
                          <th className="py-2.5 font-semibold">Kuota (Pax)</th>
                          <th className="py-2.5 font-semibold">Status Konfirmasi</th>
                          <th className="py-2.5 font-semibold text-right">Tindakan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {guests.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-8 text-center text-botanical-muted text-xs">
                              Belum ada data tamu. Tamu yang mengisi konfirmasi kehadiran (RSVP) di website akan otomatis muncul di sini.
                            </td>
                          </tr>
                        ) : (
                          guests.map((g) => (
                            <tr key={g.id} className="hover:bg-botanical-champagne/30 transition-colors">
                              <td className="py-3">
                                <div className="font-semibold text-botanical-obsidian">{g.name}</div>
                                {g.phone && g.phone !== '-' && (
                                  <div className="text-[10px] text-gray-400 font-mono mt-0.5">{g.phone}</div>
                                )}
                                {g.note && (
                                  <div className="text-[11px] text-botanical-gold-dark italic mt-0.5 max-w-xs">
                                    "{g.note}"
                                  </div>
                                )}
                                {g.session && (
                                  <div className="text-[10px] text-gray-400 mt-0.5">
                                    {g.session === 'akad' ? 'Sesi: Akad Nikah (08:00)' : (g.session === 'resepsi-2' ? 'Sesi: Resepsi 2 (18:30)' : 'Sesi: Resepsi 1 (11:00)')}
                                  </div>
                                )}
                              </td>
                              <td className="py-3 text-botanical-muted font-medium">{g.pax} Orang</td>
                              <td className="py-3">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                                  g.rsvp === 'Hadir' 
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                                    : g.rsvp === 'Berhalangan' 
                                    ? 'bg-rose-100 text-rose-800 border border-rose-300' 
                                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                                }`}>
                                  {g.rsvp}
                                </span>
                              </td>
                              <td className="py-3 text-right">
                                <button
                                  onClick={() => handleDeleteGuest(g.id)}
                                  className="text-rose-500 hover:text-rose-700 text-xs font-medium px-2 py-1 rounded hover:bg-rose-50 transition-colors"
                                >
                                  Hapus
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: SINKRONISASI CLOUD REALTIME */}
            {activeTab === 'cloud' && (
              <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
                {/* Status Koneksi Banner */}
                <div className={`p-5 rounded-3xl border shadow-xs transition-all ${
                  isCloudSyncActive
                    ? 'bg-emerald-50/90 border-emerald-300'
                    : 'bg-amber-50/90 border-amber-300'
                }`}>
                  <div className="flex items-start gap-3.5">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                      isCloudSyncActive
                        ? 'bg-emerald-600 text-white'
                        : 'bg-amber-600 text-white'
                    }`}>
                      {isCloudSyncActive ? <Cloud className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-serif text-base font-bold text-gray-900">
                          {isCloudSyncActive
                            ? 'Cloud Database Realtime: AKTIF & TERHUBUNG'
                            : 'Cloud Database: Mode Lokal Browser (Belum Terhubung)'}
                        </h4>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isCloudSyncActive
                            ? 'bg-emerald-200 text-emerald-800'
                            : 'bg-amber-200 text-amber-800'
                        }`}>
                          {isCloudSyncActive ? 'ONLINE' : 'LOKAL'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {isCloudSyncActive
                          ? 'Setiap tamu yang mengirimkan ucapan doa di HP/akun Google lain akan langsung muncul secara real-time. Daftar sebar link Excel yang Anda import juga otomatis tersinkronisasi ke seluruh perangkat.'
                          : 'Saat ini ucapan dan daftar tamu hanya tersimpan di memori browser HP/laptop ini. Hubungkan ke Google Firebase (100% Gratis dari Google) agar otomatis sinkron ke seluruh akun Google & HP tamu secara real-time.'}
                      </p>
                    </div>
                  </div>

                  {isCloudSyncActive && (
                    <div className="mt-4 pt-3 border-t border-emerald-200/70 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] text-emerald-800 font-semibold">
                        ✓ {wishes.length} ucapan &amp; {guests.length} tamu tersinkronisasi di Cloud.
                      </span>
                      <button
                        type="button"
                        onClick={async () => {
                          if (guests.length > 0) await syncAllGuestsCloud(guests);
                          if (onToast) onToast({ title: 'Sinkronisasi Selesai', message: 'Seluruh data lokal berhasil diunggah ulang ke Cloud.' });
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Upload Ulang Data Lokal ke Cloud</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Panduan & Formulir Pengaturan Firebase */}
                <div className="p-6 rounded-3xl bg-white border border-botanical-gold/30 shadow-xs space-y-4">
                  <div className="border-b border-gray-100 pb-3">
                    <h4 className="font-serif text-lg font-bold text-botanical-emerald">
                      Pengaturan Koneksi Google Firebase
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Gunakan Google Firebase (Cloud Firestore) gratis selamanya untuk sinkronisasi real-time instan ke semua akun Google dan perangkat.
                    </p>
                  </div>

                  {/* Panduan 3 Langkah */}
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2 text-xs text-gray-700">
                    <p className="font-bold text-botanical-emerald">Cara Mendapatkan Konfigurasi Firebase (2 Menit):</p>
                    <ol className="list-decimal list-inside space-y-1 text-[11px] text-gray-600 leading-relaxed">
                      <li>Buka <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-emerald-600 underline font-semibold">console.firebase.google.com</a> dan login dengan Akun Google Anda.</li>
                      <li>Klik <strong>"Tambahkan project"</strong> (beri nama bebas, misal: <em>undangan-ridwan</em>).</li>
                      <li>Di menu kiri, pilih <strong>Build &gt; Firestore Database</strong> &gt; klik <strong>Buat Database</strong> (pilih Test mode / Mode pengujian).</li>
                      <li>Buka <strong>Setelan Project</strong> (ikon gerigi) &gt; scroll ke bawah ke bagian <em>Aplikasi Anda</em> &gt; pilih ikon Web <code>&lt;/&gt;</code>.</li>
                      <li>Salin objek kode <code>firebaseConfig</code> dan tempelkan ke kolom di bawah ini.</li>
                    </ol>
                  </div>

                  <form onSubmit={handleSaveCloudConfig} className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-800 mb-1">
                        Objek Konfigurasi Firebase (JSON / Objek):
                      </label>
                      <textarea
                        rows={7}
                        required
                        value={firebaseConfigInput}
                        onChange={(e) => setFirebaseConfigInput(e.target.value)}
                        placeholder={`{\n  "apiKey": "AIzaSy...",\n  "authDomain": "undangan-ridwan.firebaseapp.com",\n  "projectId": "undangan-ridwan",\n  "storageBucket": "undangan-ridwan.appspot.com",\n  "messagingSenderId": "...",\n  "appId": "..."\n}`}
                        className="w-full p-3 font-mono text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50 text-gray-800"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      {isCloudSyncActive ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm('Putuskan koneksi cloud? Data akan kembali disimpan di lokal browser saja.')) {
                              localStorage.removeItem('wedding_firebase_config');
                              setIsCloudSyncActive(false);
                              setFirebaseConfigInput('');
                              if (onToast) onToast({ title: 'Koneksi Diputus', message: 'Sistem kembali ke penyimpanan lokal browser.' });
                            }
                          }}
                          className="text-xs text-red-600 hover:text-red-700 underline font-medium"
                        >
                          Putuskan Koneksi Cloud
                        </button>
                      ) : <span />}

                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-botanical-emerald hover:bg-botanical-emerald-light text-white text-xs font-semibold shadow transition-all hover:scale-101"
                      >
                        Simpan &amp; Aktifkan Cloud Realtime
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* TAB 3: UBAH PIN KEAMANAN */}
            {activeTab === 'pin' && (
              <div className="max-w-md mx-auto p-6 rounded-3xl glass-card border border-botanical-gold/30 text-center">
                <KeyRound className="w-10 h-10 text-botanical-emerald mx-auto mb-3" />
                <h4 className="font-serif text-xl font-bold text-botanical-emerald">
                  Pengaturan PIN Keamanan
                </h4>
                <p className="text-xs text-botanical-muted mb-6">
                  Ganti PIN akses agar hanya Anda yang dapat membuka panel tamu ini.
                </p>

                <form onSubmit={handleSaveNewPin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-botanical-obsidian mb-1 text-left">
                      PIN Baru (4 Digit Angka):
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      required
                      placeholder="Contoh: 0202"
                      value={newPinInput}
                      onChange={(e) => setNewPinInput(e.target.value)}
                      className="w-full text-center text-xl font-mono tracking-widest px-4 py-3 rounded-xl border border-botanical-gold/40 focus:ring-2 focus:ring-botanical-gold outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-botanical-emerald hover:bg-botanical-emerald-light text-white text-xs font-semibold shadow"
                  >
                    Simpan PIN Baru
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}