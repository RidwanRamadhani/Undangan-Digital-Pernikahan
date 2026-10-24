import React from 'react';
import { Heart, Sparkles } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

function InstagramIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  );
}

export default function CoupleProfile({ couple, verse }) {
  const { groom, bride } = couple;

  return (
    <section id="pengantin" className="py-12 px-6 md:px-10">
      {/* Quran Verse Box */}
      <ScrollReveal animation="scale" className="max-w-xl mx-auto mb-14 text-center">
        <div className="relative p-6 md:p-8 rounded-3xl glass-card border border-botanical-gold/30 shadow-md">
          {/* Decorative Corner Flairs */}
          <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-botanical-gold/50" />
          <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-botanical-gold/50" />
          <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-botanical-gold/50" />
          <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-botanical-gold/50" />

          <p className="font-serif text-xs uppercase tracking-widest text-botanical-gold-dark font-semibold mb-4">
            {verse.surah}
          </p>

          <p className="font-serif text-lg md:text-xl leading-relaxed text-botanical-emerald font-medium mb-4 dir-rtl" style={{ direction: 'rtl' }}>
            {verse.arabic}
          </p>

          <p className="text-xs text-botanical-muted italic leading-relaxed">
            "{verse.translation}"
          </p>
        </div>
      </ScrollReveal>

      {/* Section Header */}
      <ScrollReveal animation="fade-up" delay={100} className="text-center mb-10">
        <span className="text-[11px] uppercase tracking-widest text-botanical-gold-dark font-semibold">
          Pasangan Mempelai
        </span>
        <h2 className="font-serif text-3xl md:text-4xl font-semibold text-botanical-obsidian mt-1 mb-2">
          Maha Suci Allah
        </h2>
        <p className="text-xs text-botanical-muted max-w-sm mx-auto leading-relaxed">
          Yang telah menciptakan makhluk-Nya berpasang-pasangan. Dengan memohon ridho dan rahmat-Nya, kami mempertemukan dua hati:
        </p>
      </ScrollReveal>

      {/* Couple Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
        {/* Groom Card */}
        <ScrollReveal animation="left" delay={150}>
        <div className="flex flex-col items-center text-center p-6 rounded-3xl glass-card border border-botanical-gold/25 shadow-lg group hover:border-botanical-gold/60 transition-all">
          <div className="w-44 h-56 arch-frame p-2 bg-gradient-to-b from-botanical-gold/40 to-botanical-champagne shadow-md mb-5 group-hover:scale-102 transition-transform duration-500">
            <div className="w-full h-full arch-frame overflow-hidden bg-botanical-emerald">
              <img
                src={groom.photo}
                alt={groom.name}
                className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700"
                loading="lazy"
              />
            </div>
          </div>

          <h3 className="font-serif text-xl md:text-2xl font-bold text-botanical-emerald mb-1">
            {groom.name}
          </h3>

          <p className="text-xs text-botanical-gold-dark font-medium mb-2">
            — {groom.nickname} —
          </p>

          <p className="text-[11px] text-botanical-muted leading-relaxed mb-4">
            {groom.order} <br />
            <strong className="text-botanical-obsidian font-semibold">{groom.father}</strong> <br />
            &amp; <strong className="text-botanical-obsidian font-semibold">{groom.mother}</strong>
          </p>

          <a
            href={groom.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-botanical-champagne hover:bg-botanical-emerald hover:text-white text-botanical-emerald text-xs font-medium border border-botanical-gold/30 transition-all shadow-sm"
          >
            <InstagramIcon className="w-3.5 h-3.5 text-botanical-gold" />
            <span>@{groom.instagram}</span>
          </a>
        </div>
        </ScrollReveal>

        {/* Ampersand in mobile */}
        <div className="hidden md:flex absolute" />

        {/* Bride Card */}
        <ScrollReveal animation="right" delay={250}>
        <div className="flex flex-col items-center text-center p-6 rounded-3xl glass-card border border-botanical-gold/25 shadow-lg group hover:border-botanical-gold/60 transition-all">
          <div className="w-44 h-56 arch-frame p-2 bg-gradient-to-b from-botanical-gold/40 to-botanical-champagne shadow-md mb-5 group-hover:scale-102 transition-transform duration-500">
            <div className="w-full h-full arch-frame overflow-hidden bg-botanical-emerald">
              <img
                src={bride.photo}
                alt={bride.name}
                className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700"
                loading="lazy"
              />
            </div>
          </div>

          <h3 className="font-serif text-xl md:text-2xl font-bold text-botanical-emerald mb-1">
            {bride.name}
          </h3>

          <p className="text-xs text-botanical-gold-dark font-medium mb-2">
            — {bride.nickname} —
          </p>

          <p className="text-[11px] text-botanical-muted leading-relaxed mb-4">
            {bride.order} <br />
            <strong className="text-botanical-obsidian font-semibold">{bride.father}</strong> <br />
            &amp; <strong className="text-botanical-obsidian font-semibold">{bride.mother}</strong>
          </p>

          <a
            href={bride.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-botanical-champagne hover:bg-botanical-emerald hover:text-white text-botanical-emerald text-xs font-medium border border-botanical-gold/30 transition-all shadow-sm"
          >
            <InstagramIcon className="w-3.5 h-3.5 text-botanical-gold" />
            <span>@{bride.instagram}</span>
          </a>
        </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
