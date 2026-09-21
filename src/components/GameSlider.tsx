"use client";

import type { CSSProperties } from "react";
import type { GameItem } from "@/data/games-data";

export default function GameSlider({
  title,
  titleHref,
  linkText,
  linkHref,
  games,
}: {
  title: string;
  titleHref: string;
  linkText: string;
  linkHref: string;
  games: GameItem[];
}) {
  return (
    <section className="section sliders__slider" data-v-bbc21d8c="" data-v-2c401be8="">
      <header className="section__header" data-v-2c401be8="">
        <div className="header-block" data-v-2c401be8="">
          <a href={titleHref} className="header-block__title-link" data-v-2c401be8="">
            <h2 className="section__title" data-v-2c401be8="">
              <span data-v-2c401be8="">{title}</span>
            </h2>
          </a>
        </div>
        <div data-v-2c401be8="" className="header-block header-block--no-gap">
          <a data-v-2c401be8="" href={linkHref} className="header-block__link">
            {linkText}{" "}
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
              {games.map((game) => (
                <li className="embla__slide" data-v-2c401be8="" key={game.href}>
                  <div className="embla__slide-inner" data-v-2c401be8="">
                    <div className="embla__list" data-v-2c401be8="">
                      <div className="embla__list-item" data-v-2c401be8="">
                        <div data-v-2c401be8="" data-v-4aba23a7="">
                          <div className="card-wrapper" role="button" tabIndex={0} data-v-4aba23a7="">
                            <a href={game.href} className="card card--default" data-v-4aba23a7="">
                              <div className="wrapper is-loaded card__image" data-v-4aba23a7="" data-v-1f9998f1="">
                                <picture data-v-1f9998f1="">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img className="img" draggable={false} src={game.image} alt={game.name} loading="lazy" width="131" height="175" data-v-1f9998f1="" />
                                </picture>
                              </div>
                              {game.top && (
                                <div data-v-4aba23a7="" className="card__badges">
                                  <div data-v-4aba23a7="" className="badges-block badges-block__top">
                                    <span data-v-4aba23a7="" className="card__badge card__badge--top">
                                      Top
                                    </span>
                                  </div>
                                </div>
                              )}
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
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
