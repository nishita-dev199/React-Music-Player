import React, { useRef, useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";

/* ── SVG Icons ── */
const PlayIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className="ml-0.5">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

const PauseIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="4" width="4" height="16" rx="1.5" />
    <rect x="14" y="4" width="4" height="16" rx="1.5" />
  </svg>
);

const HeartIcon = ({ filled, size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={filled ? "#e8412b" : "none"}
    stroke={filled ? "#e8412b" : "currentColor"}
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="transition-transform active:scale-125"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const ChevronLeft = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRight = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const VinylDiscIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
  </svg>
);

/**
 * Curved3DCarousel
 *
 * Implements a 3D curved perspective horizontal scrollable carousel (matching Image 1 / Oli Studio style).
 * Cards follow an inward concave cylinder curve:
 * - Center card: scale(1.06), rotateY(0deg), translateZ(0px), full opacity and vibrant border.
 * - Left cards: angled inward (rotateY positive), scaled down, translated back in Z.
 * - Right cards: angled inward (rotateY negative), scaled down, translated back in Z.
 * Supports smooth horizontal scroll, drag/swipe, arrow buttons, and direct card click to center.
 */
export default function Curved3DCarousel({
  songs = [],
  currentSong,
  isPlaying,
  onPlay,
  onFavorite,
}) {
  const containerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(2);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  // Dynamic 3D transform update for each card based on distance from center
  const updateTransforms = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const centerX = containerRect.left + containerRect.width / 2;
    const cards = container.querySelectorAll(".curved-3d-card");

    let closestIdx = 0;
    let minDistance = Infinity;

    cards.forEach((card, idx) => {
      const cardRect = card.getBoundingClientRect();
      const cardCenterX = cardRect.left + cardRect.width / 2;
      const cardWidth = cardRect.width || 220;
      const dist = (cardCenterX - centerX) / cardWidth;

      const absDist = Math.abs(cardCenterX - centerX);
      if (absDist < minDistance) {
        minDistance = absDist;
        closestIdx = idx;
      }

      // Curved 3D perspective calculation
      const clampedDist = Math.max(-3.5, Math.min(3.5, dist));
      // Left cards have positive rotateY, right cards have negative rotateY (inward curve)
      const rotateY = -clampedDist * 18;
      const scale = Math.max(0.76, 1.06 - Math.abs(clampedDist) * 0.08);
      const translateZ = -Math.abs(clampedDist) * 45;
      const translateY = Math.pow(Math.abs(clampedDist), 1.4) * 8;
      const opacity = Math.max(0.45, 1 - Math.abs(clampedDist) * 0.15);
      const zIndex = Math.round(50 - Math.abs(clampedDist) * 10);

      card.style.transform = `perspective(1100px) rotateY(${rotateY}deg) scale(${scale}) translateZ(${translateZ}px) translateY(${translateY}px)`;
      card.style.opacity = opacity;
      card.style.zIndex = zIndex;
    });

    setActiveIndex(closestIdx);
  }, []);

  // Set up listeners for scroll and window resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let rafId;
    const handleScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateTransforms);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    // Initial calculation immediately and after layout settles
    updateTransforms();
    const timer = setTimeout(() => {
      updateTransforms();
      // Scroll initial center item into middle
      if (songs.length > 2) {
        const cards = container.querySelectorAll(".curved-3d-card");
        if (cards[2]) {
          const cardRect = cards[2].getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();
          const offset =
            cardRect.left - containerRect.left - (containerRect.width / 2 - cardRect.width / 2);
          container.scrollLeft += offset;
          updateTransforms();
        }
      }
    }, 60);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(rafId);
      container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [updateTransforms, songs]);

  // Center a specific card
  const scrollToCard = (index) => {
    const container = containerRef.current;
    if (!container) return;
    const cards = container.querySelectorAll(".curved-3d-card");
    if (!cards[index]) return;

    const card = cards[index];
    const containerRect = container.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const offset =
      cardRect.left - containerRect.left - (containerRect.width / 2 - cardRect.width / 2);

    container.scrollBy({ left: offset, behavior: "smooth" });
  };

  const handlePrev = () => {
    const target = Math.max(0, activeIndex - 1);
    scrollToCard(target);
  };

  const handleNext = () => {
    const target = Math.min(songs.length - 1, activeIndex + 1);
    scrollToCard(target);
  };

  /* ── Drag to scroll (mouse) ── */
  const handleMouseDown = (e) => {
    if (e.target.closest("button") || e.target.closest("a")) return;
    isDraggingRef.current = true;
    startXRef.current = e.pageX - containerRef.current.offsetLeft;
    scrollLeftRef.current = containerRef.current.scrollLeft;
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    containerRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Helper to compute pre-render transform on first paint
  const getPreRenderTransform = (index) => {
    const dist = index - 2;
    const clampedDist = Math.max(-3.5, Math.min(3.5, dist));
    const rotateY = -clampedDist * 18;
    const scale = Math.max(0.78, 1.06 - Math.abs(clampedDist) * 0.08);
    const translateZ = -Math.abs(clampedDist) * 45;
    const translateY = Math.pow(Math.abs(clampedDist), 1.4) * 8;
    return `perspective(1100px) rotateY(${rotateY}deg) scale(${scale}) translateZ(${translateZ}px) translateY(${translateY}px)`;
  };

  return (
    <div className="relative w-full overflow-hidden select-none py-2 sm:py-4">
      {/* ── Section Header with navigation arrows ── */}
      <div className="flex items-center justify-between mb-2 sm:mb-4 px-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <span>Trending Spotlight</span>
              <span className="text-xs font-black bg-gradient-to-r from-[#cf3420] to-[#e8412b] text-white px-2.5 py-0.5 rounded-full shadow-[0_0_12px_rgba(232,65,43,0.6)] border border-white/20">
                🔥 3D COVERFLOW
              </span>
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-white/70 mt-0.5">
            Swipe or scroll horizontally through trending vinyls & chartbusters
          </p>
        </div>

        {/* Carousel Prev/Next Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 border border-white/15 flex items-center justify-center text-white transition-all shadow-md backdrop-blur-md"
            aria-label="Previous Slide"
          >
            <ChevronLeft />
          </button>
          <button
            onClick={handleNext}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 border border-white/15 flex items-center justify-center text-white transition-all shadow-md backdrop-blur-md"
            aria-label="Next Slide"
          >
            <ChevronRight />
          </button>
        </div>
      </div>

      {/* ── 3D Horizontal Scroll Ribbon Container ── */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="w-full min-h-[380px] sm:min-h-[440px] overflow-x-auto flex items-center gap-4 sm:gap-6 py-6 sm:py-10 px-[calc(50%-110px)] sm:px-[calc(50%-130px)] md:px-[calc(50%-145px)] scrollbar-none cursor-grab active:cursor-grabbing"
        style={{
          perspective: "1200px",
          transformStyle: "preserve-3d",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {songs.map((song, index) => {
          const isCurrent = currentSong?.id === song.id;
          const isCurrentPlaying = isCurrent && isPlaying;
          const isCenter = activeIndex === index;

          return (
            <div
              key={song.id}
              onClick={() => {
                if (!isCenter) {
                  scrollToCard(index);
                }
              }}
              className={`curved-3d-card shrink-0 relative w-[220px] sm:w-[250px] md:w-[270px] h-[340px] sm:h-[380px] md:h-[400px] rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 transform-gpu cursor-pointer group border-2 ${
                isCenter
                  ? "border-[#e8412b] ring-2 ring-[#e8412b]/60 shadow-[0_15px_40px_rgba(0,0,0,0.8),0_0_30px_rgba(232,65,43,0.5)]"
                  : "border-white/15 hover:border-white/40 shadow-xl"
              }`}
              style={{
                willChange: "transform, opacity",
                transformOrigin: "center center",
                minWidth: "220px",
                minHeight: "340px",
                transform: getPreRenderTransform(index),
                zIndex: Math.round(50 - Math.abs(index - 2) * 10),
                opacity: Math.max(0.5, 1 - Math.abs(index - 2) * 0.15),
              }}
            >
              {/* Fallback dark teal background */}
              <div className="absolute inset-0 bg-[#0e272c]" />

              {/* Background Cover Artwork */}
              <img
                src={song.imageUrl}
                alt={song.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="eager"
              />

              {/* Gradient Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-black/20" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent" />

              {/* Top Bar: Rank badge & Audio spec */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                <span className="text-[11px] font-black uppercase tracking-wider bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 text-white flex items-center gap-1.5 shadow-md">
                  <span className="text-[#e8412b]">#{index + 1}</span>
                  <span className="text-white/70">HOT</span>
                </span>

                <span className="text-[10px] font-bold uppercase tracking-widest text-white/80 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/15 flex items-center gap-1">
                  <VinylDiscIcon />
                  <span>33 RPM</span>
                </span>
              </div>

              {/* Center Play Button (Large glowing circle) */}
              <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onPlay) onPlay(song);
                  }}
                  className={`pointer-events-auto w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-white transition-all duration-300 shadow-2xl ${
                    isCurrentPlaying
                      ? "bg-[#e8412b] shadow-[0_0_25px_rgba(232,65,43,0.8)] scale-105"
                      : "bg-black/55 backdrop-blur-md border-2 border-white/40 hover:bg-[#e8412b] hover:border-[#e8412b] hover:scale-110 shadow-[0_8px_25px_rgba(0,0,0,0.6)]"
                  }`}
                  aria-label={isCurrentPlaying ? "Pause Track" : "Play Track"}
                >
                  {isCurrentPlaying ? <PauseIcon size={24} /> : <PlayIcon size={24} />}
                </button>
              </div>

              {/* Animated Equalizer Wave when playing */}
              {isCurrentPlaying && (
                <div className="absolute top-1/2 -translate-y-1/2 left-4 right-4 flex items-center justify-between pointer-events-none opacity-40 px-3 z-0">
                  <span className="w-1 h-6 bg-[#e8412b] rounded-full animate-bounce" />
                  <span className="w-1 h-10 bg-[#e8412b] rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1 h-8 bg-[#e8412b] rounded-full animate-bounce [animation-delay:0.4s]" />
                  <span className="w-1 h-10 bg-[#e8412b] rounded-full animate-bounce [animation-delay:0.1s]" />
                  <span className="w-1 h-6 bg-[#e8412b] rounded-full animate-bounce [animation-delay:0.3s]" />
                </div>
              )}

              {/* Bottom Song Info & Actions */}
              <div className="absolute bottom-0 left-0 right-0 p-4 z-10 flex flex-col justify-end">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base sm:text-lg font-black text-white truncate drop-shadow">
                      {song.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-white/80 font-bold truncate mt-0.5">
                      {song.artist}
                    </p>
                  </div>

                  {/* Favorite Toggle Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onFavorite) onFavorite(song.id);
                    }}
                    className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white transition-all border border-white/10 shrink-0"
                    aria-label="Toggle Favorite"
                  >
                    <HeartIcon filled={song.isFavorite} size={18} />
                  </button>
                </div>

                {/* Sub info bar: year, duration, streams */}
                <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-white/15 text-[11px] font-bold text-white/70">
                  <span className="bg-white/10 px-2 py-0.5 rounded-md text-white/90">
                    {song.year || "2020"}
                  </span>
                  <span>{song.duration}</span>
                  <Link
                    to="/player"
                    onClick={(e) => e.stopPropagation()}
                    className="text-orange-300 hover:text-white transition-colors"
                    title="Open Now Playing"
                  >
                    Vinyl ↗
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

