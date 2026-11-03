import React, { useRef, useState, useEffect } from "react";
import RecordPlayerSong from "./RecordPlayerSong";

/* ── SVG Icons ── */
const ChevronLeftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export default function InfiniteRecordRow({
  category,
  playingSongId,
  isPlaying,
  onPlaySong,
  onToggleFavorite,
  onAddToPlaylist,
}) {
  const containerRef = useRef(null);
  const itemRefs = useRef([]);
  const [centerItemIndex, setCenterItemIndex] = useState(category.songs.length);

  // Tripled list for seamless infinite horizontal scrolling illusion
  const repeatedSongs = [...category.songs, ...category.songs, ...category.songs];
  const itemWidthWithGap = 254; // 230px card + 24px gap

  const handleScroll = () => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const containerCenterX = containerRect.left + containerRect.width / 2;

    const singleSetWidth = category.songs.length * itemWidthWithGap;

    // Infinite seamless horizontal wrap
    if (container.scrollLeft < singleSetWidth * 0.25) {
      container.scrollLeft += singleSetWidth;
    } else if (container.scrollLeft > singleSetWidth * 1.85) {
      container.scrollLeft -= singleSetWidth;
    }

    // Find the item closest to horizontal center
    let closestIdx = 0;
    let minDistance = Infinity;

    itemRefs.current.forEach((el, idx) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const itemCenterX = rect.left + rect.width / 2;
      const dist = Math.abs(containerCenterX - itemCenterX);
      if (dist < minDistance) {
        minDistance = dist;
        closestIdx = idx;
      }
    });

    setCenterItemIndex(closestIdx);
  };

  // Mount: scroll to middle set so user can scroll indefinitely left or right
  useEffect(() => {
    if (containerRef.current) {
      const singleSetWidth = category.songs.length * itemWidthWithGap;
      containerRef.current.scrollLeft = singleSetWidth;
      setTimeout(handleScroll, 120);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category.songs.length]);

  const scrollLeft = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: -itemWidthWithGap * 1.6, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: itemWidthWithGap * 1.6, behavior: "smooth" });
    }
  };

  const handleItemSelect = (song, idx) => {
    if (itemRefs.current[idx]) {
      itemRefs.current[idx].scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
    onPlaySong(song, category.songs);
  };

  return (
    <div className="relative w-full bg-gradient-to-r from-black/50 via-[#0e353c]/60 to-black/50 backdrop-blur-xl border-t-2 border-b-2 border-[#258591] shadow-[0_15px_40px_rgba(0,0,0,0.5)] py-6 sm:py-8 overflow-hidden">
      {/* ── Top Blue Boundary Line ── */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#258591]/40 via-[#258591] to-[#258591]/40 shadow-[0_0_10px_#258591] pointer-events-none z-10" />

      {/* ── Bottom Blue Boundary Line ── */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#258591]/40 via-[#258591] to-[#258591]/40 shadow-[0_0_10px_#258591] pointer-events-none z-10" />

      {/* ── Category Header & Controls ── */}
      <div className="flex items-center justify-between px-6 sm:px-12 md:px-20 mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#258591] to-[#e8412b] flex items-center justify-center text-xl shadow-[0_0_15px_rgba(232,65,43,0.5)] border border-white/20">
            {category.icon}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow">
                {category.title}
              </h2>
            </div>
            <p className="text-xs text-white/70 font-medium hidden sm:block">
              {category.subtitle}
            </p>
          </div>
        </div>

        {/* Scroll Chevrons*/}
        <div className="flex items-center gap-2">
          <button
            onClick={scrollLeft}
            className="w-8 h-8 rounded-full bg-black/40 hover:bg-[#e8412b] text-white flex items-center justify-center border border-white/20 transition-all hover:scale-105 active:scale-95 shadow"
            title="Scroll Left"
          >
            <ChevronLeftIcon />
          </button>

          <button
            onClick={scrollRight}
            className="w-8 h-8 rounded-full bg-black/40 hover:bg-[#e8412b] text-white flex items-center justify-center border border-white/20 transition-all hover:scale-105 active:scale-95 shadow"
            title="Scroll Right"
          >
            <ChevronRightIcon />
          </button>
        </div>
      </div>

      {/* ── Edge-to-Edge Horizontal Infinite Scroll Track ── */}
      <div className="relative w-full overflow-hidden">
        <div
          ref={containerRef}
          onScroll={handleScroll}
          style={{
            maskImage:
              "linear-gradient(to right, transparent 0%, black 2%, black 98%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0%, black 2%, black 98%, transparent 100%)",
          }}
          className="flex items-center gap-6 overflow-x-auto no-scrollbar py-10 px-6 sm:px-12 md:px-16"
        >
          {repeatedSongs.map((song, idx) => {
            const isCenter = idx === centerItemIndex;
            const isCurrentlyPlaying = isPlaying && song.id === playingSongId;

            return (
              <div
                key={`${song.id}-${idx}`}
                ref={(el) => (itemRefs.current[idx] = el)}
                className="shrink-0"
              >
                <RecordPlayerSong
                  song={song}
                  isCenter={isCenter}
                  isPlaying={isCurrentlyPlaying}
                  onPlay={(s) => onPlaySong(s, category.songs)}
                  onFavorite={(id) => onToggleFavorite(id)}
                  onAddToPlaylist={(s) => onAddToPlaylist(s)}
                  onSelect={() => handleItemSelect(song, idx)}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
