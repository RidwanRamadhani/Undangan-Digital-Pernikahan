import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Heart, Pin, CheckCircle2, XCircle, Clock } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

export default function WishesWall({ initialWishes, guestName, onToast }) {
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

  useEffect(() => {
    if (guestName) {
      setFormData((prev) => ({ ...prev, senderName: guestName }));
    }
  }, [guestName]);

  const handleSubmit = (e) => {
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

    const updated = [newWish, ...wishes];
    setWishes(updated);
    localStorage.setItem('wedding_wishes', JSON.stringify(updated));
    setLastSubmitTime(now);

    setFormData({
      senderName: guestName || '',
      attendanceBadge: 'Hadir',
      message: ''
    });

    if (onToast) {
      onToast({
        title: 'Doa Terkirim',
        message: 'Terima kasih atas untaian doa dan ucapan hangat Anda!'
      });
    }
  };

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
                placeholder="Tuliskan doa restu yang tulus untuk Ridwan & Salma..."
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
          <div className="space-y-4 max-h-[550px] overflow-y-auto pr-2 custom-scrollbar">
            {wishes.map((item) => (
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

                {item.replyMessage && (
                  <div className="p-3 rounded-xl bg-botanical-champagne/70 border-l-2 border-botanical-gold mt-2">
                    <span className="text-[10px] font-bold text-botanical-emerald flex items-center gap-1 mb-0.5">
                      <Heart className="w-2.5 h-2.5 fill-botanical-gold text-botanical-gold" />
                      <span>Balasan Ridwan &amp; Salma</span>
                    </span>
                    <p className="text-[11px] text-botanical-muted italic leading-relaxed">
                      {item.replyMessage}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
