import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import { CheckCircle2, QrCode, Download, Send, User, Users, Calendar, Sparkles } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

export default function RsvpSection({ guestName, isVip, maxPax = 2, onToast, onNewRsvp }) {
  const [formData, setFormData] = useState({
    name: guestName || '',
    whatsapp: '',
    attendance: 'attending', // attending | not_attending | tentative
    pax: 1,
    session: 'resepsi-1',
    note: ''
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [ticketData, setTicketData] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const ticketRef = useRef(null);

  useEffect(() => {
    if (guestName) {
      setFormData((prev) => ({ ...prev, name: guestName }));
    }
  }, [guestName]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      if (onToast) onToast({ type: 'error', title: 'Perhatian', message: 'Silakan isi nama Anda terlebih dahulu.' });
      return;
    }

    const uniqueSlug = 'RSVP-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const submission = {
      ...formData,
      slug: uniqueSlug,
      isVip,
      submittedAt: new Date().toISOString()
    };

    const savedGuests = JSON.parse(localStorage.getItem('wedding_guests') || '[]');
    savedGuests.unshift(submission);
    localStorage.setItem('wedding_guests', JSON.stringify(savedGuests));

    if (onNewRsvp) {
      onNewRsvp(submission);
    }

    const qrPayload = JSON.stringify({
      code: uniqueSlug,
      name: formData.name,
      pax: formData.pax,
      session: formData.session,
      vip: isVip
    });

    try {
      const url = await QRCode.toDataURL(qrPayload, {
        width: 300,
        margin: 2,
        color: {
          dark: '#1C2A24',
          light: '#FFFFFF',
        },
      });
      setQrDataUrl(url);
    } catch (err) {
      console.error('QR Code error:', err);
    }

    setTicketData(submission);
    setIsSubmitted(true);

    if (formData.attendance === 'attending') {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#C5A059', '#1C2A24', '#FAF8F5', '#E7D1A2']
      });
    }

    if (onToast) {
      onToast({
        title: 'Konfirmasi Terkirim',
        message: 'Terima kasih, konfirmasi kehadiran Anda telah berhasil kami catat!'
      });
    }
  };

  const handleDownloadTicket = () => {
    if (!ticketData || !qrDataUrl) return;

    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 840;
    const ctx = canvas.getContext('2d');

    const bgGrad = ctx.createLinearGradient(0, 0, 0, 840);
    bgGrad.addColorStop(0, '#1C2A24');
    bgGrad.addColorStop(1, '#121D18');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 600, 840);

    ctx.strokeStyle = '#C5A059';
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, 560, 800);

    ctx.strokeStyle = 'rgba(197, 160, 89, 0.4)';
    ctx.lineWidth = 1;
    ctx.strokeRect(28, 28, 544, 784);

    ctx.fillStyle = '#C5A059';
    ctx.font = 'italic 28px serif';
    ctx.textAlign = 'center';
    ctx.fillText('The Wedding of', 300, 75);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px serif';
    ctx.fillText('Ridwan & Salma', 300, 120);

    ctx.fillStyle = '#E7D1A2';
    ctx.font = '14px sans-serif';
    ctx.fillText('OFFICIAL GUEST PASS / E-TICKET', 300, 150);

    ctx.strokeStyle = 'rgba(197, 160, 89, 0.5)';
    ctx.beginPath();
    ctx.moveTo(60, 175);
    ctx.lineTo(540, 175);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.fillRect(60, 195, 480, 180);
    ctx.strokeStyle = 'rgba(197, 160, 89, 0.3)';
    ctx.strokeRect(60, 195, 480, 180);

    ctx.fillStyle = '#C5A059';
    ctx.font = '13px sans-serif';
    ctx.fillText('NAMA TAMU / GUEST NAME', 300, 225);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText(ticketData.name, 300, 260);

    ctx.fillStyle = '#E7D1A2';
    ctx.font = '15px sans-serif';
    ctx.fillText(`Kuota: ${ticketData.pax} Orang | Sesi: ${ticketData.session.toUpperCase()}`, 300, 295);

    ctx.fillStyle = '#9E7D3B';
    ctx.font = 'bold 16px monospace';
    ctx.fillText(`KODE PASS: ${ticketData.slug}`, 300, 335);

    const qrImg = new Image();
    qrImg.onload = () => {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(175, 400, 250, 250);
      ctx.drawImage(qrImg, 185, 410, 230, 230);

      ctx.fillStyle = '#E7D1A2';
      ctx.font = '13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Tunjukkan QR Code ini di meja resepsionis', 300, 690);

      ctx.fillStyle = '#A0A0A0';
      ctx.font = '12px sans-serif';
      ctx.fillText('Sabtu, 14 November 2026 • Grand Hyatt Jakarta', 300, 720);

      const pngUrl = canvas.toDataURL('image/png');
      const dlLink = document.createElement('a');
      dlLink.href = pngUrl;
      dlLink.download = `E-Ticket-RidwanSalma-${ticketData.slug}.png`;
      document.body.appendChild(dlLink);
      dlLink.click();
      document.body.removeChild(dlLink);

      if (onToast) {
        onToast({
          title: 'Tiket Berhasil Diunduh',
          message: 'Simpan tiket QR di galeri HP Anda untuk registrasi di lokasi.'
        });
      }
    };
    qrImg.src = qrDataUrl;
  };

  return (
    <section id="rsvp" className="py-12 px-6 md:px-10">
      <ScrollReveal animation="fade-up" className="text-center mb-10">
        <span className="text-[11px] uppercase tracking-widest text-botanical-gold-dark font-semibold">
          Konfirmasi Kehadiran
        </span>
        <h2 className="font-serif text-3xl md:text-4xl font-semibold text-botanical-obsidian mt-1 mb-2">
          Reservasi &amp; E-Ticket
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
            {isVip && (
              <div className="p-3 rounded-2xl bg-botanical-champagne border border-botanical-gold/40 flex items-center gap-2.5 text-xs text-botanical-emerald">
                <Sparkles className="w-4 h-4 text-botanical-gold-dark shrink-0" />
                <span>Undangan VIP: Kuota reservasi diprioritaskan khusus untuk Anda.</span>
              </div>
            )}

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
              <label className="block text-xs font-semibold text-botanical-obsidian mb-1.5">
                No. WhatsApp (Untuk Pengiriman E-Ticket)
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
                    <option value={2}>2 Orang (Maksimal)</option>
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
                    <option value="akad">Akad Saja (08:00)</option>
                    <option value="resepsi-1">Resepsi Sesi 1 (11:00)</option>
                    <option value="resepsi-2">Resepsi Sesi 2 (18:30)</option>
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-botanical-obsidian mb-1.5">
                Pesan Khusus (Opsional)
              </label>
              <textarea
                rows={2}
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                placeholder="Tuliskan ucapan atau catatan untuk pengantin..."
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
          <div className="p-6 md:p-8 rounded-3xl glass-dark text-white border border-botanical-gold shadow-2xl relative overflow-hidden text-center animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-botanical-gold/20 border border-botanical-gold text-botanical-gold flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <span className="text-[11px] uppercase tracking-widest text-botanical-gold font-semibold">
              Konfirmasi Berhasil Diterima
            </span>

            <h3 className="font-serif text-2xl font-bold text-white mt-1 mb-2">
              Kartu Akses QR / E-Ticket
            </h3>

            <p className="text-xs text-gray-300 max-w-sm mx-auto mb-6">
              Terima kasih atas konfirmasinya, <strong className="text-botanical-gold-light">{ticketData.name}</strong>. Simpan kartu pass QR Code berikut untuk registrasi cepat di meja resepsionis.
            </p>

            <div
              ref={ticketRef}
              className="p-6 rounded-2xl bg-botanical-emerald-dark/80 border border-botanical-gold/40 shadow-inner max-w-sm mx-auto mb-6"
            >
              <p className="font-serif text-sm italic text-botanical-gold">The Wedding of Ridwan &amp; Salma</p>
              <p className="text-xs text-gray-300 mb-3">Sabtu, 14 November 2026 • Grand Hyatt Jakarta</p>

              <div className="w-48 h-48 bg-white p-3 rounded-2xl mx-auto my-3 shadow-md border-2 border-botanical-gold flex items-center justify-center">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="QR Code E-Ticket" className="w-full h-full object-contain" />
                ) : (
                  <QrCode className="w-24 h-24 text-botanical-emerald animate-pulse" />
                )}
              </div>

              <div className="text-xs space-y-1 mt-3">
                <p className="font-semibold text-white text-sm">{ticketData.name}</p>
                <p className="text-gray-300">
                  Status: <span className="text-botanical-gold font-medium">Terkonfirmasi ({ticketData.pax} Orang)</span>
                </p>
                <p className="text-gray-400 text-[11px]">Sesi: {ticketData.session.toUpperCase()}</p>
                <p className="font-mono text-botanical-gold-light text-xs mt-2 tracking-wider">
                  PASS CODE: {ticketData.slug}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto">
              <button
                onClick={handleDownloadTicket}
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-botanical-gold hover:bg-botanical-gold-dark text-botanical-emerald-dark font-bold text-xs shadow-lg hover:scale-102 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Unduh E-Ticket (PNG)</span>
              </button>

              <button
                onClick={() => setIsSubmitted(false)}
                className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-all"
              >
                Ubah Data
              </button>
            </div>
          </div>
        )}
      </ScrollReveal>
    </section>
  );
}
