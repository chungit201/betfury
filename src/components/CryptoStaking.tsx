"use client";

import type { CSSProperties } from "react";
import { stakingPools } from "@/data/games-data";
import { CarouselControls, useCarousel } from "./Carousel";

export default function CryptoStaking() {
  const { viewportRef, atStart, atEnd, scrollPrev, scrollNext } = useCarousel();

  return (
    <section className="section sliders__slider" data-v-bbc21d8c="" data-v-2c401be8="">
      <header className="section__header" data-v-2c401be8="">
        <div className="header-block" data-v-2c401be8="">
          <a href="/crypto-staking" className="header-block__title-link" data-v-2c401be8="">
            <h2 className="section__title" data-v-2c401be8="">
              <span data-v-2c401be8="">Crypto Staking</span>
            </h2>
          </a>
        </div>
        <div data-v-2c401be8="" className="header-block header-block--no-gap">
          <a data-v-2c401be8="" href="/crypto-staking" className="header-block__link">
            Go to Crypto Staking{" "}
          </a>
          <CarouselControls atStart={atStart} atEnd={atEnd} onPrev={scrollPrev} onNext={scrollNext} label="Crypto Staking" />
        </div>
      </header>
      <div className="section__content" data-v-2c401be8="">
        {/* The shared .embla grid sizes itself for nine game cards per row.
            Staking cards carry two lines of text side by side, so this row
            overrides the column width to six. */}
        <div
          className="embla"
          data-v-2c401be8=""
          style={{ "--column-width": "calc((100% - 5 * var(--gap)) / 6)" } as CSSProperties}
        >
          <div className="embla__viewport" data-v-2c401be8="" ref={viewportRef}>
            <ul className="embla__container" data-v-2c401be8="">
              {stakingPools.map((pool) => (
                <li className="embla__slide" data-v-2c401be8="" key={pool.ticker}>
                  <a
                    href={pool.href}
                    className={`staking-card${pool.featured ? " staking-card--featured" : ""}`}
                  >
                    <div className="staking-card__top">
                      {/* Plain <img>: five static 32px SVGs plus one small PNG
                          from public/, which next/image cannot meaningfully
                          optimise. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img className="staking-card__icon" src={pool.icon} alt="" width={32} height={32} loading="lazy" />
                      <div className="staking-card__names">
                        <span className="staking-card__name">{pool.name}</span>
                        <span className="staking-card__ticker">{pool.ticker}</span>
                      </div>
                      <div className="staking-card__rate">
                        <span className="staking-card__rate-label">
                          {pool.rateLabel}
                          {pool.featured && (
                            <span
                              data-v-36d2042d=""
                              className="icon staking-card__hint"
                              data-name="question"
                              style={{ "--fd873e1a": "12px", "--fefcc86a": "none", "--v28dfdb28": "contain" } as CSSProperties}
                            >
                              <svg data-v-36d2042d="" viewBox="0 0 24 24">
                                <use data-v-36d2042d="" href="#icon-question" />
                              </svg>
                            </span>
                          )}
                        </span>
                        <span className="staking-card__rate-value">{pool.rate}</span>
                      </div>
                    </div>
                    <div className="staking-card__bottom">
                      <span className="staking-card__duration-label">Duration</span>
                      <span className="staking-card__duration-value">{pool.duration}</span>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
