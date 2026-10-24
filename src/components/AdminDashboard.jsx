import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Users, QrCode, Tv, Send, Copy, Check, Trash2, Pin, ShieldCheck, X, Sparkles, Plus, Search, ExternalLink, Lock, KeyRound, LogOut, AlertCircle
} from 'lucide-react';

export default function AdminDashboard({ isOpen, onClose, onToast }) {
  const [activeTab, setActiveTab] = useState('stats'); // stats | blast | receptionist | tv

  // PIN Protection State
  const DEFAULT_PIN = '1411'; // Tanggal pernikahan: 14 November
  const [storedPin, setStoredPin] = useState(() => {
    return localStorage.getItem('wedding_admin_pin') || DEFAULT_PIN;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('wedding_admin_authed') === 'true';
  });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [newPinInput, setNewPinInput] = useState('');
  
  // Guest List in LocalStorage
  const [guests, setGuests] = useState(() => {
    const saved = localStorage.getItem('admin_guest_list');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: '1', name: 'Budi Santoso & Partner', category: 'VIP', phone: '628123456789', pax: 2, rsvp: 'Hadir', checkedIn: true, checkInTime: '10:15 WIB', slug: 'RSVP-VIP01' },
      { id: '2', name: 'Rian Prasetyo & Partner', category: 'Keluarga', phone: '628198765432', pax: 2, rsvp: 'Hadir', checkedIn: false, checkInTime: null, slug: 'RSVP-FAM02' },
      { id: '3', name: 'Clarissa Wijaya', category: 'Regular', phone: '628112233445', pax: 1, rsvp: 'Berhalangan', checkedIn: false, checkInTime: null, slug: 'RSVP-REG03' },
      { id: '4', name: 'Prof. Dr. Hendra Gunawan', category: 'VIP', phone: '628155667788', pax: 2, rsvp: 'Hadir', checkedIn: false, checkInTime: null, slug: 'RSVP-VIP04' },
      { id: '5', name: 'Keluarga Besar Bpk. Suparman', category: 'Keluarga', phone: '628177889900', pax: 4, rsvp: 'Hadir', checkedIn: true, checkInTime: '09:40 WIB', slug: 'RSVP-FAM05' },
    ];
  });

  // Form New Guest
  const [newGuest, setNewGuest] = useState({
    name: '',
    category: 'VIP',
    phone: '',
    pax: 2
  });

  // Scanner Input
  const [scanCodeInput, setScanCodeInput] = useState('');
  const [recentCheckedInGuest, setRecentCheckedInGuest] = useState(null);

  // Persist Guests
  useEffect(() => {
    localStorage.setItem('admin_guest_list', JSON.stringify(guests));
  }, [guests]);

  // Statistics Calculation
  const totalInvitations = guests.length;
  const attendingGuests = guests.filter(g => g.rsvp === 'Hadir');
  const totalHeadcount = attendingGuests.reduce((acc, curr) => acc + (curr.pax || 1), 0);
  const totalCheckedIn = guests.filter(g => g.checkedIn).length;

  // PIN verification
  const handlePinSubmit = (e) => {
    if (e) e.preventDefault();
    if (pinInput === storedPin) {
      setIsAuthenticated(true);
      sessionStorage.setItem('wedding_admin_authed', 'true');
      setPinError(false);
      setPinInput('');
      if (onToast) onToast({ title: 'Akses Diberikan', message: 'Selamat datang di Dashboard Admin & WO.' });
    } else {
      setPinError(true);
      if (onToast) onToast({ type: 'error', title: 'PIN Salah', message: 'PIN keamanan tidak sesuai. Akses ditolak.' });
      setTimeout(() => {
        setPinError(false);
        setPinInput('');
      }, 700);
    }
  };

  const handleKeypadPress = (val) => {
    if (pinInput.length < 4) {
      const next = pinInput + val;
      setPinInput(next);
      if (next.length === 4) {
        if (next === storedPin) {
          setIsAuthenticated(true);
          sessionStorage.setItem('wedding_admin_authed', 'true');
          setPinError(false);
          setPinInput('');
          if (onToast) onToast({ title: 'Akses Diberikan', message: 'Selamat datang di Dashboard Admin & WO.' });
        } else {
          setPinError(true);
          if (onToast) onToast({ type: 'error', title: 'PIN Salah', message: 'PIN tidak cocok! Akses ditolak untuk tamu umum.' });
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
    setPinInput('');
    if (onToast) onToast({ title: 'Terkunci Kembali', message: 'Dashboard Admin berhasil dikunci.' });
  };

  const handleSaveNewPin = (e) => {
    e.preventDefault();
    if (newPinInput.length !== 4 || isNaN(newPinInput)) {
      if (onToast) onToast({ type: 'error', title: 'Format Tidak Valid', message: 'PIN baru harus 4 digit angka.' });
      return;
    }
    setStoredPin(newPinInput);
    localStorage.setItem('wedding_admin_pin', newPinInput);
    setIsChangingPin(false);
    setNewPinInput('');
    if (onToast) onToast({ title: 'PIN Diperbarui', message: 'PIN keamanan baru berhasil disimpan!' });
  };

  // Add Guest
  const handleAddGuest = (e) => {
    e.preventDefault();
    if (!newGuest.name.trim()) return;

    const guestItem = {
      id: String(Date.now()),
      name: newGuest.name.trim(),
      category: newGuest.category,
      phone: newGuest.phone.trim().replace(/^0/, '62'),
      pax: Number(newGuest.pax),
      rsvp: 'Belum Konfirmasi',
      checkedIn: false,
      checkInTime: null,
      slug: 'RSVP-' + Math.random().toString(36).substring(2, 7).toUpperCase()
    };

    setGuests([guestItem, ...guests]);
    setNewGuest({ name: '', category: 'VIP', phone: '', pax: 2 });
    if (onToast) onToast({ title: 'Tamu Ditambahkan', message: `Undangan untuk ${guestItem.name} berhasil dibuat.` });
  };

  // Generate Personalized Invitation Link
  const getGuestLink = (guest) => {
    const origin = window.location.origin;
    const isVipParam = guest.category === 'VIP' ? '&vip=true' : '';
    return `${origin}/?to=${encodeURIComponent(guest.name)}${isVipParam}&pax=${guest.pax}`;
  };

  // Generate WhatsApp Message
  const getWhatsAppMessage = (guest) => {
    const link = getGuestLink(guest);
    return `Yth. ${guest.name},%0A%0ATanpa mengurangi rasa hormat, kami bermaksud mengundang Bapak/Ibu/Saudara/i untuk hadir dan memberikan doa restu pada acara pernikahan kami:%0A%0A*Ridwan %26 Salma*%0A📅 Sabtu, 14 November 2026%0A📍 The Grand Heritage Ballroom, Grand Hyatt Jakarta%0A%0AUntuk informasi detail mengenai jadwal acara dan konfirmasi kehadiran (RSVP), silakan mengakses tautan undangan digital berikut:%0A${encodeURIComponent(link)}%0A%0AMerupakan suatu kehormatan dan kebahagiaan bagi kami apabila Anda berkenan hadir.%0A%0AWassalamu'alaikum Wr. Wb.%0AKami yang berbahagia,%0ARidwan %26 Salma`;
  };

  // Check-In Guest via Receptionist
  const handleCheckIn = (guestId) => {
    const nowTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
    const updated = guests.map(g => {
      if (g.id === guestId || g.slug === guestId) {
        setRecentCheckedInGuest({ ...g, checkedIn: true, checkInTime: nowTime });
        return { ...g, checkedIn: true, checkInTime: nowTime };
      }
      return g;
    });
    setGuests(updated);
    if (onToast) onToast({ title: 'Check-In Sukses', message: 'Tamu berhasil diverifikasi di meja resepsionis.' });
  };

  // Manual code check-in
  const handleScanSubmit = (e) => {
    e.preventDefault();
    const query = scanCodeInput.trim().toUpperCase();
    const target = guests.find(g => g.slug.toUpperCase() === query || g.name.toLowerCase().includes(query.toLowerCase()));
    if (target) {
      handleCheckIn(target.id);
      setScanCodeInput('');
    } else {
      if (onToast) onToast({ type: 'error', title: 'Kode Tidak Ditemukan', message: 'Silakan periksa kembali kode tiket QR.' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 md:p-6 overflow-y-auto">
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
            Halaman ini khusus untuk Pengantin &amp; Tim Wedding Organizer. Masukkan 4 digit PIN keamanan Anda:
          </p>

          {/* PIN Indicators Display */}
          <div className={`flex justify-center gap-3 mb-6 ${pinError ? 'animate-shake' : ''}`}>
            {[0, 1, 2, 3].map((idx) => {
              const isFilled = pinInput.length > idx;
              return (
                <div
                  key={idx}
                  className={`w-11 h-12 rounded-xl flex items-center justify-center text-lg font-bold transition-all border-2 ${
                    pinError
                      ? 'border-rose-500 bg-rose-50 text-rose-600'
                      : isFilled
                      ? 'border-botanical-gold bg-botanical-emerald text-botanical-gold shadow-md'
                      : 'border-botanical-gold/30 bg-white/70'
                  }`}
                >
                  {isFilled ? '●' : ''}
                </div>
              );
            })}
          </div>

          {/* Error Message */}
          {pinError && (
            <p className="text-xs text-rose-600 font-semibold mb-3 flex items-center justify-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>PIN Salah! Akses ditolak.</span>
            </p>
          )}

          {/* Numeric Keypad */}
          <div className="grid grid-cols-3 gap-2.5 max-w-[260px] mx-auto mb-4">
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
        /* 2. JIKA SUDAH TERVERIFIKASI -> TAMPILKAN DASHBOARD ADMIN LENGKAP */
        <div className="w-full max-w-4xl bg-botanical-bg rounded-3xl shadow-2xl border border-botanical-gold/40 overflow-hidden flex flex-col max-h-[92vh] animate-fade-in">
          {/* Admin Header */}
          <div className="p-5 md:p-6 bg-botanical-emerald text-white flex items-center justify-between border-b border-botanical-gold/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-botanical-gold/20 border border-botanical-gold text-botanical-gold flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-serif text-xl md:text-2xl font-bold text-white">
                    Dashboard Manajemen Pengantin &amp; WO
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-[10px] font-mono">
                    TERVERIFIKASI
                  </span>
                </div>
                <p className="text-xs text-botanical-gold-light">
                  Overview Tamu • WhatsApp Blast • Scanner Resepsionis • Layar Sapaan TV
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
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-botanical-gold/20 bg-botanical-champagne/60 px-6 gap-2 pt-3 overflow-x-auto">
            {[
              { id: 'stats', label: 'Overview Statistik', icon: BarChart3 },
              { id: 'blast', label: 'WA Blast & Link Generator', icon: Send },
              { id: 'receptionist', label: 'Scanner Resepsionis', icon: QrCode },
              { id: 'tv', label: 'Layar Sapaan TV', icon: Tv },
              { id: 'pin', label: 'Ubah PIN', icon: KeyRound },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold rounded-t-2xl transition-all whitespace-nowrap ${
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

          {/* Tab Contents */}
          <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
            {/* TAB 1: OVERVIEW STATISTIK */}
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
                    <span className="text-[10px] text-gray-500">Undangan Aktif</span>
                  </div>

                  <div className="p-5 rounded-2xl glass-card border border-botanical-gold/30">
                    <span className="text-xs text-botanical-muted uppercase font-medium">Total Headcount</span>
                    <p className="text-3xl font-serif font-bold text-botanical-gold-dark mt-1">{totalHeadcount}</p>
                    <span className="text-[10px] text-gray-500">Estimasi Porsi Katering</span>
                  </div>

                  <div className="p-5 rounded-2xl glass-card border border-botanical-gold/30">
                    <span className="text-xs text-botanical-muted uppercase font-medium">Sudah Check-In</span>
                    <p className="text-3xl font-serif font-bold text-blue-600 mt-1">{totalCheckedIn}</p>
                    <span className="text-[10px] text-gray-500">Hadir di Meja Resepsi</span>
                  </div>
                </div>

                {/* Guest Overview Table */}
                <div className="p-5 rounded-2xl glass-card border border-botanical-gold/30">
                  <h4 className="font-serif text-lg font-bold text-botanical-emerald mb-3">
                    Ringkasan Tamu Undangan
                  </h4>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-botanical-gold/20 text-botanical-muted">
                          <th className="py-2.5 font-semibold">Nama Tamu</th>
                          <th className="py-2.5 font-semibold">Kategori</th>
                          <th className="py-2.5 font-semibold">Pax</th>
                          <th className="py-2.5 font-semibold">Status RSVP</th>
                          <th className="py-2.5 font-semibold">Check-In</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {guests.map((g) => (
                          <tr key={g.id} className="hover:bg-botanical-champagne/30">
                            <td className="py-2.5 font-medium text-botanical-obsidian">{g.name}</td>
                            <td className="py-2.5">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                g.category === 'VIP' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-700'
                              }`}>
                                {g.category}
                              </span>
                            </td>
                            <td className="py-2.5">{g.pax} Org</td>
                            <td className="py-2.5">
                              <span className={`font-semibold ${g.rsvp === 'Hadir' ? 'text-emerald-600' : 'text-gray-500'}`}>
                                {g.rsvp}
                              </span>
                            </td>
                            <td className="py-2.5">
                              {g.checkedIn ? (
                                <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                                  ✔ {g.checkInTime}
                                </span>
                              ) : (
                                <span className="text-gray-400">Belum</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: WA BLAST & LINK GENERATOR */}
            {activeTab === 'blast' && (
              <div className="space-y-6">
                {/* Form Input Tamu Baru */}
                <form onSubmit={handleAddGuest} className="p-5 rounded-2xl glass-card border border-botanical-gold/30">
                  <h4 className="font-serif text-lg font-bold text-botanical-emerald mb-3">
                    Tambah Tamu &amp; Buat Link Personal
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Nama Lengkap Tamu"
                      value={newGuest.name}
                      onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })}
                      className="px-3 py-2.5 rounded-xl border border-botanical-gold/30 text-xs focus:ring-2 focus:ring-botanical-gold outline-none"
                    />
                    <select
                      value={newGuest.category}
                      onChange={(e) => setNewGuest({ ...newGuest, category: e.target.value })}
                      className="px-3 py-2.5 rounded-xl border border-botanical-gold/30 text-xs focus:ring-2 focus:ring-botanical-gold outline-none"
                    >
                      <option value="VIP">Kategori: VIP</option>
                      <option value="Keluarga">Kategori: Keluarga</option>
                      <option value="Regular">Kategori: Regular</option>
                    </select>
                    <input
                      type="tel"
                      placeholder="No WA (0812xxxx)"
                      value={newGuest.phone}
                      onChange={(e) => setNewGuest({ ...newGuest, phone: e.target.value })}
                      className="px-3 py-2.5 rounded-xl border border-botanical-gold/30 text-xs focus:ring-2 focus:ring-botanical-gold outline-none"
                    />
                    <button
                      type="submit"
                      className="py-2.5 rounded-xl bg-botanical-emerald text-white text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-botanical-emerald-light transition-all"
                    >
                      <Plus className="w-4 h-4 text-botanical-gold" />
                      <span>Generate Link</span>
                    </button>
                  </div>
                </form>

                {/* Guest Link List */}
                <div className="space-y-3">
                  {guests.map((g) => {
                    const link = getGuestLink(g);
                    const waUrl = g.phone ? `https://wa.me/${g.phone}?text=${getWhatsAppMessage(g)}` : '#';

                    return (
                      <div
                        key={g.id}
                        className="p-4 rounded-2xl glass-card border border-botanical-gold/25 flex flex-col md:flex-row md:items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="text-xs font-bold text-botanical-obsidian">{g.name}</h5>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-botanical-champagne border border-botanical-gold/30 text-botanical-emerald">
                              {g.category} ({g.pax} Pax)
                            </span>
                          </div>
                          <p className="text-[11px] font-mono text-botanical-gold-dark truncate max-w-md mt-0.5">
                            {link}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(link);
                              if (onToast) onToast({ title: 'Link Disalin', message: `Link undangan untuk ${g.name} siap dikirim.` });
                            }}
                            className="px-3 py-1.5 rounded-xl bg-botanical-champagne hover:bg-botanical-gold/20 text-botanical-emerald text-xs font-medium border border-botanical-gold/40 flex items-center gap-1.5 transition-all"
                          >
                            <Copy className="w-3.5 h-3.5 text-botanical-gold-dark" />
                            <span>Salin Link</span>
                          </button>

                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium flex items-center gap-1.5 transition-all shadow"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Kirim via WA</span>
                          </a>

                          <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-all"
                            title="Buka Pratinjau Undangan Tamu"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: SCANNER RESEPSIONIS */}
            {activeTab === 'receptionist' && (
              <div className="space-y-6">
                {/* Scan / Input Box */}
                <div className="p-6 rounded-3xl glass-card border border-botanical-gold/30 text-center max-w-lg mx-auto">
                  <QrCode className="w-12 h-12 text-botanical-emerald mx-auto mb-2" />
                  <h4 className="font-serif text-xl font-bold text-botanical-emerald">
                    Validasi QR Code Meja Resepsionis
                  </h4>
                  <p className="text-xs text-botanical-muted mb-4">
                    Ketik kode tiket tamu (misal: RSVP-VIP01) atau cari nama tamu untuk check-in:
                  </p>

                  <form onSubmit={handleScanSubmit} className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Ketik Kode Pass atau Nama Tamu..."
                      value={scanCodeInput}
                      onChange={(e) => setScanCodeInput(e.target.value)}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-botanical-gold/40 text-xs focus:ring-2 focus:ring-botanical-gold outline-none"
                    />
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-botanical-emerald text-white text-xs font-semibold shadow hover:bg-botanical-emerald-light"
                    >
                      Check-In
                    </button>
                  </form>
                </div>

                {/* Verified Guest Highlight */}
                {recentCheckedInGuest && (
                  <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-700">Check-In Berhasil!</span>
                      <h5 className="font-serif text-lg font-bold">{recentCheckedInGuest.name}</h5>
                      <p className="text-xs text-emerald-800">
                        Kategori: {recentCheckedInGuest.category} • {recentCheckedInGuest.pax} Orang • Jam: {recentCheckedInGuest.checkInTime}
                      </p>
                    </div>
                    <Check className="w-8 h-8 text-emerald-600" />
                  </div>
                )}

                {/* Quick Check-In List */}
                <div className="p-5 rounded-2xl glass-card border border-botanical-gold/30">
                  <h5 className="font-serif text-base font-bold text-botanical-emerald mb-3">
                    Daftar Tamu Masuk Resepsi
                  </h5>
                  <div className="space-y-2">
                    {guests.map((g) => (
                      <div
                        key={g.id}
                        className="p-3 rounded-xl bg-white/70 border border-botanical-gold/20 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-semibold text-xs text-botanical-obsidian">{g.name}</p>
                          <span className="text-[10px] text-gray-500 font-mono">Kode: {g.slug} | {g.pax} Pax</span>
                        </div>

                        {g.checkedIn ? (
                          <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>Hadir ({g.checkInTime})</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => handleCheckIn(g.id)}
                            className="px-3 py-1 rounded-full bg-botanical-emerald hover:bg-botanical-emerald-light text-botanical-gold text-xs font-semibold shadow transition-all"
                          >
                            Tandai Hadir
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: LAYAR SAPAAN (TV DISPLAY) */}
            {activeTab === 'tv' && (
              <div className="relative rounded-3xl overflow-hidden bg-botanical-emerald text-white p-8 md:p-12 text-center min-h-[350px] flex flex-col items-center justify-center border-4 border-botanical-gold/50 shadow-2xl">
                <div className="absolute inset-0 bg-botanical-pattern opacity-10 pointer-events-none" />

                <Sparkles className="w-12 h-12 text-botanical-gold animate-pulse-subtle mb-4" />

                <p className="font-script text-3xl md:text-4xl text-botanical-gold-light mb-2">
                  Selamat Datang di Hari Bahagia
                </p>

                <h1 className="font-serif text-3xl md:text-5xl font-bold text-white mb-4">
                  {recentCheckedInGuest ? recentCheckedInGuest.name : 'Bapak Budi Santoso & Partner'}
                </h1>

                <div className="h-[2px] w-24 bg-botanical-gold mx-auto mb-4" />

                <p className="text-xs md:text-sm text-gray-200 max-w-md mx-auto leading-relaxed italic">
                  "Terima kasih atas kehadiran dan doa restu Bapak/Ibu/Saudara/i yang telah melengkapi kebahagiaan kami."
                </p>

                <div className="mt-8 px-4 py-1.5 rounded-full bg-botanical-gold/20 border border-botanical-gold text-botanical-gold-light text-xs font-mono">
                  Layar Sapaan Resepsionis TV Aktif
                </div>
              </div>
            )}

            {/* TAB 5: UBAH PIN KEAMANAN */}
            {activeTab === 'pin' && (
              <div className="max-w-md mx-auto p-6 rounded-3xl glass-card border border-botanical-gold/30 text-center">
                <KeyRound className="w-10 h-10 text-botanical-emerald mx-auto mb-3" />
                <h4 className="font-serif text-xl font-bold text-botanical-emerald">
                  Pengaturan PIN Keamanan
                </h4>
                <p className="text-xs text-botanical-muted mb-6">
                  Ganti PIN akses dashboard agar hanya orang yang dipercaya (pengantin / WO) yang dapat masuk.
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
                      placeholder="Contoh: 2026"
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
