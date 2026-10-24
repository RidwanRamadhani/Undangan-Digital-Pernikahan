import React, { useState, useEffect } from 'react';
import { weddingData } from './data/weddingData';
import AmbientParticles from './components/AmbientParticles';
import SplashCover from './components/SplashCover';
import AudioPlayer from './components/AudioPlayer';
import DesktopLeftPanel from './components/DesktopLeftPanel';
import HeroSection from './components/HeroSection';
import CoupleProfile from './components/CoupleProfile';
import LoveStory from './components/LoveStory';
import EventDetails from './components/EventDetails';
import GallerySection from './components/GallerySection';
import RsvpSection from './components/RsvpSection';
import GiftRegistry from './components/GiftRegistry';
import WishesWall from './components/WishesWall';
import BottomNav from './components/BottomNav';
import AdminDashboard from './components/AdminDashboard';
import Toast from './components/Toast';
import { Heart, Sparkles, ShieldCheck } from 'lucide-react';

export default function App() {
  const [isInvitationOpen, setIsInvitationOpen] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [guestName, setGuestName] = useState('');
  const [isVip, setIsVip] = useState(false);
  const [maxPax, setMaxPax] = useState(2);

  // Read URL query parameters on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const toParam = params.get('to');
    const vipParam = params.get('vip');
    const catParam = params.get('cat');
    const paxParam = params.get('pax');
    const adminParam = params.get('admin');

    if (toParam) {
      setGuestName(toParam);
      // Update page title dynamically
      document.title = `The Wedding of Ridwan & Salma - Khusus untuk ${toParam}`;
      const metaTitle = document.getElementById('meta-og-title');
      if (metaTitle) {
        metaTitle.setAttribute('content', `The Wedding of Ridwan & Salma - Khusus untuk ${toParam}`);
      }
    }

    if (vipParam === 'true' || (catParam && catParam.toUpperCase() === 'VIP')) {
      setIsVip(true);
    }

    if (paxParam && !isNaN(Number(paxParam))) {
      setMaxPax(Number(paxParam));
    }

    // Clean up any lingering admin param from URL so it never auto-opens on refresh/load
    if (adminParam) {
      params.delete('admin');
      const newQuery = params.toString() ? `?${params.toString()}` : window.location.pathname;
      window.history.replaceState({}, '', newQuery);
    }

    // Lock scroll initially until invitation is opened
    if (!isInvitationOpen) {
      document.body.style.overflow = 'hidden';
    }
  }, [isInvitationOpen]);

  // Handle opening the invitation
  const handleOpenInvitation = () => {
    setIsInvitationOpen(true);
    document.body.style.overflow = 'auto';
    setIsAudioPlaying(true); // play background music with user gesture
  };

  // Toast notification dispatcher
  const addToast = (toast) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Duck audio when pre-wedding video starts playing
  const handleVideoPlayStateChange = (isVideoPlaying) => {
    if (isVideoPlaying && isAudioPlaying) {
      setIsAudioPlaying(false);
      addToast({
        title: 'Audio Latar Dijeda',
        message: 'Musik latar otomatis dijeda saat Anda memutar video sinema pre-wedding.'
      });
    }
  };

  return (
    <div className="min-h-screen bg-botanical-bg text-botanical-obsidian relative selection:bg-botanical-gold selection:text-white">
      {/* Golden Shimmer Ambient Particles */}
      <AmbientParticles />

      {/* Global Toast System */}
      <Toast toasts={toasts} onDismiss={removeToast} />

      {/* Splash Cover Overlay (Slide-Up on Click) */}
      <SplashCover
        guestName={guestName}
        isVip={isVip}
        onOpenInvitation={handleOpenInvitation}
        isOpen={isInvitationOpen}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Smart Background Audio Player (Vinyl floating disc) */}
      <AudioPlayer
        audioSrc={weddingData.couple.audioSrc}
        songTitle={weddingData.couple.songTitle}
        isAudioPlaying={isAudioPlaying}
        setIsAudioPlaying={setIsAudioPlaying}
      />

      {/* Desktop Split-Screen Layout (≥ 1024px) */}
      <div className="flex flex-col lg:flex-row min-h-screen w-full">
        {/* Left 60% Sticky Column for Desktop */}
        <DesktopLeftPanel
          couple={weddingData.couple}
          eventDate={weddingData.eventDate}
          isAudioPlaying={isAudioPlaying}
          setIsAudioPlaying={setIsAudioPlaying}
          onOpenAdmin={() => setIsAdminOpen(true)}
        />

        {/* Right 40% Scrollable Column for Invitation Content */}
        <main className="w-full lg:w-[42%] xl:w-[40%] min-h-screen bg-botanical-bg flex flex-col relative z-20 shadow-2xl pb-28">
          {/* Hero Section with Live Countdown & Add to Calendar */}
          <HeroSection
            couple={weddingData.couple}
            eventDate={weddingData.eventDate}
            eventDateFormatted={weddingData.eventDateFormatted}
            onToast={addToast}
            onOpenAdmin={() => setIsAdminOpen(true)}
          />

          {/* Bride & Groom Profile with Quran Verse */}
          <CoupleProfile
            couple={weddingData.couple}
            verse={weddingData.verse}
          />

          {/* Interactive Love Story Timeline */}
          <LoveStory story={weddingData.story} />

          {/* Event Details, Dresscode & Maps */}
          <EventDetails
            events={weddingData.events}
            map={weddingData.map}
            dresscode={weddingData.dresscode}
            liveStream={weddingData.liveStream}
            onToast={addToast}
          />

          {/* Bento Gallery & Pre-wedding Video with Ducking */}
          <GallerySection
            gallery={weddingData.gallery}
            preweddingVideo={weddingData.preweddingVideo}
            onVideoPlayStateChange={handleVideoPlayStateChange}
          />

          {/* RSVP Form with Unique QR Code Ticket */}
          <RsvpSection
            guestName={guestName}
            isVip={isVip}
            maxPax={maxPax}
            onToast={addToast}
          />

          {/* Cashless Digital Envelope & Wishlist Registry */}
          <GiftRegistry
            bankAccounts={weddingData.bankAccounts}
            giftAddress={weddingData.giftAddress}
            initialWishlist={weddingData.initialWishlist}
            onToast={addToast}
          />

          {/* Live Wishes & Prayers Wall */}
          <WishesWall
            initialWishes={weddingData.initialWishes}
            guestName={guestName}
            onToast={addToast}
          />

          {/* Footer Section */}
          <footer className="py-12 px-6 text-center border-t border-botanical-gold/20 bg-botanical-champagne/40">
            <p className="font-script text-3xl text-botanical-gold-dark mb-1">
              Terima Kasih
            </p>
            <h4 className="font-serif text-2xl font-bold text-botanical-emerald mb-3">
              Ridwan &amp; Salma
            </h4>
            <p className="text-xs text-botanical-muted max-w-xs mx-auto leading-relaxed mb-6">
              Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Anda berkenan hadir dan memberikan doa restu.
            </p>

            <div className="flex items-center justify-center gap-2 text-xs text-botanical-gold-dark font-medium mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{weddingData.couple.hashtag}</span>
              <Sparkles className="w-3.5 h-3.5" />
            </div>

            <div className="pt-6 border-t border-botanical-gold/15 flex flex-col items-center gap-2">
              <button
                onClick={() => setIsAdminOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-botanical-emerald/10 hover:bg-botanical-emerald hover:text-white text-botanical-emerald text-[11px] font-semibold transition-all"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Panel WO &amp; Resepsionis</span>
              </button>
              <p className="text-[10px] text-gray-400">
                Crafted with Luxury &amp; Editorial Precision for Ridwan &amp; Salma Wedding
              </p>
            </div>
          </footer>
        </main>
      </div>

      {/* Floating Bottom Navigation Bar */}
      {isInvitationOpen && <BottomNav onOpenAdmin={() => setIsAdminOpen(true)} />}

      {/* Admin & Receptionist Dashboard Modal */}
      <AdminDashboard
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onToast={addToast}
      />
    </div>
  );
}
