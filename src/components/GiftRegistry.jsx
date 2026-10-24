import React, { useState } from 'react';
import QRCode from 'qrcode';
import { CreditCard, QrCode, Gift, Copy, Check, Send, Download } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

export default function GiftRegistry({ bankAccounts, giftAddress, initialWishlist, onToast }) {
  const [activeTab, setActiveTab] = useState('bank'); // bank | qris | physical
  const [copiedAccount, setCopiedAccount] = useState(null);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [wishlist, setWishlist] = useState(initialWishlist);
  const [selectedGiftForClaim, setSelectedGiftForClaim] = useState(null);
  const [claimerName, setClaimerName] = useState('');

  const handleCopyAccount = (accountNumber, bankName) => {
    navigator.clipboard.writeText(accountNumber);
    setCopiedAccount(accountNumber);
    setTimeout(() => setCopiedAccount(null), 2500);

    if (onToast) {
      onToast({
        title: 'Nomor Rekening Disalin',
        message: `Nomor rekening ${bankName} (${accountNumber}) berhasil disalin ke clipboard.`
      });
    }
  };

  const handleCopyAddress = () => {
    const fullText = `${giftAddress.recipient} - ${giftAddress.phone}\n${giftAddress.address}\n(${giftAddress.notes})`;
    navigator.clipboard.writeText(fullText);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2500);

    if (onToast) {
      onToast({
        title: 'Alamat Pengiriman Disalin',
        message: 'Alamat penerima kado fisik berhasil disalin.'
      });
    }
  };

  const handleConfirmClaim = () => {
    if (!claimerName.trim()) {
      if (onToast) onToast({ type: 'error', title: 'Perhatian', message: 'Silakan isi nama Anda untuk reservasi kado.' });
      return;
    }

    const updated = wishlist.map((item) =>
      item.id === selectedGiftForClaim.id
        ? { ...item, claimed: true, claimedBy: claimerName }
        : item
    );
    setWishlist(updated);

    if (onToast) {
      onToast({
        title: 'Kado Berhasil Diklaim',
        message: `Terima kasih! Kado "${selectedGiftForClaim.name}" telah ditandai dipesan oleh ${claimerName}.`
      });
    }

    setSelectedGiftForClaim(null);
    setClaimerName('');
  };

  const handleDownloadQris = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 450;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 450, 600);

    ctx.fillStyle = '#D32F2F';
    ctx.fillRect(0, 0, 450, 75);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('QRIS STANDAR PEMBAYARAN', 225, 48);

    ctx.fillStyle = '#1A1A1A';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('WEDDING RIDWAN & SALMA', 225, 115);

    ctx.fillStyle = '#666666';
    ctx.font = '12px sans-serif';
    ctx.fillText('NMID: ID1020261114999', 225, 138);

    QRCode.toCanvas(canvas, '00020101021226680016ID.CO.QRIS.WWW01189360099800000000005204581253033605802ID5919RIDWAN SALMA WEDDING6007JAKARTA6304ABCD', {
      width: 320,
      margin: 1
    }, () => {
      ctx.fillStyle = '#1C2A24';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Dapat dipindai dengan BCA, Mandiri, GoPay, OVO, Dana, dll.', 225, 520);
      ctx.fillStyle = '#888888';
      ctx.font = '11px sans-serif';
      ctx.fillText('Terima kasih atas tanda kasih dan doa restu Anda', 225, 545);

      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = 'QRIS-Ridwan-Salma-Wedding.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      if (onToast) {
        onToast({
          title: 'QRIS Diunduh',
          message: 'Gambar QRIS berhasil disimpan.'
        });
      }
    });
  };

  return (
    <section id="kado" className="py-12 px-6 md:px-10">
      <ScrollReveal animation="fade-up" className="text-center mb-10">
        <span className="text-[11px] uppercase tracking-widest text-botanical-gold-dark font-semibold">
          Tanda Kasih
        </span>
        <h2 className="font-serif text-3xl md:text-4xl font-semibold text-botanical-obsidian mt-1 mb-2">
          Amplop Digital &amp; Kado
        </h2>
        <p className="text-xs text-botanical-muted max-w-sm mx-auto leading-relaxed">
          Doa restu Anda merupakan karunia terindah bagi kami. Namun jika Anda bermaksud memberikan tanda kasih, kami menyediakan kemudahan melalui:
        </p>
      </ScrollReveal>

      <ScrollReveal animation="scale" delay={150} className="max-w-xl mx-auto">
        {/* Navigation Tabs */}
        <div className="flex rounded-2xl bg-botanical-champagne/70 p-1 mb-8 border border-botanical-gold/30">
          {[
            { id: 'bank', label: 'Transfer Bank', icon: CreditCard },
            { id: 'qris', label: 'QRIS Digital', icon: QrCode },
            { id: 'physical', label: 'Kirim Kado / Registry', icon: Gift },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-botanical-emerald text-white shadow-md'
                    : 'text-botanical-muted hover:text-botanical-obsidian'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${activeTab === tab.id ? 'text-botanical-gold' : ''}`} />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.id.toUpperCase()}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: BANK TRANSFER LUXURY CARDS */}
        {activeTab === 'bank' && (
          <div className="space-y-6 animate-fade-in">
            {bankAccounts.map((acc, index) => (
              <div
                key={index}
                className="relative rounded-3xl p-6 md:p-8 bg-gradient-to-br from-botanical-emerald via-botanical-emerald-light to-botanical-emerald-dark text-white shadow-2xl border border-botanical-gold/40 overflow-hidden"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="w-12 h-9 rounded-lg bg-gradient-to-tr from-amber-300 via-yellow-100 to-amber-500 shadow-md border border-amber-600/50 flex flex-col justify-around p-1">
                    <div className="h-[1px] bg-amber-700/60" />
                    <div className="h-[1px] bg-amber-700/60" />
                  </div>
                  <span className="font-serif text-xl font-bold tracking-widest text-botanical-gold-light">
                    {acc.bank}
                  </span>
                </div>

                <div className="mb-6">
                  <span className="text-[10px] uppercase tracking-widest text-gray-300 font-light block mb-1">
                    Nomor Rekening
                  </span>
                  <p className="font-mono text-2xl md:text-3xl font-bold tracking-widest text-white">
                    {acc.accountNumber}
                  </p>
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-gray-300 font-light block">
                      Atas Nama
                    </span>
                    <p className="font-medium text-sm text-botanical-gold-light tracking-wide mt-0.5">
                      {acc.accountHolder}
                    </p>
                  </div>

                  <button
                    onClick={() => handleCopyAccount(acc.accountNumber, acc.bank)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-botanical-gold hover:bg-botanical-gold-light text-botanical-emerald-dark text-xs font-bold shadow-lg transition-transform active:scale-95"
                  >
                    {copiedAccount === acc.accountNumber ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin Rekening</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 2: QRIS DIGITAL */}
        {activeTab === 'qris' && (
          <div className="p-6 md:p-8 rounded-3xl glass-card border border-botanical-gold/30 shadow-xl text-center animate-fade-in">
            <span className="text-[11px] uppercase tracking-widest text-botanical-gold-dark font-semibold">
              Scan untuk Semua Pembayaran
            </span>
            <h3 className="font-serif text-2xl font-bold text-botanical-emerald mt-1 mb-1">
              QRIS Pernikahan
            </h3>
            <p className="text-xs text-botanical-muted mb-6">
              Mendukung BCA, Mandiri, BRI, BNI, GoPay, OVO, ShopeePay, Dana, &amp; LinkAja
            </p>

            <div className="max-w-xs mx-auto p-4 rounded-2xl bg-white shadow-xl border-2 border-botanical-gold/40 mb-6">
              <div className="border-b border-gray-200 pb-2 mb-3">
                <span className="text-xs font-bold text-rose-600 tracking-wider">QRIS STANDAR NASIONAL</span>
                <p className="text-[11px] font-semibold text-gray-800">RIDWAN &amp; SALMA WEDDING</p>
                <p className="text-[9px] text-gray-500">NMID: ID1020261114999</p>
              </div>

              <div className="w-52 h-52 mx-auto bg-gray-50 p-2 rounded-xl border flex items-center justify-center">
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=00020101021226680016ID.CO.QRIS.WWW01189360099800000000005204581253033605802ID5919RIDWAN%20SALMA%20WEDDING6007JAKARTA6304ABCD"
                  alt="QRIS Digital"
                  className="w-full h-full object-contain"
                />
              </div>

              <p className="text-[10px] text-gray-500 mt-3 italic">
                Pindai dengan kamera atau aplikasi perbankan Anda
              </p>
            </div>

            <button
              onClick={handleDownloadQris}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-botanical-emerald text-white text-xs font-semibold shadow hover:bg-botanical-emerald-light transition-all"
            >
              <Download className="w-4 h-4 text-botanical-gold" />
              <span>Unduh Gambar QRIS</span>
            </button>
          </div>
        )}

        {/* TAB 3: PHYSICAL GIFT & REGISTRY */}
        {activeTab === 'physical' && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-6 rounded-3xl glass-card border border-botanical-gold/30 shadow-lg">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-botanical-gold-dark" />
                  <h4 className="font-serif text-lg font-bold text-botanical-emerald">
                    Alamat Pengiriman Kado
                  </h4>
                </div>
                <span className="text-[10px] uppercase font-semibold text-botanical-gold-dark bg-botanical-champagne px-2.5 py-0.5 rounded-full border border-botanical-gold/30">
                  Resmi
                </span>
              </div>

              <div className="text-xs text-botanical-muted space-y-1 mb-4 leading-relaxed">
                <p className="font-semibold text-botanical-obsidian">{giftAddress.recipient}</p>
                <p>{giftAddress.phone}</p>
                <p>{giftAddress.address}</p>
                <p className="text-[11px] italic text-botanical-gold-dark mt-1">({giftAddress.notes})</p>
              </div>

              <button
                onClick={handleCopyAddress}
                className="w-full py-2.5 rounded-xl bg-botanical-champagne hover:bg-botanical-gold/20 text-botanical-emerald text-xs font-semibold border border-botanical-gold/40 flex items-center justify-center gap-2 transition-all"
              >
                {copiedAddress ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-botanical-gold-dark" />}
                <span>{copiedAddress ? 'Alamat Berhasil Disalin' : 'Salin Alamat Lengkap'}</span>
              </button>
            </div>

            <div className="p-6 rounded-3xl glass-card border border-botanical-gold/30 shadow-lg">
              <div className="mb-4">
                <h4 className="font-serif text-lg font-bold text-botanical-emerald">
                  Wedding Gift Registry
                </h4>
                <p className="text-xs text-botanical-muted">
                  Daftar kebutuhan rumah tangga yang dapat Anda reservasi agar kado tidak ganda:
                </p>
              </div>

              <div className="space-y-3">
                {wishlist.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-white/80 border border-botanical-gold/25 flex items-center justify-between gap-3 shadow-sm"
                  >
                    <div>
                      <span className="text-[10px] text-botanical-gold-dark font-semibold uppercase tracking-wider block">
                        {item.category}
                      </span>
                      <p className="text-xs font-bold text-botanical-obsidian">
                        {item.name}
                      </p>
                      <span className="text-[11px] text-botanical-muted">
                        Estimasi: {item.priceEst}
                      </span>
                    </div>

                    {item.claimed ? (
                      <span className="px-3 py-1.5 rounded-xl bg-gray-100 text-gray-500 text-[11px] font-medium border border-gray-200 whitespace-nowrap">
                        Sudah Dipesan ({item.claimedBy})
                      </span>
                    ) : (
                      <button
                        onClick={() => setSelectedGiftForClaim(item)}
                        className="px-3 py-1.5 rounded-xl bg-botanical-emerald hover:bg-botanical-emerald-light text-botanical-gold text-[11px] font-semibold shadow transition-all whitespace-nowrap"
                      >
                        Saya Belikan Ini
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <a
            href={`https://wa.me/6281288889999?text=${encodeURIComponent(
              'Halo Ridwan & Salma, saya ingin mengonfirmasi pengiriman tanda kasih / kado pernikahan untuk kalian. Semoga berkah dan bahagia selalu!'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium shadow-md transition-all hover:scale-102"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Konfirmasi Tanda Kasih via WhatsApp</span>
          </a>
        </div>
      </ScrollReveal>

      {/* Claim Gift Modal */}
      {selectedGiftForClaim && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 rounded-3xl glass-card bg-white shadow-2xl border border-botanical-gold text-center animate-fade-in">
            <Gift className="w-10 h-10 text-botanical-gold mx-auto mb-3" />
            <h4 className="font-serif text-xl font-bold text-botanical-emerald mb-1">
              Reservasi Kado
            </h4>
            <p className="text-xs text-botanical-muted mb-4">
              Anda akan menandai barang berikut sebagai pilihan kado Anda:
            </p>

            <div className="p-3 rounded-2xl bg-botanical-champagne/60 border border-botanical-gold/30 mb-5">
              <p className="text-sm font-bold text-botanical-obsidian">{selectedGiftForClaim.name}</p>
              <p className="text-xs text-botanical-gold-dark mt-0.5">{selectedGiftForClaim.category}</p>
            </div>

            <input
              type="text"
              placeholder="Masukkan Nama Anda (contoh: Gina & Reza)"
              value={claimerName}
              onChange={(e) => setClaimerName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-botanical-gold/40 text-xs mb-4 focus:ring-2 focus:ring-botanical-gold outline-none"
            />

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSelectedGiftForClaim(null)}
                className="py-2.5 rounded-xl border border-gray-300 text-xs font-semibold text-gray-600 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmClaim}
                className="py-2.5 rounded-xl bg-botanical-emerald hover:bg-botanical-emerald-light text-white text-xs font-semibold shadow"
              >
                Konfirmasi Kado
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
