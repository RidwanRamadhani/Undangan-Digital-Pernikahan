import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Download, ExternalLink, Heart, Sparkles, MapPin, Volume2, ShieldCheck } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

export default function HeroSection({ couple, eventDate, eventDateFormatted, onToast, onOpenAdmin }) {
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

  // Google Calendar Link generator
  const getGoogleCalendarUrl = () => {
    const title = encodeURIComponent("The Wedding of Ridwan & Salma");
    const details = encodeURIComponent("Akad Nikah & Resepsi Pernikahan Muhammad Ridwan & Salma Anindya di Grand Hyatt Jakarta.");
    const location = encodeURIComponent("The Grand Heritage Ballroom, Grand Hyatt Jakarta, Jl. M.H. Thamrin Kav. 28-30, Jakarta Pusat");
    const dates = "20261114T010000Z/20261114T140000Z";
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${dates}`;
  };

  // Apple / Outlook .ics download generator
  const downloadIcsFile = () => {
    const icsData = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Ridwan and Salma Wedding//ID",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      "UID:wedding-ridwan-salma-20261114@wedding.id",
      "DTSTAMP:20261024T000000Z",
      "DTSTART:20261114T010000Z",
      "DTEND:20261114T140000Z",
      "SUMMARY:The Wedding of Ridwan & Salma",
      "DESCRIPTION:Pernikahan Muhammad Ridwan & Salma Anindya. Kami sangat menantikan kehadiran Anda!",
      "LOCATION:The Grand Heritage Ballroom, Grand Hyatt Jakarta",
      "STATUS:CONFIRMED",
      "BEGIN:VALARM",
      "TRIGGER:-P1D",
      "DESCRIPTION:Pengingat: Besok adalah hari pernikahan Ridwan & Salma",
      "ACTION:DISPLAY",
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'The-Wedding-of-Ridwan-and-Salma.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    if (onToast) {
      onToast({
        title: "Kalender Diunduh",
        message: "File .ics berhasil diunduh. Buka file untuk menyimpannya ke Apple / Outlook Calendar dengan pengingat H-1."
      });
    }
  };

  return (
    <section id="hero" className="relative overflow-hidden">
      {/* 1. TAMPILAN KHUSUS MOBILE (HP) — 100% PERSIS SEPERTI GAMBAR TANGKAPAN LAYAR USER */}
      <div className="lg:hidden relative min-h-[92vh] flex flex-col justify-between p-5 text-white overflow-hidden bg-botanical-emerald">
        {/* Foto Pasangan Full-Bleed dengan efek Ken-Burns slow zoom */}
        <img
          src={couple.heroImage}
          alt="Ridwan & Salma"
          className="absolute inset-0 w-full h-full object-cover object-center scale-105 animate-kenburns opacity-65"
        />

        {/* Dark Emerald Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-botanical-emerald-dark via-botanical-emerald-dark/50 to-botanical-emerald-dark/75" />

        {/* Bingkai Ganda Berwarna Emas Mewah (Double Golden Border) */}
        <div className="absolute top-3 left-3 right-3 bottom-3 border border-botanical-gold/40 rounded-3xl pointer-events-none" />
        <div className="absolute top-5 left-5 right-5 bottom-5 border border-botanical-gold/20 rounded-2xl pointer-events-none" />

        {/* Baris Atas: Label Resmi + Tombol Admin */}
        <div className="relative z-10 flex items-center justify-between pt-4 px-2">
          <div className="flex items-center gap-1.5 text-botanical-gold-light">
            <Sparkles className="w-3.5 h-3.5 text-botanical-gold animate-pulse-subtle" />
            <span className="text-[10px] uppercase tracking-widest font-semibold">THE OFFICIAL WEDDING INVITATION</span>
          </div>

          {onOpenAdmin && (
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-botanical-emerald/80 border border-botanical-gold/50 text-botanical-gold-light text-[10px] font-semibold backdrop-blur-md shadow-md"
            >
              <ShieldCheck className="w-3 h-3 text-botanical-gold" />
              <span>Admin &amp; Resepsionis</span>
            </button>
          )}
        </div>

        {/* Konten Utama Hero: The Wedding of Ridwan & Salma */}
        <div className="relative z-10 my-auto py-5 text-center">
          <p className="font-script text-4xl text-botanical-gold-light mb-1">
            The Wedding of
          </p>

          <h1 className="font-serif text-4xl sm:text-5xl font-medium tracking-wide text-white mb-3">
            Ridwan &amp; Salma
          </h1>

          <div className="flex items-center justify-center gap-3 text-xs text-gray-200 mb-6 font-light flex-wrap">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-botanical-gold" />
              <span>{eventDateFormatted}</span>
            </div>
            <div className="h-3 w-[1px] bg-botanical-gold/40" />
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-botanical-gold" />
              <span>Grand Hyatt, Jakarta</span>
            </div>
          </div>

          {/* Kotak Hitung Mundur Dark Emerald Glass */}
          <div className="p-4 rounded-2xl glass-dark border border-botanical-gold/30 max-w-sm mx-auto shadow-2xl backdrop-blur-md">
            <p className="text-[10px] uppercase tracking-widest text-botanical-gold font-semibold mb-3 flex items-center justify-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>MENGHITUNG HARI BAHAGIA</span>
            </p>

            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-botanical-emerald/70 border border-botanical-gold/25">
                <span className="block text-2xl font-serif font-bold text-white">
                  {String(timeLeft.days).padStart(2, '0')}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-botanical-gold font-medium">Hari</span>
              </div>
              <div className="p-2.5 rounded-xl bg-botanical-emerald/70 border border-botanical-gold/25">
                <span className="block text-2xl font-serif font-bold text-white">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-botanical-gold font-medium">Jam</span>
              </div>
              <div className="p-2.5 rounded-xl bg-botanical-emerald/70 border border-botanical-gold/25">
                <span className="block text-2xl font-serif font-bold text-white">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-botanical-gold font-medium">Menit</span>
              </div>
              <div className="p-2.5 rounded-xl bg-botanical-emerald/70 border border-botanical-gold/25">
                <span className="block text-2xl font-serif font-bold text-white">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-botanical-gold font-medium">Detik</span>
              </div>
            </div>
          </div>

          {/* Tombol Simpan ke Kalender */}
          <div className="mt-4 flex items-center justify-center gap-2 max-w-sm mx-auto">
            <a
              href={getGoogleCalendarUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-botanical-gold text-botanical-emerald-dark text-xs font-bold shadow-md hover:bg-botanical-gold-light transition-all"
            >
              <Calendar className="w-3.5 h-3.5 text-botanical-emerald-dark" />
              <span>Google Calendar</span>
            </a>

            <button
              onClick={downloadIcsFile}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-botanical-emerald/80 border border-botanical-gold/50 text-botanical-gold-light text-xs font-semibold shadow-sm hover:bg-botanical-emerald transition-all"
            >
              <Download className="w-3.5 h-3.5 text-botanical-gold" />
              <span>Apple / iCal (.ics)</span>
            </button>
          </div>
        </div>

        {/* Baris Bawah: Status Musik & Hashtag */}
        <div className="relative z-10 flex items-center justify-between text-xs text-gray-300 pb-3 px-2">
          <div className="flex items-center gap-1.5 text-[10px] text-gray-300 truncate max-w-[210px]">
            <Volume2 className="w-3.5 h-3.5 text-botanical-gold shrink-0 animate-pulse" />
            <span className="truncate">Now Playing: {couple.songTitle}</span>
          </div>
          <span className="font-script text-base text-botanical-gold-light">{couple.hashtag}</span>
        </div>
      </div>

      {/* 2. TAMPILAN KHUSUS DESKTOP (LAPTOP) — Mengisi Sisi Kanan secara Elegan */}
      <div className="hidden lg:block p-8 xl:p-10 text-center bg-gradient-to-b from-botanical-champagne/40 to-botanical-bg border-b border-botanical-gold/20">
        <ScrollReveal animation="fade-up">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-botanical-champagne text-botanical-gold-dark text-[11px] font-semibold tracking-widest uppercase mb-3 border border-botanical-gold/30">
            <Sparkles className="w-3.5 h-3.5 text-botanical-gold" />
            The Wedding Celebration
          </span>
          <p className="font-script text-4xl text-botanical-gold-dark mb-1">
            Walimatul 'Ursy
          </p>
          <h2 className="font-serif text-3xl font-bold text-botanical-emerald mb-2">
            Ridwan &amp; Salma
          </h2>
          <p className="text-xs text-botanical-muted max-w-xs mx-auto leading-relaxed mb-6">
            Sabtu, 14 November 2026 • The Grand Heritage Ballroom, Grand Hyatt Jakarta
          </p>

          {/* Quick Calendar Buttons on Desktop */}
          <div className="flex items-center justify-center gap-3 max-w-xs mx-auto">
            <a
              href={getGoogleCalendarUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-botanical-emerald text-white text-xs font-medium shadow hover:bg-botanical-emerald-light transition-all"
            >
              <Calendar className="w-3.5 h-3.5 text-botanical-gold" />
              <span>Google Calendar</span>
            </a>
            <button
              onClick={downloadIcsFile}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-botanical-champagne hover:bg-botanical-gold/20 border border-botanical-gold/40 text-botanical-emerald text-xs font-medium shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5 text-botanical-gold-dark" />
              <span>Apple (.ics)</span>
            </button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
