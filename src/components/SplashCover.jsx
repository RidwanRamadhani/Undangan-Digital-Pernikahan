import React, { useState } from 'react';
import { MailOpen, Sparkles, Crown, ShieldCheck } from 'lucide-react';

export default function SplashCover({ guestName, isVip, onOpenInvitation, isOpen, onOpenAdmin }) {
  const [isClosing, setIsClosing] = useState(false);

  const handleOpen = () => {
    setIsClosing(true);
    setTimeout(() => {
      onOpenInvitation();
    }, 900); // allow slide-up animation to complete
  };

  if (isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-1000 ease-[cubic-bezier(0.77,0,0.175,1)] ${
        isClosing ? '-translate-y-full opacity-90' : 'translate-y-0 opacity-100'
      }`}
    >
      {/* Background Image with dark luxury emerald overlay */}
      <div className="absolute inset-0 bg-botanical-emerald">
        <img
          src="/images/couple_cover.jpg"
          alt="Ridwan & Salma"
          className="w-full h-full object-cover object-center opacity-40 scale-105 animate-kenburns"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-botanical-emerald-dark via-botanical-emerald/60 to-botanical-emerald-dark/80" />
      </div>

      {/* Decorative Golden Corner Borders */}
      <div className="absolute top-6 left-6 w-12 h-12 border-t-2 border-l-2 border-botanical-gold/60 pointer-events-none" />
      <div className="absolute top-6 right-6 w-12 h-12 border-t-2 border-r-2 border-botanical-gold/60 pointer-events-none" />
      <div className="absolute bottom-6 left-6 w-12 h-12 border-b-2 border-l-2 border-botanical-gold/60 pointer-events-none" />
      <div className="absolute bottom-6 right-6 w-12 h-12 border-b-2 border-r-2 border-botanical-gold/60 pointer-events-none" />

      {/* Admin Access Button on Top-Right Corner */}
      <button
        onClick={onOpenAdmin}
        className="absolute top-7 right-7 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-botanical-emerald/70 hover:bg-botanical-emerald border border-botanical-gold/40 text-botanical-gold-light text-[11px] font-medium backdrop-blur-md shadow-lg transition-transform active:scale-95"
        title="Masuk ke Dashboard Admin & WO (Perlu PIN)"
      >
        <ShieldCheck className="w-3.5 h-3.5 text-botanical-gold" />
        <span>Admin &amp; WO</span>
      </button>

      {/* Center Content Card */}
      <div className="relative z-10 max-w-md w-full mx-4 p-8 text-center text-white flex flex-col items-center">
        {/* Subtle decorative emblem */}
        <div className="w-14 h-14 rounded-full border border-botanical-gold/50 flex items-center justify-center mb-5 bg-botanical-emerald/40 backdrop-blur-sm">
          <Sparkles className="w-6 h-6 text-botanical-gold animate-pulse-subtle" />
        </div>

        <p className="font-script text-3xl md:text-4xl text-botanical-gold-light mb-1 tracking-wider">
          The Wedding of
        </p>

        <h1 className="font-serif text-4xl md:text-5xl font-semibold tracking-wide text-white mb-2">
          Ridwan &amp; Salma
        </h1>

        <div className="flex items-center gap-3 my-3">
          <div className="h-[1px] w-12 bg-botanical-gold/50" />
          <span className="text-xs uppercase tracking-widest text-botanical-gold font-medium">
            14 . 11 . 2026
          </span>
          <div className="h-[1px] w-12 bg-botanical-gold/50" />
        </div>

        {/* Personalized Guest Box */}
        <div className="w-full mt-6 mb-8 p-5 rounded-2xl glass-dark border border-botanical-gold/30 shadow-2xl relative overflow-hidden backdrop-blur-md">
          {/* VIP Badge */}
          {isVip && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-botanical-gold/20 border border-botanical-gold text-botanical-gold-light text-xs font-semibold mb-2 shadow-sm">
              <Crown className="w-3.5 h-3.5 text-botanical-gold" />
              <span>VIP GUEST</span>
            </div>
          )}

          <p className="text-xs uppercase tracking-wider text-gray-300 font-light mb-1">
            Kepada Yth. Bapak/Ibu/Saudara/i:
          </p>

          <h2 className="text-xl md:text-2xl font-serif font-bold text-botanical-gold-light tracking-wide my-1">
            {guestName || "Tamu Undangan"}
          </h2>

          <p className="text-[11px] text-gray-300 mt-2 italic leading-relaxed">
            Tanpa mengurangi rasa hormat, kami mengundang Anda untuk hadir dan memberikan doa restu di hari bahagia kami.
          </p>
        </div>

        {/* Buka Undangan Button */}
        <button
          onClick={handleOpen}
          className="group relative inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-gradient-to-r from-botanical-gold to-botanical-gold-dark text-botanical-emerald-dark font-semibold text-sm tracking-wide shadow-xl hover:shadow-botanical-gold/30 hover:scale-105 active:scale-95 transition-all duration-300"
        >
          <MailOpen className="w-4 h-4 transition-transform group-hover:rotate-12" />
          <span>Buka Undangan</span>
        </button>

        <p className="text-[10px] text-gray-400 mt-6 tracking-wider">
          *Sentuh tombol untuk membuka &amp; memutar musik
        </p>
      </div>
    </div>
  );
}
