import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, Send, User, Users, Calendar, Heart, Phone, Sparkles, RefreshCw } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

export default function RsvpSection({ guestName, maxPax = 2, onToast, onNewRsvp }) {
  const [formData, setFormData] = useState({
    name: guestName || '',
    whatsapp: '',
    attendance: 'attending', // attending | not_attending | tentative
    pax: 1,
    session: 'resepsi-1',
    note: ''
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);

  useEffect(() => {
    if (guestName) {
      setFormData((prev) => ({ ...prev, name: guestName }));
    }
  }, [guestName]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      if (onToast) onToast({ type: 'error', title: 'Perhatian', message: 'Silakan isi nama Anda terlebih dahulu.' });
      return;
    }

    const uniqueId = 'RSVP-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const rsvpStatus = formData.attendance === 'attending' 
      ? 'Hadir' 
      : (formData.attendance === 'not_attending' ? 'Berhalangan' : 'Ragu-ragu');

    const submission = {
      id: uniqueId,
      name: formData.name.trim(),
      whatsapp: formData.whatsapp ? formData.whatsapp.trim() : '',
      phone: formData.whatsapp ? formData.whatsapp.trim() : '',
      attendance: formData.attendance,
      rsvp: rsvpStatus,
      pax: Number(formData.pax) || 1,
      session: formData.session,
      note: formData.note ? formData.note.trim() : '',
      slug: uniqueId,
      submittedAt: new Date().toISOString()
    };

    // 1. Simpan ke wedding_guests (update jika nama sudah ada)
    const savedGuests = JSON.parse(localStorage.getItem('wedding_guests') || '[]');
    const existingRsvpIdx = savedGuests.findIndex(
      g => g.name && g.name.trim().toLowerCase() === submission.name.toLowerCase()
    );
    if (existingRsvpIdx !== -1) {
      savedGuests[existingRsvpIdx] = submission;
    } else {
      savedGuests.unshift(submission);
    }
    localStorage.setItem('wedding_guests', JSON.stringify(savedGuests));

    // 2. Sinkronkan LANGSUNG ke admin_guest_list (Dashboard Admin)
    const existingAdminGuests = JSON.parse(localStorage.getItem('admin_guest_list') || '[]');
    const adminMatchIdx = existingAdminGuests.findIndex(
      g => g.name && g.name.trim().toLowerCase() === submission.name.toLowerCase()
    );

    if (adminMatchIdx !== -1) {
      existingAdminGuests[adminMatchIdx] = {
        ...existingAdminGuests[adminMatchIdx],
        rsvp: rsvpStatus,
        pax: submission.pax,
        session: submission.session,
        note: submission.note,
        phone: submission.whatsapp || existingAdminGuests[adminMatchIdx].phone || '',
        updatedAt: submission.submittedAt
      };
    } else {
      existingAdminGuests.unshift({
        id: uniqueId,
        name: submission.name,
        phone: submission.whatsapp || '',
        pax: submission.pax,
        rsvp: rsvpStatus,
        session: submission.session,
        note: submission.note,
        slug: uniqueId,
        submittedAt: submission.submittedAt
      });
    }
    localStorage.setItem('admin_guest_list', JSON.stringify(existingAdminGuests));

    // 3. Simpan juga pesan doa restu ke Wishes Wall bila diisi
    if (submission.note) {
      try {
        const savedWishes = JSON.parse(localStorage.getItem('wedding_wishes') || '[]');
        const wishExists = savedWishes.some(
          w => w.senderName && w.senderName.trim().toLowerCase() === submission.name.toLowerCase() && w.message.trim() === submission.note
        );
        if (!wishExists) {
          savedWishes.unshift({
            id: 'wish-rsvp-' + Date.now(),
            senderName: submission.name,
            attendanceBadge: rsvpStatus,
            message: submission.note,
            createdAt: 'Baru saja'
          });
          localStorage.setItem('wedding_wishes', JSON.stringify(savedWishes));
          window.dispatchEvent(new Event('wedding_wishes_updated'));
        }
      } catch (err) {
        console.error(err);
      }
    }

    // 4. Picu global event agar panel admin langsung merender data terbaru
    window.dispatchEvent(new Event('wedding_guest_updated'));

    if (onNewRsvp) {
      onNewRsvp(submission);
    }

    setSubmittedData(submission);
    setIsSubmitted(true);

    if (formData.attendance === 'attending') {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#C5A059', '#1C2A24', '#FAF8F5', '#E7D1A2']
      });
    }

    if (onToast) {
      onToast({
        title: 'Konfirmasi Diterima',
        message: 'Terima kasih, konfirmasi kehadiran Anda telah berhasil kami catat.'
      });
    }
  };

  const getSessionLabel = (session) => {
    switch (session) {
      case 'akad':
        return 'Akad Nikah (08:00 WIB)';
      case 'resepsi-2':
        return 'Resepsi Sesi 2 (18:30 - 21:00 WIB)';
      case 'resepsi-1':
      default:
        return 'Resepsi Sesi 1 (11:00 - 14:00 WIB)';
    }
  };

  const getAttendanceLabel = (status) => {
    switch (status) {
      case 'attending':
        return 'Insya Allah Hadir';
      case 'not_attending':
        return 'Mohon Maaf Berhalangan';
      case 'tentative':
      default:
        return 'Masih Belum Pasti';
    }
  };

  return (
    <section id="rsvp" className="py-12 px-6 md:px-10">
      <ScrollReveal animation="fade-up" className="text-center mb-10">
        <span className="text-[11px] uppercase tracking-widest text-botanical-gold-dark font-semibold">
          Konfirmasi Kehadiran
        </span>
        <h2 className="font-serif text-3xl md:text-4xl font-semibold text-botanical-obsidian mt-1 mb-2">
          Reservasi Kehadiran
        </h2>
        <p className="text-xs text-botanical-muted max-w-sm mx-auto leading-relaxed">
          Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir memberikan doa restu.
        </p>
      </ScrollReveal>

      <ScrollReveal animation="scale" delay={150} className="max-w-xl mx-auto">
        {!isSubmitted ? (
          <form
            onSubmit={handleSubmit}
            className="p-6 md:p-8 rounded-3xl glass-card border border-botanical-gold/30 shadow-xl space-y-5"
          >
            <div>
              <label className="block text-xs font-semibold text-botanical-obsidian mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-botanical-gold-dark" />
                <span>Nama Lengkap Tamu</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Budi Santoso & Partner"
                className="w-full px-4 py-3 rounded-xl bg-white/90 border border-botanical-gold/30 focus:outline-none focus:ring-2 focus:ring-botanical-gold text-xs text-botanical-obsidian shadow-inner"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-botanical-obsidian mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-botanical-gold-dark" />
                <span>No. WhatsApp (Opsional)</span>
              </label>
              <input
                type="tel"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                placeholder="0812xxxxxxx"
                className="w-full px-4 py-3 rounded-xl bg-white/90 border border-botanical-gold/30 focus:outline-none focus:ring-2 focus:ring-botanical-gold text-xs text-botanical-obsidian shadow-inner"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-botanical-obsidian mb-2">
                Konfirmasi Kehadiran
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'attending', label: 'Akan Hadir' },
                  { id: 'not_attending', label: 'Berhalangan' },
                  { id: 'tentative', label: 'Masih Ragu' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, attendance: opt.id })}
                    className={`py-3 px-2 rounded-xl text-xs font-semibold transition-all border ${
                      formData.attendance === opt.id
                        ? 'bg-botanical-emerald text-white border-botanical-gold shadow-md'
                        : 'bg-white/60 text-botanical-muted border-botanical-gold/20 hover:bg-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {formData.attendance === 'attending' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-botanical-obsidian mb-1.5 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-botanical-gold-dark" />
                    <span>Jumlah Tamu</span>
                  </label>
                  <select
                    value={formData.pax}
                    onChange={(e) => setFormData({ ...formData, pax: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/90 border border-botanical-gold/30 focus:outline-none focus:ring-2 focus:ring-botanical-gold text-xs text-botanical-obsidian shadow-inner"
                  >
                    <option value={1}>1 Orang</option>
                    <option value={2}>2 Orang</option>
                    <option value={3}>3 Orang</option>
                    <option value={4}>4 Orang</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-botanical-obsidian mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-botanical-gold-dark" />
                    <span>Pilihan Sesi Acara</span>
                  </label>
                  <select
                    value={formData.session}
                    onChange={(e) => setFormData({ ...formData, session: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/90 border border-botanical-gold/30 focus:outline-none focus:ring-2 focus:ring-botanical-gold text-xs text-botanical-obsidian shadow-inner"
                  >
                    <option value="akad">Akad Nikah (08:00)</option>
                    <option value="resepsi-1">Resepsi Sesi 1 (11:00)</option>
                    <option value="resepsi-2">Resepsi Sesi 2 (18:30)</option>
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-botanical-obsidian mb-1.5">
                Ucapan &amp; Doa Restu (Opsional)
              </label>
              <textarea
                rows={3}
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                placeholder="Tuliskan ucapan atau doa restu untuk kedua mempelai..."
                className="w-full px-4 py-2.5 rounded-xl bg-white/90 border border-botanical-gold/30 focus:outline-none focus:ring-2 focus:ring-botanical-gold text-xs text-botanical-obsidian shadow-inner"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-botanical-emerald via-botanical-emerald-light to-botanical-emerald text-white text-xs font-semibold tracking-wider uppercase shadow-xl hover:shadow-botanical-emerald/30 hover:scale-101 active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4 text-botanical-gold" />
              <span>Kirim Konfirmasi Kehadiran</span>
            </button>
          </form>
        ) : (
          <div className="p-7 md:p-9 rounded-3xl glass-dark text-white border border-botanical-gold/60 shadow-2xl relative overflow-hidden text-center animate-fade-in">
            {/* Ambient gold glow */}
            <div className="w-14 h-14 rounded-full bg-botanical-gold/20 border border-botanical-gold text-botanical-gold flex items-center justify-center mx-auto mb-4 shadow-lg">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <span className="text-[11px] uppercase tracking-widest text-botanical-gold font-semibold">
              Konfirmasi Berhasil Tersimpan
            </span>

            <h3 className="font-serif text-2xl md:text-3xl font-bold text-white mt-1 mb-3">
              Terima Kasih Banyak!
            </h3>

            <p className="text-xs text-gray-200 max-w-md mx-auto mb-6 leading-relaxed">
              Konfirmasi kehadiran Anda, <strong className="text-botanical-gold-light">{submittedData.name}</strong>, telah tersimpan rapi dalam daftar tamu kami. Kami sangat berbahagia dan menantikan kehadiran Anda di hari istimewa kami.
            </p>

            {/* Ringkasan Konfirmasi */}
            <div className="p-5 rounded-2xl bg-botanical-emerald-dark/80 border border-botanical-gold/30 text-left max-w-md mx-auto mb-6 space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-botanical-gold/20">
                <span className="text-xs text-gray-400">Nama Tamu</span>
                <span className="text-xs font-bold text-white">{submittedData.name}</span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-botanical-gold/20">
                <span className="text-xs text-gray-400">Status Kehadiran</span>
                <span className="text-xs font-semibold text-botanical-gold-light">
                  {getAttendanceLabel(submittedData.attendance)}
                </span>
              </div>

              {submittedData.attendance === 'attending' && (
                <>
                  <div className="flex items-center justify-between pb-2 border-b border-botanical-gold/20">
                    <span className="text-xs text-gray-400">Jumlah Tamu</span>
                    <span className="text-xs font-semibold text-white">{submittedData.pax} Orang</span>
                  </div>

                  <div className="flex items-center justify-between pb-2 border-b border-botanical-gold/20">
                    <span className="text-xs text-gray-400">Sesi Acara</span>
                    <span className="text-xs font-medium text-gray-200">{getSessionLabel(submittedData.session)}</span>
                  </div>
                </>
              )}

              {submittedData.note && (
                <div className="pt-1">
                  <span className="text-[11px] text-gray-400 block mb-1">Pesan / Doa:</span>
                  <p className="text-xs italic text-gray-200 bg-white/5 p-2.5 rounded-lg border border-white/10">
                    "{submittedData.note}"
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-botanical-gold-light mb-6 font-serif italic">
              <Sparkles className="w-3.5 h-3.5 text-botanical-gold" />
              <span>Selasa, 2 Februari 2027 • Benda, Kota Tangerang</span>
              <Sparkles className="w-3.5 h-3.5 text-botanical-gold" />
            </div>

            <button
              onClick={() => setIsSubmitted(false)}
              className="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/25 transition-all hover:scale-102"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Perbarui Jawaban</span>
            </button>
          </div>
        )}
      </ScrollReveal>
    </section>
  );
}