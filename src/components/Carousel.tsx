"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

/**
 * The captured markup is Embla Carousel's DOM — `.embla > .embla__viewport >
 * .embla__container` with the arrows in `.carousel-controls` — but the Embla
 * instance itself lived in a Vue chunk that was never captured, so the rows
 * rendered as a clipped strip with dead arrows.
 *
 * Rather than pull in embla-carousel just to move a row sideways, this drives
 * the existing markup with native overflow scrolling: the viewport becomes the
 * scroll container and the arrows call scrollBy on it. That also gets
 * trackpad, touch-drag and keyboard scrolling for free, which a JS-transform
 * carousel would have to reimplement.
 */
export function useCarousel<T extends HTMLElement = HTMLDivElement>() {
  const viewportRef = useRef<T>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(true);

  const sync = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    // Sub-pixel layout means scrollLeft rarely lands exactly on 0 or max.
    setAtStart(el.scrollLeft <= 1);
    setAtEnd(el.scrollLeft >= max - 1);
  }, []);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    sync();
    el.addEventListener("scroll", sync, { passive: true });
    // Column width is derived from the container width, so the reachable
    // scroll range changes whenever the row is resized — including when the
    // sidebar collapses.
    const observer = new ResizeObserver(sync);
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", sync);
      observer.disconnect();
    };
  }, [sync]);

  const scrollPage = useCallback((direction: 1 | -1) => {
    const el = viewportRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(".embla__slide");
    // Advance by a viewport minus one card so the card that was at the edge
    // stays on screen as an anchor, rather than jumping a clean page and
    // leaving the reader with no overlap.
    const step = card
      ? Math.max(el.clientWidth - card.offsetWidth, card.offsetWidth)
      : el.clientWidth;
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: direction * step, behavior: smooth ? "smooth" : "auto" });
  }, []);

  return {
    viewportRef,
    atStart,
    atEnd,
    scrollPrev: useCallback(() => scrollPage(-1), [scrollPage]),
    scrollNext: useCallback(() => scrollPage(1), [scrollPage]),
  };
}

const ICON_STYLE = {
  "--fd873e1a": "20px",
  "--fefcc86a": "none",
  "--v28dfdb28": "contain",
} as CSSProperties;

export function CarouselControls({
  atStart,
  atEnd,
  onPrev,
  onNext,
  label,
}: {
  atStart: boolean;
  atEnd: boolean;
  onPrev: () => void;
  onNext: () => void;
  label: string;
}) {
  return (
    <div data-v-2c401be8="" className="carousel-controls">
      <button
        data-v-30d1fca4=""
        data-v-2c401be8=""
        type="button"
        className="control-button"
        onClick={onPrev}
        disabled={atStart}
        aria-label={`Scroll ${label} left`}
      >
        <span data-v-36d2042d="" data-v-30d1fca4="" className="icon" style={ICON_STYLE} data-name="chevron-left">
          <svg data-v-36d2042d="" viewBox="0 0 24 24">
            <use data-v-36d2042d="" href="#icon-chevron-left" />
          </svg>
        </span>
      </button>
      <button
        data-v-30d1fca4=""
        data-v-2c401be8=""
        type="button"
        className="control-button"
        onClick={onNext}
        disabled={atEnd}
        aria-label={`Scroll ${label} right`}
      >
        <span data-v-36d2042d="" data-v-30d1fca4="" className="icon" style={ICON_STYLE} data-name="chevron-right">
          <svg data-v-36d2042d="" viewBox="0 0 24 24">
            <use data-v-36d2042d="" href="#icon-chevron-right" />
          </svg>
        </span>
      </button>
    </div>
  );
}
