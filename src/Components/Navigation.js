import React from "react";
import { Link, useLocation } from "react-router-dom";

/* ── SVG Icons ── */
const PlayerIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>
);

const LibraryIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    <line x1="9" y1="7" x2="15" y2="7"/>
    <line x1="9" y1="11" x2="13" y2="11"/>
  </svg>
);

const TrendingIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
    <polyline points="17 6 23 6 23 12"/>
  </svg>
);

const HeartIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const FeedIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 11a9 9 0 0 1 9 9"/>
    <path d="M4 4a16 16 0 0 1 16 16"/>
    <circle cx="5" cy="19" r="1"/>
  </svg>
);

const navItems = [
  { path: "/", alternate: "/player", label: "Now Playing", shortLabel: "Player", Icon: PlayerIcon },
  { path: "/library", label: "Library", shortLabel: "Library", Icon: LibraryIcon },
  { path: "/trending", label: "Trending", shortLabel: "Trending", Icon: TrendingIcon },
  { path: "/favourites", label: "Favourites", shortLabel: "Favourites", Icon: HeartIcon },
  { path: "/feed", alternate: "/discover", label: "Discover Feed", shortLabel: "Discover", Icon: FeedIcon },
];

export default function Navigation() {
  const location = useLocation();

  const isItemActive = (item) => {
    if (location.pathname === item.path) return true;
    if (item.alternate && location.pathname === item.alternate) return true;
    return false;
  };

  return (
    <nav
      className={`
        /* ── MOBILE VIEW: Sticky at the bottom, edge-to-edge, horizontal ── */
        fixed bottom-0 left-0 right-0 z-40 w-full h-16 sm:h-18
        flex flex-row items-center justify-around px-2 py-1
        bg-[#0c2d33]/95 backdrop-blur-2xl
        border-t border-white/20
        shadow-[0_-10px_35px_rgba(0,0,0,0.7),0_-2px_15px_rgba(37,133,145,0.25)]
        select-none pb-[calc(0.35rem+env(safe-area-inset-bottom,0px))]

        /* ── DESKTOP / WEB VIEW: Floating vertical pill on the left center (UNTOUCHED) ── */
        md:fixed md:left-3 md:sm:left-4 md:md:left-5 md:top-1/2 md:-translate-y-1/2 md:bottom-auto md:right-auto
        md:w-auto md:h-auto md:flex-col md:justify-center md:gap-2.5
        md:p-2 md:sm:p-2.5 md:rounded-3xl md:border md:border-white/20
        md:bg-[#103d44]/80 md:backdrop-blur-2xl
        md:shadow-[0_12px_40px_rgba(0,0,0,0.6),0_0_25px_rgba(232,65,43,0.25),inset_0_1px_0_rgba(255,255,255,0.2)]
      `}
      aria-label="Sidebar Navigation"
    >
      {navItems.map((item) => {
        const active = isItemActive(item);
        const { path, label, shortLabel, Icon } = item;

        return (
          <div key={path} className="relative group flex flex-col md:flex-row items-center">
            {/* Navigation Icon Link */}
            <Link
              to={path}
              aria-label={label}
              className={`flex flex-col md:flex-row items-center justify-center p-1 sm:p-1.5 md:p-0 rounded-xl md:rounded-2xl transition-all duration-200 relative ${
                active
                  ? "text-white scale-105"
                  : "text-white/70 hover:text-white hover:scale-105 md:hover:scale-110"
              }`}
            >
              {/* Icon Container: Gradient when active, hover sheen on desktop */}
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 flex items-center justify-center rounded-xl md:rounded-2xl transition-all duration-200 relative ${
                  active
                    ? "bg-gradient-to-tr from-[#2d8a95] via-[#cf3420] to-[#e8412b] text-white shadow-[0_0_18px_rgba(232,65,43,0.7)] border border-white/40"
                    : "hover:bg-white/15"
                }`}
              >
                <Icon />

                {/* Mobile Active Glow Pip */}
                {active && (
                  <span className="md:hidden absolute -bottom-0.5 w-1 h-1 bg-white rounded-full shadow-[0_0_6px_#ffffff]" />
                )}
              </div>

              {/* Mobile text label under icon */}
              <span
                className={`text-[9px] sm:text-[10px] mt-0.5 tracking-tight md:hidden ${
                  active ? "font-black text-white" : "font-medium text-white/70"
                }`}
              >
                {shortLabel}
              </span>

              {/* Active glow dot on desktop */}
              {active && (
                <span className="hidden md:block absolute -bottom-1 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_#ffffff]" />
              )}
            </Link>

            {/* Desktop Hover Tooltip (hidden on mobile, reveals on desktop hover) */}
            <div className="hidden md:flex absolute left-full ml-3.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-[#0e353c]/95 backdrop-blur-xl border border-white/25 text-white text-xs font-bold whitespace-nowrap shadow-[0_8px_25px_rgba(0,0,0,0.6),0_0_15px_rgba(232,65,43,0.3)] opacity-0 -translate-x-2 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 ease-out z-50 items-center gap-1.5">
              <span>{label}</span>
              <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#0e353c] border-l border-b border-white/25 rotate-45" />
            </div>
          </div>
        );
      })}
    </nav>
  );
}
