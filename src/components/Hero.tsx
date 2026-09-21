"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { heroSlides } from "@/data/games-data";

// The captured markup shipped the slider's chrome — arrows, dots and the
// .dot__progress bar the stylesheet animates over var(--v6d62f876) — but none
// of the behaviour, since that lived in a Vue chunk. SLIDE_MS is the source of
// truth for both the timer and that CSS animation so the bar finishes exactly
// when the slide flips.
const SLIDE_MS = 7000;

export default function Hero() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = heroSlides.length;

  const go = useCallback(
    (delta: number) => setIndex((i) => (i + delta + count) % count),
    [count]
  );

  // An auto-advancing carousel is exactly what prefers-reduced-motion is for,
  // so honour it by leaving the slider on manual.
  const [autoplay, setAutoplay] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setAutoplay(!query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  // Keyed on `index` so any manual navigation restarts the dwell time rather
  // than flipping again a moment later.
  useEffect(() => {
    if (!autoplay || paused || count < 2) return;
    const id = window.setTimeout(() => go(1), SLIDE_MS);
    return () => window.clearTimeout(id);
  }, [index, autoplay, paused, count, go]);

  const touchStartX = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
    touchStartX.current = null;
  };

  const slide = heroSlides[index];

  return (
    <div
      className="home"
      data-v-7a7ce604=""
      data-v-f8b4a365=""
      style={{ touchAction: "pan-y" } as CSSProperties}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      role="region"
      aria-roledescription="carousel"
      aria-label="Promotions"
    >
      <div data-v-9cf2dd38="" data-v-f8b4a365="" className="dots dots--desktop home__dots" style={{ "--v6d62f876": `${SLIDE_MS}ms` } as CSSProperties}>
        <div data-v-9cf2dd38="" className="dots__wrap" onClick={() => go(-1)} role="button" tabIndex={0} aria-label="Previous slide">
          <span data-v-36d2042d="" data-v-9cf2dd38="" className="icon dots__arrow" data-name="chevron-left" style={{ "--fd873e1a": "16px", "--fefcc86a": "none", "--v28dfdb28": "contain" } as CSSProperties}>
            <svg data-v-36d2042d="" viewBox="0 0 24 24">
              <use data-v-36d2042d="" href="#icon-chevron-left" />
            </svg>
          </span>
        </div>
        {heroSlides.map((s, i) => (
          <div
            data-v-9cf2dd38=""
            className={`dot${i === index ? " dot--active" : ""}`}
            key={s.base}
            onClick={() => setIndex(i)}
            role="button"
            tabIndex={0}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === index}
          >
            {i === index && (
              // Remounted on every slide change (keyed by index) because
              // restarting a CSS animation otherwise needs a reflow hack.
              <div
                data-v-9cf2dd38=""
                className="dot__progress"
                key={index}
                style={{ animationPlayState: autoplay && !paused ? "running" : "paused" } as CSSProperties}
              />
            )}
          </div>
        ))}
        <div data-v-9cf2dd38="" className="dots__wrap" onClick={() => go(1)} role="button" tabIndex={0} aria-label="Next slide">
          <span data-v-36d2042d="" data-v-9cf2dd38="" className="icon dots__arrow" data-name="chevron-right" style={{ "--fd873e1a": "16px", "--fefcc86a": "none", "--v28dfdb28": "contain" } as CSSProperties}>
            <svg data-v-36d2042d="" viewBox="0 0 24 24">
              <use data-v-36d2042d="" href="#icon-chevron-right" />
            </svg>
          </span>
        </div>
      </div>
      <div className="wrapper home__image" data-v-f8b4a365="" data-v-3f8c07de="" style={{ position: "relative" } as CSSProperties}>
        {/* All slides stay mounted and cross-fade. Swapping a single <img> src
            flashes white while the next file decodes; the banners are
            transparent webp at ~430KB each, so holding them is the cheaper
            trade. */}
        {heroSlides.map((s, i) => (
          <picture data-v-3f8c07de="" key={s.base}>
            <source
              data-v-3f8c07de=""
              srcSet={`${s.base}@1x.webp 1x, ${s.base}@2x.webp 2x`}
              type="image/webp"
            />
            <img
              data-v-3f8c07de=""
              src={`${s.base}@1x.png`}
              srcSet={`${s.base}@1x.png 1x, ${s.base}@2x.png 2x`}
              alt={s.alt}
              className="banner-picture"
              aria-hidden={i !== index}
              fetchPriority={i === 0 ? "high" : "low"}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                // "contain", not the captured "cover": the banner is transparent
                // now, so there is no matte to bleed and cropping would cut the
                // characters.
                objectFit: "contain",
                objectPosition: "right center",
                opacity: i === index ? 1 : 0,
                transition: "opacity .45s ease-in-out",
                pointerEvents: "none",
              } as CSSProperties}
            />
          </picture>
        ))}
      </div>
      <div data-v-f8b4a365="" className="home__text home__text--wrap-span">
        <div data-v-f8b4a365="" className="top-text" />
        <div data-v-f8b4a365="" className="title-text">
          <p key={slide.base}>
            <span style={{ color: "#1d5bed" } as CSSProperties}>{slide.accent}</span>
            <br />
            {slide.title}
          </p>
        </div>
      </div>
      <div className="home__wrap" data-v-f8b4a365="">
        <button className="home__btn button-3d button-3d_md button-3d_red button-3d_center" type="button" data-auth-cta data-v-f8b4a365="" data-v-c8c96dbe="">
          <span className="button-3d__outer" data-v-c8c96dbe="">
            <span className="button-3d__inner" data-v-c8c96dbe="">
              <span className="button-3d__text" data-v-c8c96dbe="">
                Sign in & Join
              </span>
            </span>
          </span>
        </button>
        {/* Social / wallet sign-in: hidden until each button has real logic
            behind it, same as the row at the bottom of AuthModal.

        <div data-v-b513dc12="" data-v-1fba21b2="" data-v-f8b4a365="" className="login-variants home__login-variants">
          {[
            { id: "gmail", label: "Gmail", icon: "google-white" },
            { id: "metamask", label: "MetaMask", icon: "metamask-white" },
            { id: "telegram", label: "Telegram", icon: "telegram-white" },
            { id: "ton-connect", label: "Ton Connect", icon: "ton-wallet-white" },
            { id: "trust-wallet", label: "TrustWallet", icon: "trust-wallet-white" },
          ].map((v) => (
            <div data-v-b513dc12="" className="login-variant" key={v.id}>
              <div data-v-b513dc12="" className={`login-variant__tooltip login-variant__tooltip--${v.id}`}>
                {v.label}
              </div>
              <button data-auth-cta data-v-194e452b="" data-v-b513dc12="" className="login-variant__btn button-flat button-flat_md button-flat_grey1 button-flat_center" type="button">
                <span data-v-194e452b="" className="button-flat__inner">
                  <span data-v-194e452b="" className="button-flat__text">
                    <span data-v-36d2042d="" data-v-b513dc12="" className="icon" data-name={v.icon} style={{ "--fd873e1a": "24px", "--fefcc86a": "none", "--v28dfdb28": "contain" } as CSSProperties}>
                      <svg data-v-36d2042d="" viewBox="0 0 24 25">
                        <use data-v-36d2042d="" href={`#icon-${v.icon}`} />
                      </svg>
                    </span>
                  </span>
                </span>
              </button>
            </div>
          ))}
        </div>
        */}
      </div>
    </div>
  );
}
