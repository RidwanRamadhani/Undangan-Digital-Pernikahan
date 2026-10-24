import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Sparkles, Volume2, VolumeX, ShieldCheck } from 'lucide-react';

export default function DesktopLeftPanel({ 
  couple, 
  eventDate, 
  isAudioPlaying, 
  setIsAudioPlaying, 
  onOpenAdmin 
}) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const target = new Date(eventDate).getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const diff = Math.max(0, target - now);

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000)
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [eventDate]);

  return (
    <div className="hidden lg:block lg:w-[58%] xl:w-[60%] h-screen sticky top-0 left-0 overflow-hidden bg-botanical-emerald">
      {/* Background Image with Ken-Burns slow zoom effect */}
      <img
        src={couple.heroImage}
        alt="Ridwan & Salma"
        className="w-full h-full object-cover object-center scale-105 animate-kenburns opacity-70"
      />

      {/* Luxury Gradient Vignette Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-botanical-emerald-dark via-botanical-emerald-dark/40 to-botanical-emerald-dark/60" />

      {/* Decorative Golden Framing */}
      <div className="absolute top-8 left-8 right-8 bottom-8 border border-botanical-gold/30 rounded-3xl pointer-events-none" />
      <div className="absolute top-12 left-12 right-12 bottom-12 border border-botanical-gold/15 rounded-2xl pointer-events-none" />

      {/* Top Bar on Left Panel */}
      <div className="absolute top-14 left-16 right-16 flex items-center justify-between z-20">
        <div className="flex items-center gap-2 text-botanical-gold-light">
          <Sparkles className="w-4 h-4 text-botanical-gold animate-pulse-subtle" />
          <span className="text-xs uppercase tracking-widest font-medium">The Official Wedding Invitation</span>
        </div>

        {/* Admin Back-Office Toggle */}
        <button
          onClick={onOpenAdmin}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-botanical-emerald/60 hover:bg-botanical-emerald border border-botanical-gold/40 text-botanical-gold-light text-xs font-medium backdrop-blur-md transition-all hover:scale-105"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-botanical-gold" />
          <span>Admin &amp; Resepsionis</span>
        </button>
      </div>

      {/* Main Left Content */}
      <div className="absolute bottom-16 left-16 right-16 z-20 text-white">
        <p className="font-script text-4xl text-botanical-gold-light mb-2">
          The Wedding of
        </p>

        <h1 className="font-serif text-5xl xl:text-6xl font-medium tracking-wide mb-4 text-white">
          Ridwan &amp; Salma
        </h1>

        <div className="flex items-center gap-6 text-sm text-gray-200 mb-8 font-light">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-botanical-gold" />
            <span>Sabtu, 14 November 2026</span>
          </div>
          <div className="h-4 w-[1px] bg-botanical-gold/40" />
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-botanical-gold" />
            <span>Grand Hyatt, Jakarta</span>
          </div>
        </div>

        {/* Real-time Countdown Box */}
        <div className="p-5 rounded-2xl glass-dark border border-botanical-gold/30 max-w-lg mb-6 backdrop-blur-md">
          <p className="text-xs uppercase tracking-widest text-botanical-gold font-medium mb-3 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" />
            <span>Menghitung Hari Bahagia</span>
          </p>

          <div className="grid grid-cols-4 gap-3 text-center">
            <div className="p-2.5 rounded-xl bg-botanical-emerald/50 border border-botanical-gold/20">
              <span className="block text-2xl xl:text-3xl font-serif font-bold text-white">
                {String(timeLeft.days).padStart(2, '0')}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-botanical-gold">Hari</span>
            </div>
            <div className="p-2.5 rounded-xl bg-botanical-emerald/50 border border-botanical-gold/20">
              <span className="block text-2xl xl:text-3xl font-serif font-bold text-white">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-botanical-gold">Jam</span>
            </div>
            <div className="p-2.5 rounded-xl bg-botanical-emerald/50 border border-botanical-gold/20">
              <span className="block text-2xl xl:text-3xl font-serif font-bold text-white">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-botanical-gold">Menit</span>
            </div>
            <div className="p-2.5 rounded-xl bg-botanical-emerald/50 border border-botanical-gold/20">
              <span className="block text-2xl xl:text-3xl font-serif font-bold text-white">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-botanical-gold">Detik</span>
            </div>
          </div>
        </div>

        {/* Audio control status badge */}
        <div className="flex items-center justify-between text-xs text-gray-300 max-w-lg">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAudioPlaying(!isAudioPlaying)}
              className="p-2 rounded-full bg-botanical-emerald/80 border border-botanical-gold/40 text-botanical-gold hover:scale-105 transition-all"
            >
              {isAudioPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-gray-400" />}
            </button>
            <span className="text-gray-300 text-xs">
              {isAudioPlaying ? `Now Playing: ${couple.songTitle}` : 'Audio Dimatikan'}
            </span>
          </div>

          <span className="text-botanical-gold-light font-script text-xl">{couple.hashtag}</span>
        </div>
      </div>
    </div>
  );
}
