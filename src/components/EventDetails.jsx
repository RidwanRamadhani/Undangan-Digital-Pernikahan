import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Navigation, Video, Sparkles, Check, Copy } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

export default function EventDetails({ events, map, dresscode, liveStream, onToast }) {
  const [copiedAddress, setCopiedAddress] = useState(false);

  const handleCopyAddress = (address) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2500);
    if (onToast) {
      onToast({
        title: "Alamat Disalin",
        message: "Alamat lokasi berhasil disalin ke clipboard."
      });
    }
  };

  return (
    <section id="acara" className="py-12 px-6 md:px-10">
      <ScrollReveal animation="fade-up" className="text-center mb-10">
        <span className="text-[11px] uppercase tracking-widest text-botanical-gold-dark font-semibold">
          Waktu &amp; Lokasi Acara
        </span>
        <h2 className="font-serif text-3xl md:text-4xl font-semibold text-botanical-obsidian mt-1 mb-2">
          Rangkaian Acara
        </h2>
        <p className="text-xs text-botanical-muted max-w-sm mx-auto leading-relaxed">
          Dengan memohon rahmat dan berkah Allah SWT, kami bermaksud menyelenggarakan acara pernikahan kami pada:
        </p>
      </ScrollReveal>

      {/* Event Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-10">
        {events.map((evt, idx) => (
          <ScrollReveal
            key={evt.id}
            animation="fade-up"
            delay={idx * 150}
            className={evt.id === 'resepsi-2' ? 'md:col-span-2 md:max-w-md md:mx-auto w-full' : ''}
          >
            <div className="p-6 rounded-3xl glass-card border border-botanical-gold/30 shadow-lg relative overflow-hidden flex flex-col justify-between h-full">
              {/* Top Tag */}
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full bg-botanical-champagne border border-botanical-gold/40 text-botanical-emerald text-[11px] font-semibold tracking-wide">
                  {evt.tag}
                </span>
                <Sparkles className="w-4 h-4 text-botanical-gold" />
              </div>

              <div>
                <h3 className="font-serif text-2xl font-bold text-botanical-emerald mb-2">
                  {evt.title}
                </h3>

                <div className="space-y-2.5 text-xs text-botanical-muted mb-6">
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-botanical-gold shrink-0" />
                    <span className="font-semibold text-botanical-obsidian">{evt.date}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-botanical-gold shrink-0" />
                    <span>{evt.time}</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-botanical-gold shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-botanical-obsidian font-semibold">{evt.venue}</strong>
                      <span className="text-[11px] leading-relaxed block mt-0.5">{evt.address}</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleCopyAddress(`${evt.venue}, ${evt.address}`)}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-botanical-champagne hover:bg-botanical-gold/20 text-botanical-emerald text-xs font-semibold border border-botanical-gold/30 transition-all active:scale-98"
              >
                {copiedAddress ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-botanical-gold-dark" />}
                <span>{copiedAddress ? 'Alamat Tersalin' : 'Salin Alamat Lengkap'}</span>
              </button>
            </div>
          </ScrollReveal>
        ))}
      </div>

      {/* Dresscode Guide */}
      <ScrollReveal animation="scale" delay={150} className="max-w-xl mx-auto mb-10 p-6 rounded-3xl glass-card border border-botanical-gold/30 shadow-md text-center">
        <h4 className="font-serif text-lg font-bold text-botanical-emerald mb-1">
          Panduan Busana (Dresscode)
        </h4>
        <p className="text-xs text-botanical-muted mb-4 leading-relaxed">
          {dresscode.note}
        </p>

        {/* Color Swatches */}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          {dresscode.palette.map((color, idx) => (
            <div key={idx} className="flex flex-col items-center gap-1.5">
              <div
                className="w-9 h-9 rounded-full shadow-md border-2 border-white ring-1 ring-botanical-gold/30 transform hover:scale-110 transition-transform"
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
              <span className="text-[10px] text-botanical-muted font-medium">{color.name}</span>
            </div>
          ))}
        </div>
      </ScrollReveal>

      {/* Google Maps & Navigation Card */}
      <ScrollReveal animation="fade-up" delay={200} className="max-w-xl mx-auto p-5 rounded-3xl glass-card border border-botanical-gold/30 shadow-xl overflow-hidden mb-8">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-botanical-gold" />
            <h4 className="font-serif text-base font-bold text-botanical-emerald">
              Peta Lokasi Gedung
            </h4>
          </div>
          <span className="text-[11px] text-botanical-gold-dark font-medium">Grand Hyatt Jakarta</span>
        </div>

        {/* Embedded Map */}
        <div className="w-full h-56 rounded-2xl overflow-hidden border border-botanical-gold/30 shadow-inner mb-4">
          <iframe
            src={map.embedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Lokasi Pernikahan Ridwan & Salma"
          />
        </div>

        {/* Action Navigation Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <a
            href={map.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-botanical-emerald text-white text-xs font-semibold shadow hover:bg-botanical-emerald-light transition-all"
          >
            <MapPin className="w-4 h-4 text-botanical-gold" />
            <span>Google Maps</span>
          </a>

          <a
            href={map.wazeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-botanical-champagne hover:bg-botanical-gold/20 text-botanical-emerald text-xs font-semibold border border-botanical-gold/40 shadow-sm transition-all"
          >
            <Navigation className="w-4 h-4 text-botanical-gold-dark" />
            <span>Arahkan di Waze</span>
          </a>
        </div>
      </ScrollReveal>

      {/* Live Streaming Access */}
      <ScrollReveal animation="scale" delay={250} className="max-w-xl mx-auto p-5 rounded-3xl glass-card border border-botanical-gold/30 shadow-md flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-serif text-sm font-bold text-botanical-emerald">
              Siaran Langsung (Virtual Live)
            </h4>
            <p className="text-[11px] text-botanical-muted">
              Bagi tamu yang berhalangan hadir secara fisik di gedung
            </p>
          </div>
        </div>

        <a
          href={liveStream.youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium shadow transition-all hover:scale-102"
        >
          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          <span>Tonton Live Stream</span>
        </a>
      </ScrollReveal>
    </section>
  );
}
