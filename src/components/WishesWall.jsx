import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Heart, Pin, CheckCircle2, XCircle, Clock, ShieldCheck, CornerDownRight, Trash2, Edit3, Wifi, WifiOff } from 'lucide-react';
import ScrollReveal from './ScrollReveal';
import { subscribeToWishes, addWishCloud, updateWishCloud, isCloudConnected } from '../services/firebase';

export default function WishesWall({ initialWishes, guestName, isAdmin, onOpenAdmin, onToast }) {
  const [wishes, setWishes] = useState(() => {
    const saved = localStorage.getItem('wedding_wishes');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return initialWishes;
      }
    }
    return initialWishes;
  });

  const [formData, setFormData] = useState({
    senderName: guestName || '',
    attendanceBadge: 'Hadir',
    message: '',
  });

  const [lastSubmitTime, setLastSubmitTime] = useState(0);
  const [replyingWishId, setReplyingWishId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isOnline, setIsOnline] = useState(isCloudConnected());

  useEffect(() => {
    if (guestName) {
      setFormData((prev) => ({ ...prev, senderName: guestName }));
    }
  }, [guestName]);

  // Real-time synchronization: Firebase Cloud Listener + Local Fallback Event
  useEffect(() => {
    setIsOnline(isCloudConnected());

    // 1. Subscribe to Real-time Cloud
    const unsubscribeCloud = subscribeToWishes((cloudWishes) => {
      if (Array.isArray(cloudWishes) && cloudWishes.length > 0) {
        setWishes(cloudWishes);
        setIsOnline(true);
      }
    });

    // 2. Real-time local events
    const handleWishesUpdate = () => {
      const saved = localStorage.getItem('wedding_wishes');
      if (saved) {
        try {
          setWishes(JSON.parse(saved));
        } catch (e) {}
      }
    };
    window.addEventListener('wedding_wishes_updated', handleWishesUpdate);
    window.addEventListener('storage', handleWishesUpdate);
    return () => {
      unsubscribeCloud();
      window.removeEventListener('wedding_wishes_updated', handleWishesUpdate);
      window.removeEventListener('storage', handleWishesUpdate);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const now = Date.now();
    if (now - lastSubmitTime < 20000) {
      if (onToast) {
        onToast({
          type: 'error',
          title: 'Mohon Menunggu',
          message: 'Silakan tunggu beberapa saat sebelum mengirimkan doa berikutnya (Anti-Spam).'
        });
      }
      return;
    }

    if (!formData.senderName.trim() || !formData.message.trim()) {
      if (onToast) {
        onToast({
          type: 'error',
          title: 'Lengkapi Data',
          message: 'Nama dan ucapan doa wajib diisi.'
        });
      }
      return;
    }

    const newWish = {
      id: 'wish-' + Date.now(),
      senderName: formData.senderName.trim(),
      attendanceBadge: formData.attendanceBadge,
      message: formData.message.trim(),
      replyMessage: null,
      isPinned: false,
      createdAt: 'Baru saja'
    };

    // Save to Real-time Cloud (and LocalStorage)
    await addWishCloud(newWish);
    setLastSubmitTime(now);

    setFormData({
      senderName: guestName || '',
      attendanceBadge: 'Hadir',
      message: ''
    });

    if (onToast) {
      onToast({
        title: 'Doa Terkirim',
        message: 'Terima kasih! Ucapan doa Anda berhasil dipublikasikan secara real-time.'
      });
    }
  };

  // ADMIN ACTION: Toggle Pin/Sematkan Komentar
  const handleTogglePin = async (id) => {
    if (!isAdmin) return;
    const target = wishes.find((item) => item.id === id);
    if (!target) return;
    const newPinned = !target.isPinned;

    await updateWishCloud(id, { isPinned: newPinned });

    if (onToast) {
      onToast({
        title: newPinned ? 'Ucapan Disematkan' : 'Sematan Dilepas',
        message: newPinned
          ? `Komentar ${target.senderName} disematkan ke posisi teratas.`
          : `Sematan komentar ${target.senderName} berhasil dilepas.`
      });
    }
  };

  // ADMIN ACTION: Start Inlining Reply
  const handleStartReply = (item) => {
    if (!isAdmin) return;
    setReplyingWishId(item.id);
    setReplyText(item.replyMessage || '');
  };

  const handleCancelReply = () => {
    setReplyingWishId(null);
    setReplyText('');
  };

  // ADMIN ACTION: Save Couple Reply
  const handleSaveReply = async (id) => {
    if (!isAdmin) return;
    if (!replyText.trim()) {
      if (onToast) {
        onToast({ type: 'error', title: 'Perhatian', message: 'Teks balasan doa tidak boleh kosong.' });
      }
      return;
    }

    await updateWishCloud(id, { replyMessage: replyText.trim() });
    setReplyingWishId(null);
    setReplyText('');

    if (onToast) {
      onToast({
        title: 'Balasan Terkirim',
        message: 'Balasan Ridwan & Xaviera berhasil dipublikasikan secara real-time.'
      });
    }
  };

  // ADMIN ACTION: Delete Couple Reply
  const handleDeleteReply = async (id) => {
    if (!isAdmin) return;
    await updateWishCloud(id, { replyMessage: null });
    setReplyingWishId(null);
    setReplyText('');

    if (onToast) {
      onToast({
        title: 'Balasan Dihapus',
        message: 'Balasan mempelai untuk komentar ini berhasil dihapus.'
      });
    }
  };

  // Sorted: Pinned wishes always appear at top
  const sortedWishes = [...wishes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });

  return (
    <section id="ucapan" className="py-12 px-6 md:px-10">
      <ScrollReveal animation="fade-up" className="text-center mb-10">
        <span className="text-[11px] uppercase tracking-widest text-botanical-gold-dark font-semibold">
          Doa &amp; Harapan
        </span>
        <h2 className="font-serif text-3xl md:text-4xl font-semibold text-botanical-obsidian mt-1 mb-2">
          Dinding Ucapan
        </h2>
        <p className="text-xs text-botanical-muted max-w-sm mx-auto leading-relaxed">
          Untaian doa restu dan harapan tulus dari keluarga, sahabat, serta rekan terkasih untuk kedua mempelai.
        </p>
      </ScrollReveal>

      <div className="max-w-xl mx-auto space-y-8">
        {/* Active Admin Banner Notice */}
        {isAdmin && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-amber-500/15 border border-botanical-gold/50 shadow-sm flex items-center justify-between gap-3 text-xs animate-fade-in">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-full bg-botanical-emerald text-botanical-gold flex items-center justify-center font-bold text-sm shadow-xs">
                👑
              </span>
              <div>
                <p className="font-bold text-botanical-emerald text-xs">
                  Mode Pengantin Aktif (Admin Terverifikasi)
                </p>
                <p className="text-[10px] text-botanical-muted">
                  Anda dapat menyematkan (pin) dan membalas langsung ucapan tamu di bawah ini.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-2 py-0.5 rounded-full whitespace-nowrap">
              Admin Mode
            </span>
          </div>
        )}

        {/* Wish Submission Form */}
        <ScrollReveal animation="scale" delay={150}>
          <form
            onSubmit={handleSubmit}
            className="p-6 md:p-8 rounded-3xl glass-card border border-botanical-gold/30 shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-botanical-emerald flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-botanical-gold" />
                <span>Tulis Doa &amp; Ucapan</span>
              </span>
              <span className="text-[10px] text-botanical-muted">Maksimal 350 karakter</span>
            </div>

            <div>
              <input
                type="text"
                required
                maxLength={60}
                placeholder="Nama Anda / Pasangan"
                value={formData.senderName}
                onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-white/90 border border-botanical-gold/30 focus:outline-none focus:ring-2 focus:ring-botanical-gold text-xs text-botanical-obsidian shadow-inner"
              />
            </div>

            <div>
              <select
                value={formData.attendanceBadge}
                onChange={(e) => setFormData({ ...formData, attendanceBadge: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-white/90 border border-botanical-gold/30 focus:outline-none focus:ring-2 focus:ring-botanical-gold text-xs text-botanical-obsidian shadow-inner"
              >
                <option value="Hadir">Konfirmasi: Hadir</option>
                <option value="Berhalangan">Konfirmasi: Berhalangan</option>
                <option value="Ragu-ragu">Konfirmasi: Ragu-ragu</option>
              </select>
            </div>

            <div>
              <textarea
                rows={3}
                required
                maxLength={350}
                placeholder="Tuliskan doa restu yang tulus untuk Ridwan & Xaviera..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-white/90 border border-botanical-gold/30 focus:outline-none focus:ring-2 focus:ring-botanical-gold text-xs text-botanical-obsidian shadow-inner leading-relaxed"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-botanical-emerald hover:bg-botanical-emerald-light text-white text-xs font-semibold tracking-wider shadow-md flex items-center justify-center gap-2 transition-all hover:scale-101 active:scale-98"
            >
              <Send className="w-3.5 h-3.5 text-botanical-gold" />
              <span>Kirim Doa Restu</span>
            </button>
          </form>
        </ScrollReveal>

        {/* Wishes List (Live Wall) */}
        <ScrollReveal animation="fade-up" delay={250}>
          <div className="space-y-4 max-h-[580px] overflow-y-auto pr-2 custom-scrollbar">
            {sortedWishes.map((item) => (
              <div
                key={item.id}
                className={`p-5 rounded-2xl glass-card border shadow-sm transition-all ${
                  item.isPinned ? 'border-botanical-gold bg-botanical-champagne/40' : 'border-botanical-gold/20'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-botanical-emerald">
                      {item.senderName}
                    </h4>
                    {item.attendanceBadge === 'Hadir' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>Hadir</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-medium">
                        <XCircle className="w-2.5 h-2.5" />
                        <span>{item.attendanceBadge}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px] text-botanical-muted">
                    {item.isPinned && (
                      <span className="inline-flex items-center gap-0.5 text-botanical-gold-dark font-semibold">
                        <Pin className="w-2.5 h-2.5 rotate-45" />
                        <span>Disematkan</span>
                      </span>
                    )}
                    <Clock className="w-2.5 h-2.5" />
                    <span>{item.createdAt}</span>
                  </div>
                </div>

                <p className="text-xs text-botanical-obsidian leading-relaxed whitespace-pre-line mb-3">
                  {item.message}
                </p>

                {/* Balasan Mempelai (Ridwan & Xaviera) */}
                {item.replyMessage && (
                  <div className="p-3 rounded-xl bg-botanical-champagne/70 border-l-2 border-botanical-gold mt-2">
                    <span className="text-[10px] font-bold text-botanical-emerald flex items-center gap-1 mb-0.5">
                      <Heart className="w-2.5 h-2.5 fill-botanical-gold text-botanical-gold" />
                      <span>Balasan Ridwan &amp; Xaviera</span>
                    </span>
                    <p className="text-[11px] text-botanical-muted italic leading-relaxed">
                      {item.replyMessage}
                    </p>
                  </div>
                )}

                {/* FORM INLINE BALASAN (HANYA MUNCUL DI MODE ADMIN) */}
                {isAdmin && replyingWishId === item.id && (
                  <div className="mt-3 p-3.5 rounded-2xl bg-white/95 border-2 border-emerald-400 shadow-md space-y-2.5 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-emerald-950 flex items-center gap-1.5">
                        <Heart className="w-3.5 h-3.5 text-botanical-gold fill-botanical-gold" />
                        <span>Tulis Balasan Ridwan &amp; Xaviera:</span>
                      </span>
                      <button
                        type="button"
                        onClick={handleCancelReply}
                        className="text-[10px] text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        Batal
                      </button>
                    </div>

                    <textarea
                      rows={2}
                      maxLength={300}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Contoh: Aamiin ya Rabbal 'alamin, terima kasih banyak atas doa restunya!"
                      className="w-full p-2.5 rounded-xl text-xs border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/70 text-botanical-obsidian leading-relaxed"
                    />

                    <div className="flex items-center justify-between pt-1">
                      {item.replyMessage ? (
                        <button
                          type="button"
                          onClick={() => handleDeleteReply(item.id)}
                          className="inline-flex items-center gap-1 text-[10px] font-medium text-red-600 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Hapus Balasan</span>
                        </button>
                      ) : <span />}

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleCancelReply}
                          className="px-3 py-1 rounded-lg text-[11px] text-gray-600 hover:bg-gray-100 font-medium transition-colors"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveReply(item.id)}
                          className="px-3.5 py-1 rounded-lg text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm transition-all"
                        >
                          Simpan Balasan
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* TOMBOL AKSI ADMIN PENGANTIN (HANYA AKTIF JIKA LOGIN ADMIN) */}
                {isAdmin && (
                  <div className="pt-2.5 mt-3 border-t border-botanical-gold/20 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleTogglePin(item.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all ${
                          item.isPinned
                            ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                            : 'bg-white/80 hover:bg-botanical-champagne text-botanical-muted hover:text-botanical-obsidian border border-botanical-gold/30'
                        }`}
                        title={item.isPinned ? 'Lepas sematan' : 'Sematkan ucapan ke atas'}
                      >
                        <Pin className={`w-3 h-3 ${item.isPinned ? 'rotate-45 fill-amber-600 text-amber-600' : ''}`} />
                        <span>{item.isPinned ? 'Lepas Sematan' : 'Sematkan'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStartReply(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-all"
                      >
                        <CornerDownRight className="w-3 h-3 text-emerald-600" />
                        <span>{item.replyMessage ? 'Edit Balasan' : 'Balas Ucapan'}</span>
                      </button>
                    </div>

                    <span className="text-[9px] font-medium text-emerald-800/60 bg-emerald-50 px-2 py-0.5 rounded-full">
                      Akses Pengantin
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Quick Admin Login Prompt when not logged in */}
          {!isAdmin && onOpenAdmin && (
            <div className="pt-4 text-center">
              <button
                type="button"
                onClick={onOpenAdmin}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-botanical-champagne/60 hover:bg-botanical-champagne text-[11px] text-botanical-emerald font-medium border border-botanical-gold/25 transition-all hover:scale-101"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-botanical-gold" />
                <span>Pengantin ingin membalas atau menyematkan ucapan? Buka Mode Admin</span>
              </button>
            </div>
          )}
        </ScrollReveal>
      </div>
    </section>
  );
}
