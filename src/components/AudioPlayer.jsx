import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Music2 } from 'lucide-react';

export default function AudioPlayer({ audioSrc, songTitle, isAudioPlaying, setIsAudioPlaying }) {
  const audioRef = useRef(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const wasPlayingBeforeHidden = useRef(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.loop = true;
    audio.volume = 0.7;

    // Page Visibility API
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (!audio.paused) {
          wasPlayingBeforeHidden.current = true;
          audio.pause();
          setIsAudioPlaying(false);
        } else {
          wasPlayingBeforeHidden.current = false;
        }
      } else {
        if (wasPlayingBeforeHidden.current) {
          audio.play().then(() => {
            setIsAudioPlaying(true);
          }).catch(err => console.log('Autoplay resumed failed', err));
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [setIsAudioPlaying]);

  // Synchronize playing state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isAudioPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.log('Audio playback prevented:', err);
          setIsAudioPlaying(false);
        });
      }
    } else {
      audio.pause();
    }
  }, [isAudioPlaying, setIsAudioPlaying, audioSrc]);

  const togglePlay = () => {
    setHasInteracted(true);
    setIsAudioPlaying(!isAudioPlaying);
  };

  return (
    <>
      <audio ref={audioRef} src={audioSrc} preload="auto" />

      {/* Floating Vinyl Player in bottom-left */}
      <div className="fixed bottom-6 left-6 z-40 group">
        <button
          onClick={togglePlay}
          aria-label={isAudioPlaying ? "Mute Background Music" : "Play Background Music"}
          className="relative flex items-center justify-center p-1 rounded-full transition-all duration-300 transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-botanical-gold shadow-2xl"
          title={isAudioPlaying ? `Sedang memutar: ${songTitle}` : "Putar Musik Latar"}
        >
          {/* Vinyl Record */}
          <div
            className={`w-12 h-12 md:w-14 md:h-14 rounded-full vinyl-disc border-2 border-botanical-gold/60 flex items-center justify-center shadow-lg transition-transform ${
              isAudioPlaying ? 'animate-spin-slow' : ''
            }`}
          >
            {/* Center vinyl label */}
            <div className="w-5 h-5 rounded-full bg-botanical-gold/90 flex items-center justify-center border border-white/50">
              <div className="w-1.5 h-1.5 rounded-full bg-botanical-emerald" />
            </div>
          </div>

          {/* Floating Speaker icon badge */}
          <div className="absolute -bottom-1 -right-1 bg-botanical-emerald text-botanical-gold p-1.5 rounded-full shadow-md border border-botanical-gold/40">
            {isAudioPlaying ? (
              <Volume2 className="w-3.5 h-3.5 animate-pulse" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-gray-400" />
            )}
          </div>
        </button>

        {/* Hover Song Title Tooltip */}
        <div className="hidden md:flex absolute left-16 bottom-2 items-center gap-2 bg-botanical-emerald/90 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap shadow-xl border border-botanical-gold/30">
          <Music2 className="w-3.5 h-3.5 text-botanical-gold" />
          <span>{songTitle}</span>
        </div>
      </div>
    </>
  );
}
