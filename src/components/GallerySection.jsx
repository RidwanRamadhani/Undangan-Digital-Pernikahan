import React, { useState } from 'react';
import { Camera, ChevronLeft, ChevronRight, Play, Sparkles, X, ZoomIn } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

export default function GallerySection({ gallery, preweddingVideo, onVideoPlayStateChange }) {
  const [activePhotoIndex, setActivePhotoIndex] = useState(null);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);

  const openLightbox = (index) => {
    setActivePhotoIndex(index);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setActivePhotoIndex(null);
    document.body.style.overflow = 'auto';
  };

  const nextPhoto = (e) => {
    e.stopPropagation();
    setActivePhotoIndex((prev) => (prev + 1) % gallery.length);
  };

  const prevPhoto = (e) => {
    e.stopPropagation();
    setActivePhotoIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
  };

  const handleVideoStart = () => {
    setIsPlayingVideo(true);
    if (onVideoPlayStateChange) {
      onVideoPlayStateChange(true); // trigger audio ducking
    }
  };

  return (
    <section id="galeri" className="py-12 px-6 md:px-10">
      <ScrollReveal animation="fade-up" className="text-center mb-10">
        <span className="text-[11px] uppercase tracking-widest text-botanical-gold-dark font-semibold">
          Momen Bahagia
        </span>
        <h2 className="font-serif text-3xl md:text-4xl font-semibold text-botanical-obsidian mt-1 mb-2">
          Galeri Foto &amp; Sinema
        </h2>
        <p className="text-xs text-botanical-muted max-w-sm mx-auto leading-relaxed">
          Setiap potret mengabadikan sejuta kenangan indah yang kami ukir bersama sebelum melangkah ke pelaminan.
        </p>
      </ScrollReveal>

      {/* Bento Grid Layout */}
      <div className="max-w-2xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-10">
        {gallery.map((photo, index) => {
          const isSpanRow = index === 0 || index === 3;
          return (
            <ScrollReveal
              key={photo.id}
              animation="scale"
              delay={index * 100}
              className={isSpanRow ? 'row-span-2' : ''}
            >
              <div
                onClick={() => openLightbox(index)}
                className={`group relative overflow-hidden rounded-2xl cursor-pointer shadow-md bg-botanical-emerald w-full h-full ${
                  isSpanRow ? 'aspect-[3/4]' : 'aspect-square'
                }`}
              >
                <img
                  src={photo.src}
                  alt={photo.title}
                  loading="lazy"
                  className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
                />
                
                {/* Hover Dark Glass Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-botanical-emerald-dark/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                  <span className="text-[10px] text-botanical-gold font-medium uppercase tracking-wider">
                    {photo.category}
                  </span>
                  <p className="text-xs font-semibold text-white truncate">
                    {photo.title}
                  </p>
                  <div className="absolute top-3 right-3 p-1.5 rounded-full bg-black/40 text-white backdrop-blur-sm">
                    <ZoomIn className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </ScrollReveal>
          );
        })}
      </div>

      {/* Pre-wedding Video Player Box */}
      <ScrollReveal animation="fade-up" delay={200} className="max-w-2xl mx-auto p-6 rounded-3xl glass-card border border-botanical-gold/30 shadow-xl mb-10 text-center">
        <span className="text-[11px] uppercase tracking-widest text-botanical-gold-dark font-semibold">
          Kisah Visual
        </span>
        <h3 className="font-serif text-2xl font-bold text-botanical-emerald mt-1 mb-2">
          {preweddingVideo.title}
        </h3>
        <p className="text-xs text-botanical-muted mb-5 leading-relaxed max-w-md mx-auto">
          {preweddingVideo.desc}
        </p>

        {/* Video Container */}
        <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl bg-botanical-emerald border border-botanical-gold/20">
          {!isPlayingVideo ? (
            <div className="relative w-full h-full group cursor-pointer" onClick={handleVideoStart}>
              <img
                src="/images/hero_desktop.jpg"
                alt="Video Thumbnail"
                className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-botanical-gold text-botanical-emerald flex items-center justify-center shadow-2xl transform group-hover:scale-110 active:scale-95 transition-all">
                  <Play className="w-7 h-7 fill-botanical-emerald ml-1" />
                </div>
              </div>
              <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-white text-[11px] font-medium flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-botanical-gold" />
                <span>Putar Sinema (Musik otomatis dipause)</span>
              </div>
            </div>
          ) : (
            <iframe
              src={`${preweddingVideo.embedUrl}&autoplay=1`}
              title="Prewedding Teaser Video"
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>

        {/* Instagram AR Wedding Filter Button */}
        <div className="mt-6 pt-5 border-t border-botanical-gold/20 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-left text-xs">
            <p className="font-semibold text-botanical-obsidian">Instagram Story Wedding Filter</p>
            <p className="text-[11px] text-botanical-muted">Bagikan momen foto Anda dengan bingkai spesial kami di IG Story</p>
          </div>
          <a
            href={preweddingVideo.filterInstagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white text-xs font-semibold shadow-md hover:scale-105 transition-all whitespace-nowrap"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Coba Filter Instagram</span>
          </a>
        </div>
      </ScrollReveal>

      {/* Lightbox Modal */}
      {activePhotoIndex !== null && (
        <div
          onClick={closeLightbox}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation Prev */}
          <button
            onClick={prevPhoto}
            className="absolute left-4 p-3 rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors z-10"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Photo Content */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-3xl max-h-[85vh] flex flex-col items-center"
          >
            <img
              src={gallery[activePhotoIndex].src}
              alt={gallery[activePhotoIndex].title}
              className="max-h-[75vh] w-auto max-w-full rounded-2xl shadow-2xl object-contain"
            />
            <div className="mt-4 text-center text-white">
              <span className="text-xs uppercase tracking-widest text-botanical-gold font-medium">
                {gallery[activePhotoIndex].category}
              </span>
              <p className="font-serif text-lg font-semibold mt-0.5">
                {gallery[activePhotoIndex].title}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {activePhotoIndex + 1} / {gallery.length}
              </p>
            </div>
          </div>

          {/* Navigation Next */}
          <button
            onClick={nextPhoto}
            className="absolute right-4 p-3 rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors z-10"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}
    </section>
  );
}
