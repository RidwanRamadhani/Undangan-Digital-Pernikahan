import React from 'react';
import { Heart, Sparkles, Compass, Milestone } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

export default function LoveStory({ story }) {
  const icons = [Compass, Heart, Sparkles, Milestone];

  return (
    <section id="cerita" className="py-12 px-6 md:px-10 bg-gradient-to-b from-transparent via-botanical-champagne/30 to-transparent">
      <ScrollReveal animation="fade-up" className="text-center mb-10">
        <span className="text-[11px] uppercase tracking-widest text-botanical-gold-dark font-semibold">
          Perjalanan Cinta
        </span>
        <h2 className="font-serif text-3xl md:text-4xl font-semibold text-botanical-obsidian mt-1 mb-2">
          Kisah Kami
        </h2>
        <p className="text-xs text-botanical-muted max-w-sm mx-auto leading-relaxed">
          Setiap babak perjalanan membawa kami semakin yakin bahwa cinta ini bertumbuh atas kehendak-Nya.
        </p>
      </ScrollReveal>

      <div className="max-w-xl mx-auto relative">
        {/* Continuous Golden Line in Background */}
        <div className="absolute top-4 bottom-4 left-6 md:left-1/2 -translate-x-1/2 w-[2px] bg-gradient-to-b from-botanical-gold via-botanical-gold-dark to-botanical-emerald opacity-60" />

        <div className="space-y-8 relative">
          {story.map((item, index) => {
            const Icon = icons[index % icons.length];
            const isEven = index % 2 === 0;

            return (
              <ScrollReveal
                key={index}
                animation={isEven ? "right" : "left"}
                delay={index * 120}
              >
                <div
                  className={`relative flex items-start gap-4 md:gap-0 ${
                    isEven ? 'md:flex-row-reverse' : 'md:flex-row'
                  }`}
                >
                  {/* Center Node Icon */}
                  <div className="absolute left-6 md:left-1/2 -translate-x-1/2 z-10 w-9 h-9 rounded-full bg-botanical-emerald border-2 border-botanical-gold flex items-center justify-center text-botanical-gold shadow-md">
                    <Icon className="w-4 h-4" />
                  </div>

                  {/* Content Card */}
                  <div className="ml-14 md:ml-0 md:w-1/2 md:px-6">
                    <div className="p-5 rounded-2xl glass-card border border-botanical-gold/25 shadow-md hover:shadow-lg transition-all hover:border-botanical-gold">
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-botanical-champagne border border-botanical-gold/30 text-botanical-emerald font-semibold text-[11px] mb-1.5">
                        {item.year}
                      </span>
                      <h3 className="font-serif text-lg font-bold text-botanical-emerald mb-1">
                        {item.title}
                      </h3>
                      <p className="text-xs text-botanical-muted leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
