"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { inhouseGames, topSlots, type GameItem } from "@/data/games-data";
import { CarouselControls, useCarousel } from "./Carousel";

// Originals lead, as on the reference: they are the house's own games.
const ALL_GAMES: GameItem[] = [...inhouseGames, ...topSlots];
const MIN_QUERY = 3;

function GameTile({ game }: { game: GameItem }) {
  return (
    <a href={game.href} className="search-tile" title={game.name}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={game.image} alt={game.name} loading="lazy" draggable={false} width={131} height={175} />
    </a>
  );
}

// Its own component so useCarousel mounts with the row: the hook reads its
// viewport once, on mount, and the row comes and goes with the query.
function Suggestions() {
  const { viewportRef, atStart, atEnd, scrollPrev, scrollNext } = useCarousel();
  return (
    <>
      <div className="search-modal__section-head">
        <h3 className="search-modal__section-title">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M2 10h3.5v11H2zm5.5 11V10.2l4.9-7.6a1.6 1.6 0 0 1 2.9 1.2L14.3 9H20a2 2 0 0 1 2 2.3l-1.4 8A2 2 0 0 1 18.6 21z"
            />
          </svg>
          Games you should try
        </h3>
        <CarouselControls atStart={atStart} atEnd={atEnd} onPrev={scrollPrev} onNext={scrollNext} label="Games you should try" />
      </div>
      <div className="search-modal__row" ref={viewportRef}>
        <a href="/casino/random" className="search-tile search-tile--random">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <use href="#icon-dice" />
          </svg>
          <span>Random Game</span>
        </a>
        {ALL_GAMES.map((game) => (
          <GameTile key={game.href} game={game} />
        ))}
      </div>
    </>
  );
}

/**
 * Header search. Filters the games already on the home page by name; with
 * fewer than three characters it shows suggestions instead.
 *
 * Tiles are plain links. Their destinations are unbuilt, so AppShell's click
 * interceptor turns them into the sign-in dialog; this only has to get itself
 * out of the way, which the list's onClick does.
 */
export default function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  const trimmed = query.trim().toLowerCase();
  const searching = trimmed.length >= MIN_QUERY;
  const results = useMemo(
    () => (searching ? ALL_GAMES.filter((g) => g.name.toLowerCase().includes(trimmed)) : []),
    [searching, trimmed]
  );

  if (!open) return null;

  return (
    <div className="search-overlay" onMouseDown={onClose}>
      <div
        className="search-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Search"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("a")) onClose();
        }}
      >
        <div className="search-modal__head">
          <h2 className="search-modal__title">Search</h2>
          <button type="button" className="search-modal__close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <label className="search-modal__field">
          <svg className="search-modal__field-icon" viewBox="0 0 24 24" aria-hidden="true">
            <use href="#icon-search" />
          </svg>
          <input
            ref={inputRef}
            type="search"
            className="search-modal__input"
            placeholder="Start entering the game's name or theme"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search games"
          />
        </label>

        {searching ? (
          results.length ? (
            <div className="search-modal__results">
              {results.map((game) => (
                <GameTile key={game.href} game={game} />
              ))}
            </div>
          ) : (
            <p className="search-modal__hint">No games match &ldquo;{query.trim()}&rdquo;</p>
          )
        ) : (
          <>
            <p className="search-modal__hint">Enter at least {MIN_QUERY} symbols to start searching</p>
            <Suggestions />
          </>
        )}
      </div>
    </div>
  );
}
