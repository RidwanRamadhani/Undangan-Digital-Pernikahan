import React, { useState } from 'react';
import { Home, Users, Calendar, Heart, Camera, Send, Gift, MessageCircle, ShieldCheck } from 'lucide-react';

export default function BottomNav({ onOpenAdmin }) {
  const [activeSection, setActiveSection] = useState('hero');

  const navItems = [
    { id: 'hero', label: 'Beranda', icon: Home },
    { id: 'pengantin', label: 'Mempelai', icon: Users },
    { id: 'acara', label: 'Acara', icon: Calendar },
    { id: 'cerita', label: 'Kisah', icon: Heart },
    { id: 'galeri', label: 'Galeri', icon: Camera },
    { id: 'rsvp', label: 'RSVP', icon: Send },
    { id: 'kado', label: 'Kado', icon: Gift },
    { id: 'ucapan', label: 'Ucapan', icon: MessageCircle },
  ];

  const scrollTo = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 max-w-xl w-[94%] sm:w-auto">
      <div className="glass-panel px-3 py-2 rounded-full shadow-2xl flex items-center justify-between sm:gap-2 border border-botanical-gold/40">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className={`flex flex-col items-center justify-center p-1.5 sm:px-2.5 rounded-full transition-all ${
                isActive
                  ? 'text-botanical-gold-light bg-botanical-emerald scale-105 shadow-md'
                  : 'text-botanical-emerald hover:text-botanical-gold-dark'
              }`}
              title={item.label}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline text-[9px] font-semibold mt-0.5">
                {item.label}
              </span>
            </button>
          );
        })}

        {/* Divider */}
        <div className="h-5 w-[1px] bg-botanical-gold/40 mx-0.5" />

        {/* Dedicated Admin Button in Floating Nav */}
        <button
          onClick={onOpenAdmin}
          className="flex flex-col items-center justify-center p-1.5 sm:px-2 rounded-full text-botanical-gold bg-botanical-emerald/90 hover:bg-botanical-emerald transition-all shadow-sm border border-botanical-gold/40"
          title="Panel Admin & Resepsionis (Dilindungi PIN)"
        >
          <ShieldCheck className="w-4 h-4 text-botanical-gold" />
          <span className="hidden sm:inline text-[9px] font-bold text-botanical-gold mt-0.5">
            Admin
          </span>
        </button>
      </div>
    </div>
  );
}
