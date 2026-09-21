"use client";

import type { CSSProperties } from "react";
import { topSports } from "@/data/games-data";

export default function SportsRow() {
  return (
    <section className="section sliders__slider" data-v-bbc21d8c="" data-v-2c401be8="">
      <header className="section__header" data-v-2c401be8="">
        <div className="header-block" data-v-2c401be8="">
          <a href="/sports" className="header-block__title-link" data-v-2c401be8="">
            <h2 className="section__title" data-v-2c401be8="">
              <span data-v-2c401be8="">TOP Sports</span>
            </h2>
          </a>
        </div>
        <div data-v-2c401be8="" className="header-block header-block--no-gap">
          <a data-v-2c401be8="" href="/sports" className="header-block__link">
            Go to Sports{" "}
          </a>
          <div data-v-2c401be8="" className="carousel-controls">
            <button data-v-30d1fca4="" data-v-2c401be8="" type="button" className="control-button">
              <span data-v-36d2042d="" data-v-30d1fca4="" className="icon" style={{ "--fd873e1a": "20px", "--fefcc86a": "none", "--v28dfdb28": "contain" } as CSSProperties} data-name="chevron-left">
                <svg data-v-36d2042d="" viewBox="0 0 24 24">
                  <use data-v-36d2042d="" href="#icon-chevron-left" />
                </svg>
              </span>
            </button>
            <button data-v-30d1fca4="" data-v-2c401be8="" type="button" className="control-button">
              <span data-v-36d2042d="" data-v-30d1fca4="" className="icon" style={{ "--fd873e1a": "20px", "--fefcc86a": "none", "--v28dfdb28": "contain" } as CSSProperties} data-name="chevron-right">
                <svg data-v-36d2042d="" viewBox="0 0 24 24">
                  <use data-v-36d2042d="" href="#icon-chevron-right" />
                </svg>
              </span>
            </button>
          </div>
        </div>
      </header>
      <div className="section__content" style={{ minHeight: "171px" } as CSSProperties} data-v-2c401be8="">
        <div className="embla" data-v-2c401be8="">
          <div className="embla__viewport" data-v-2c401be8="">
            <ul className="embla__container" data-v-2c401be8="">
              {topSports.map((s) => (
                <li className="embla__slide" data-v-2c401be8="" key={s.href}>
                  <div className="embla__slide-inner" data-v-2c401be8="">
                    <a href={s.href} className="sport unlink" data-v-bbc21d8c="">
                      <span style={{ "--fd873e1a": "24px", "--fefcc86a": "none", "--v28dfdb28": "contain" } as CSSProperties} className="icon sport__icon" data-v-bbc21d8c="" data-v-36d2042d="" data-name={s.icon}>
                        <svg data-v-36d2042d="" viewBox="0 0 19 20">
                          <use href={`#icon-${s.icon}`} data-v-36d2042d="" />
                        </svg>
                      </span>
                      <div className="sport__name" data-v-bbc21d8c="">
                        {s.name}
                      </div>
                      {s.hot && (
                        <div className="sport__hot" data-v-bbc21d8c="">
                          Hot
                        </div>
                      )}
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
